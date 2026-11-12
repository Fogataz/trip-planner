const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');
const Trip = require('../models/Trip');
const TripMember = require('../models/TripMember');
const User = require('../models/User');
const crypto = require('crypto');
const { GALLERY, isGalleryKey, isCoverAssetId } = require('../config/coverGallery');
const { generateTravelSuggestions } = require('../services/travelSuggestions');
const { requestLanguage } = require('../services/language');
const { generateItinerary } = require('../services/itineraryBuilder');
const ActivityLog = require('../models/ActivityLog');
const { logItineraryChange, logTripUpdate } = require('../services/activityLogger');
const { notifyTrip } = require('../services/notifications');
const { can, ALL_CAPABILITIES } = require('../services/permissions');
const { loadMember, presentTrip, allMembers } = require('../services/membership');
const { requireCapability } = require('../middleware/requireCapability');

const router = express.Router();

// Get Socket.io instance (injected by server)
let io;
router.setIO = (socketIO) => {
  io = socketIO;
};

// Respond 403 and return null when the caller may not do `capability` here.
// Every access decision in this file goes through can() — G5 · One helper.
// Returns the loaded TripMember so the body never queries it again.
async function denyUnless(trip, req, res, capability) {
  const member = await loadMember(trip.groupId, req.user.uid);
  if (!can(member, trip, capability)) {
    if (!member || member.status !== 'active') {
      res.status(403).json({ error: 'You do not have access to this trip.' });
    } else {
      res.status(403).json({ error: 'You cannot do this on this trip.', capability });
    }
    return null;
  }
  return member;
}

// Approximate trip length, used when there is no end date. Returns undefined when absent or invalid.
function parseDuration(value) {
  if (!value || typeof value !== 'object') return undefined;
  const min = Math.round(Number(value.min));
  const max = Math.round(Number(value.max ?? value.min));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max > 365 || min > max) return undefined;
  return { min, max };
}

// Create a new trip
router.post('/', async (req, res) => {
  try {
    const { name, destination, origin, startDate, endDate } = req.body;
    const durationDays = endDate ? undefined : parseDuration(req.body.durationDays);
    const groupId = uuidv4();
    const userId = req.user.uid;

    // Get user email
    const user = await User.findOne({ uid: userId });
    const userEmail = user?.email || null;

    // kind decides the guest preset and the words roles are shown with
    // (spec 011 §5.2, spec 012 §5.3). It defaults to personal: a trip with
    // people you know, which is every trip the product makes today.
    const kind = req.body?.kind === 'hosted' ? 'hosted' : 'personal';

    const trip = new Trip({
      name,
      groupId,
      destination,
      origin,
      startDate,
      endDate,
      durationDays,
      kind,
      // O1 · Organization never required: a new trip is personally owned.
      orgId: null,
      createdBy: userId,
      // The embedded array is deprecated and kept in step only so a rollback
      // of this slice finds what it expects. TripMember below is the truth.
      members: [{ userId, email: userEmail, role: 'organizer', status: 'active' }],
    });

    await trip.save();

    // The creator is the host. On a personal trip that word is shown as
    // "Organizer", which is what they saw before (spec 012 §5.3).
    const creator = await TripMember.create({
      tripId: trip._id,
      groupId: trip.groupId,
      userId,
      email: userEmail,
      role: 'host',
      status: 'active',
      joinedAt: new Date(),
    });

    ensureSuggestions(trip, requestLanguage(req));

    res.status(201).json(presentTrip(trip, creator, [creator]));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all trips for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.uid;
    // Only an active TripMember grants anything (R-F3). A requested, invited,
    // left or removed person's trips are not theirs to list.
    const memberships = await TripMember.find({ userId, status: 'active' });
    const tripIds = memberships.map((m) => m.tripId);
    const trips = await Trip.find({ _id: { $in: tripIds } });

    // One query for every trip's members rather than one per trip.
    const everyone = await TripMember.find({ tripId: { $in: tripIds } });
    const byTrip = new Map();
    for (const m of everyone) {
      const key = String(m.tripId);
      if (!byTrip.has(key)) byTrip.set(key, []);
      byTrip.get(key).push(m);
    }
    const mine = new Map(memberships.map((m) => [String(m.tripId), m]));

    res.json(
      trips.map((trip) =>
        presentTrip(trip, mine.get(String(trip._id)), byTrip.get(String(trip._id)) || [])
      )
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate suggestions in the background once a destination exists; retry failures after a cooldown
const generating = new Set();
const RETRY_AFTER_MS = 30 * 1000;
const LANGUAGE_REGEN_COOLDOWN_MS = 10 * 60 * 1000; // limits cost when members of one trip use different languages

function ensureSuggestions(trip, language) {
  const existing = trip.travelSuggestions;
  // Suggestions saved before language support were written in English
  const languageMismatch =
    existing?.raw_suggestions &&
    (existing.language || 'en') !== language &&
    Date.now() - new Date(existing.generatedAt || 0) > LANGUAGE_REGEN_COOLDOWN_MS;
  const hasResult = existing && !existing.error && !languageMismatch;
  const recentlyFailed = existing?.error && Date.now() - new Date(existing.failedAt || 0) < RETRY_AFTER_MS;
  const id = String(trip._id);

  if (hasResult || recentlyFailed || generating.has(id) || !trip.destination?.address) return;

  generating.add(id);
  (async () => {
    try {
      let suggestions = await generateTravelSuggestions(trip, language);
      if (suggestions.error) suggestions = { ...suggestions, failedAt: new Date() };
      await Trip.findByIdAndUpdate(trip._id, { travelSuggestions: suggestions });
      if (io) io.to(`trip:${trip.groupId}`).emit('trip:suggestionsUpdated', { travelSuggestions: suggestions });
    } catch (err) {
      console.error('Error in suggestions pipeline:', err.message);
    } finally {
      generating.delete(id);
    }
  })();
}

// Recent activity for a trip ("since you were away" on Overview). Members only.
router.get('/:groupId/activity', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.view');
    if (!me) return;

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
    const since = req.query.since ? new Date(req.query.since) : null;
    const query = { groupId: trip.groupId };
    if (since && !isNaN(since)) query.timestamp = { $gt: since };

    const entries = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('action targetType targetId targetDetails changes description userId userEmail timestamp')
      .lean();
    res.json(entries);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get a specific trip
router.get('/:groupId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.view');
    if (!me) return;
    ensureSuggestions(trip, requestLanguage(req));
    // The payload carries the viewer's resolved capability list, so the client
    // renders its controls from capabilities and never from a role (R-F11).
    res.json(presentTrip(trip, me, await allMembers(trip._id)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a trip
router.put('/:groupId', async (req, res) => {
  try {
    const { name, destination, origin, startDate, endDate } = req.body;
    const existing = await Trip.findOne({ groupId: req.params.groupId });
    if (!existing) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(existing, req, res, 'trip.edit');
    if (!me) return;
    const trip = await Trip.findOneAndUpdate(
      { groupId: req.params.groupId },
      {
        name,
        destination,
        origin,
        startDate,
        endDate,
        // An end date replaces the approximate length; without one, keep or set it
        ...(endDate
          ? { $unset: { durationDays: 1 } }
          : req.body.durationDays !== undefined && { durationDays: parseDuration(req.body.durationDays) }),
        updatedAt: new Date(),
      },
      { new: true }
    );
    // Not the raw document: that carries the deprecated embedded members
    // array, which is no longer written and is therefore stale.
    res.json(presentTrip(trip, me, await allMembers(trip._id)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a trip
router.delete('/:groupId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.delete');
    if (!me) return;
    await Trip.deleteOne({ groupId: req.params.groupId });
    await deleteUploadedAsset(trip.cover);
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Turn one guest capability on or off for this trip.
//
// AC 4: "Given a host turns on 'guests can add schedule items' for a hosted
// trip, then a guest can add one, and no other guest capability changes."
// can() has honoured Trip.guestPermissions since this slice began, but
// nothing could SET it, so the criterion was only half true (review finding
// 8). This is the whole of the missing half; the screen is a later slice.
//
// Overrides the guest column and nothing else (spec 011 §5.2), so it can
// never grant a guest something the host does not have.
router.patch('/:groupId/guest-permissions', requireCapability('trip.setGuestPermissions'), async (req, res) => {
  try {
    const { capability, allowed } = req.body || {};
    if (!ALL_CAPABILITIES.includes(capability)) {
      return res.status(400).json({ error: 'Unknown capability.', capability });
    }
    if (typeof allowed !== 'boolean' && allowed !== null) {
      return res.status(400).json({ error: 'allowed must be true, false or null to clear the override.' });
    }

    const trip = req.trip;
    const overrides = (trip.guestPermissions || []).filter((e) => e.capability !== capability);
    if (allowed !== null) overrides.push({ capability, allowed });
    trip.guestPermissions = overrides;
    trip.updatedAt = new Date();
    await trip.save();

    if (io) {
      // Everyone's capability list may have just changed, so the clients
      // re-fetch rather than keep controls they no longer have.
      io.to(`trip:${trip.groupId}`).emit('trip:access-changed', { tripId: trip.groupId });
    }

    res.json(presentTrip(trip, req.member, await allMembers(trip._id)));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set where the group is staying (used to make AI suggestions local and concrete)
router.put('/:groupId/accommodation', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    // Accommodation is part of "name, dates, place, accommodation, cover"
    // in the table, so it is trip.edit — unchanged for a personal trip,
    // and closed to a guest on a hosted one (spec 011 §5.1, F6).
    const me = await denyUnless(trip, req, res, 'trip.edit');
    if (!me) return;

    const name = String(req.body?.name || '').trim().slice(0, 200);
    const address = String(req.body?.address || '').trim().slice(0, 300);
    trip.accommodation = { name, address };
    trip.travelSuggestions = null; // regenerated for the new area on next load
    trip.updatedAt = new Date();
    await trip.save();

    if (io) io.to(`trip:${trip.groupId}`).emit('trip:accommodationUpdated', { accommodation: trip.accommodation });
    res.json(trip.accommodation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ---------- Trip cover ----------

const MAX_COVER_BYTES = 2 * 1024 * 1024;

// Uploads are already resized in the browser, so the cap here is a backstop, not a budget
const coverUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  keyGenerator: (req) => req.user?.uid || 'anonymous',
  message: { error: 'Too many cover uploads. Try again in a little while.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const rawImageBody = express.raw({
  type: ['image/webp', 'image/jpeg', 'image/png'],
  limit: MAX_COVER_BYTES,
});

// Translate body-parser failures into the JSON shape the client shows inline
function readImageBody(req, res, next) {
  rawImageBody(req, res, (err) => {
    if (!err) return next();
    if (err.type === 'entity.too.large') {
      return res.status(413).json({ error: 'That image is too large. Keep it under 2 MB.' });
    }
    return res.status(400).json({ error: 'Could not read that image.' });
  });
}

// Trust the bytes, not the file name: a PDF renamed to .jpg fails here
function sniffImageType(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

const coverBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'covers' });

// Uploaded covers are stored under a random 128-bit id rather than an ObjectId.
// ObjectIds are timestamp + counter, so neighbouring ones can be guessed; this id
// is what makes the unauthenticated GET /api/covers/:id safe (see routes/covers.js).
const newCoverAssetId = () => crypto.randomBytes(16).toString('hex');

// Replacing or removing a cover drops the asset it was using, so GridFS never collects orphans
async function deleteUploadedAsset(cover) {
  if (!cover || cover.source !== 'upload' || !isCoverAssetId(cover.key)) return;
  try {
    await coverBucket().delete(cover.key);
  } catch (err) {
    console.warn('Could not delete previous cover asset:', err.message);
  }
}

function clampFocal(value, fallback = 50) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(100, Math.max(0, Math.round(n)));
}

async function memberEmail(trip, uid) {
  const member = await loadMember(trip.groupId, uid);
  return member?.email || null;
}

async function persistCover(trip, req, description) {
  trip.updatedAt = new Date();
  await trip.save();
  if (io) io.to(`trip:${trip.groupId}`).emit('trip:coverUpdated', { cover: trip.cover });
  logTripUpdate(trip._id, trip.groupId, req.user.uid, await memberEmail(trip, req.user.uid), null, trip.cover, description);
  return trip.cover;
}

// Set a gallery cover, or update the focal point / alt text of the current one
router.put('/:groupId/cover', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.edit');
    if (!me) return;

    const { source, key, focalY, alt } = req.body || {};

    if (source === 'gallery') {
      if (!isGalleryKey(key)) return res.status(400).json({ error: 'Unknown gallery cover' });
      const entry = GALLERY[key];
      await deleteUploadedAsset(trip.cover);
      trip.cover = {
        source: 'gallery',
        key,
        focalY: clampFocal(focalY, entry.focalY),
        dominantColor: entry.dominantColor,
        alt: typeof alt === 'string' && alt.trim() ? alt.trim().slice(0, 200) : entry.alt,
        setBy: req.user.uid,
        setAt: new Date(),
      };
      return res.json(await persistCover(trip, req, 'changed the trip cover'));
    }

    if (!trip.cover) return res.status(404).json({ error: 'This trip has no cover yet' });

    if (focalY !== undefined) trip.cover.focalY = clampFocal(focalY, trip.cover.focalY);
    if (typeof alt === 'string') trip.cover.alt = alt.trim().slice(0, 200);
    trip.cover.setBy = req.user.uid;
    trip.cover.setAt = new Date();

    res.json(await persistCover(trip, req, 'repositioned the trip cover'));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Upload a cover. The browser has already resized it; the body is the raw image.
router.post('/:groupId/cover/upload', coverUploadLimiter, readImageBody, async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.edit');
    if (!me) return;

    const contentType = sniffImageType(req.body);
    if (!contentType) {
      return res.status(415).json({ error: "That file isn't an image we can use. Try JPG, PNG or WebP." });
    }

    const previous = trip.cover;
    const bucket = coverBucket();
    const upload = bucket.openUploadStreamWithId(newCoverAssetId(), `${trip.groupId}-cover`, {
      metadata: { groupId: trip.groupId, uploadedBy: req.user.uid, contentType },
    });

    await new Promise((resolve, reject) => {
      upload.on('error', reject);
      upload.on('finish', resolve);
      upload.end(req.body);
    });

    trip.cover = {
      source: 'upload',
      key: upload.id,
      focalY: clampFocal(req.query.focalY, 50),
      dominantColor: /^#[0-9a-f]{6}$/i.test(String(req.query.color || '')) ? String(req.query.color) : null,
      alt: String(req.query.alt || '').trim().slice(0, 200) || `Cover image for ${trip.name}`,
      width: Number(req.query.w) || null,
      height: Number(req.query.h) || null,
      setBy: req.user.uid,
      setAt: new Date(),
    };

    const saved = await persistCover(trip, req, 'changed the trip cover');
    await deleteUploadedAsset(previous);
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Remove the cover and its asset; the trip falls back to its default gradient
router.delete('/:groupId/cover', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'trip.edit');
    if (!me) return;

    const previous = trip.cover;
    trip.cover = null;
    await persistCover(trip, req, 'removed the trip cover');
    await deleteUploadedAsset(previous);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Generate itinerary items with AI and add them to the trip
router.post('/:groupId/itinerary/generate', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const me = await denyUnless(trip, req, res, 'schedule.edit');
    if (!me) return;
    if (!trip.destination?.address) {
      return res.status(400).json({ error: 'Trip needs a destination first' });
    }

    const items = await generateItinerary(trip, req.body?.preferences, requestLanguage(req));
    if (items.length === 0) {
      return res.status(502).json({ error: 'AI did not return any stops. Please try again.' });
    }

    // Draft mode (spec 004 section 7.5): the assistant proposes, the group decides. Nothing is saved;
    // each stop the person accepts is added through the normal add-stop route, which logs and broadcasts it.
    if (req.body?.draft) {
      return res.json({ drafts: items });
    }

    // Re-read so items added while the AI was working are not overwritten
    const fresh = await Trip.findOne({ groupId: req.params.groupId });
    const before = fresh.itinerary.length;
    items.forEach((item) =>
      fresh.itinerary.push({ ...item, createdBy: req.user.uid, createdAt: new Date(), version: 1 })
    );
    fresh.updatedAt = new Date();
    await fresh.save();

    const added = fresh.itinerary.slice(before);
    if (io) {
      added.forEach((item) =>
        io.to(`trip:${fresh.groupId}`).emit('itinerary:itemAdded', { item, addedBy: req.user.uid })
      );
    }

    res.status(201).json(added);
  } catch (error) {
    console.error('Itinerary generation error:', error.message);
    res.status(500).json({ error: 'Could not generate itinerary: ' + error.message });
  }
});

// Add itinerary item
router.post('/:groupId/itinerary', async (req, res) => {
  try {
    const { stop, time, transport, notes } = req.body;
    const trip = await Trip.findOne({ groupId: req.params.groupId });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'schedule.edit');
    if (!me) return;

    const user = await User.findOne({ uid: req.user.uid });

    const itineraryItem = {
      stop,
      time: new Date(time),
      transport,
      notes,
      createdBy: req.user.uid,
      createdAt: new Date(),
      version: 1,
    };

    trip.itinerary.push(itineraryItem);
    trip.updatedAt = new Date();
    await trip.save();

    const addedItem = trip.itinerary[trip.itinerary.length - 1];

    // Log activity
    logItineraryChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      user?.email,
      addedItem._id.toString(),
      'itinerary_added',
      { after: { stop, time } },
      `Added stop: ${stop}`
    ).catch((err) => console.error('Activity log error:', err.message));

    // Broadcast real-time event
    if (io) {
      io.to(`trip:${trip.groupId}`).emit('itinerary:itemAdded', {
        item: addedItem,
        addedBy: req.user.uid,
      });
    }

    notifyTrip(trip, req.user.uid, {
      title: trip.name,
      body: `${user?.email || 'Someone'} added a stop: ${stop}`,
    });

    res.status(201).json(addedItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update itinerary item
router.put('/:groupId/itinerary/:itemId', async (req, res) => {
  try {
    const { stop, time, transport, notes, version } = req.body;
    const trip = await Trip.findOne({ groupId: req.params.groupId });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'schedule.edit');
    if (!me) return;

    const itineraryItem = trip.itinerary.id(req.params.itemId);
    if (!itineraryItem) {
      return res.status(404).json({ error: 'Itinerary item not found' });
    }

    // Check version for conflict detection
    const currentVersion = itineraryItem.version || 1;
    if (version && version !== currentVersion) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Item was updated by another user',
        currentVersion,
        expectedVersion: version,
      });
    }

    // Store old state for activity log
    const before = {
      stop: itineraryItem.stop,
      time: itineraryItem.time,
      transport: itineraryItem.transport,
      notes: itineraryItem.notes,
    };

    if (stop !== undefined) itineraryItem.stop = stop;
    if (time !== undefined) itineraryItem.time = new Date(time);
    if (transport !== undefined) itineraryItem.transport = transport;
    if (notes !== undefined) itineraryItem.notes = notes;

    itineraryItem.updatedBy = req.user.uid;
    itineraryItem.updatedAt = new Date();
    itineraryItem.version = (currentVersion || 1) + 1;

    trip.updatedAt = new Date();
    await trip.save();

    const user = await User.findOne({ uid: req.user.uid });

    // Log activity
    logItineraryChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      user?.email,
      req.params.itemId,
      'itinerary_updated',
      { before, after: { stop, time, transport, notes } },
      `Updated stop: ${stop}`
    ).catch((err) => console.error('Activity log error:', err.message));

    // Broadcast real-time event
    if (io) {
      io.to(`trip:${trip.groupId}`).emit('itinerary:itemUpdated', {
        itemId: req.params.itemId,
        item: itineraryItem,
        updatedBy: req.user.uid,
        version: itineraryItem.version,
      });
    }

    notifyTrip(trip, req.user.uid, {
      title: trip.name,
      body: `Stop updated: ${itineraryItem.stop}`,
    });

    res.json(itineraryItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete itinerary item
router.delete('/:groupId/itinerary/:itemId', async (req, res) => {
  try {
    const trip = await Trip.findOne({ groupId: req.params.groupId });

    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    const me = await denyUnless(trip, req, res, 'schedule.edit');
    if (!me) return;

    const deletedItem = trip.itinerary.id(req.params.itemId);
    if (!deletedItem) {
      return res.status(404).json({ error: 'Itinerary item not found' });
    }

    trip.itinerary = trip.itinerary.filter(
      (item) => item._id.toString() !== req.params.itemId
    );
    trip.updatedAt = new Date();
    await trip.save();

    const user = await User.findOne({ uid: req.user.uid });

    // Log activity
    logItineraryChange(
      trip._id,
      trip.groupId,
      req.user.uid,
      user?.email,
      req.params.itemId,
      'itinerary_deleted',
      { deleted: deletedItem },
      `Deleted stop: ${deletedItem.stop}`
    ).catch((err) => console.error('Activity log error:', err.message));

    // Broadcast real-time event
    if (io) {
      io.to(`trip:${trip.groupId}`).emit('itinerary:itemDeleted', {
        itemId: req.params.itemId,
        deletedBy: req.user.uid,
      });
    }

    notifyTrip(trip, req.user.uid, {
      title: trip.name,
      body: `Stop removed: ${deletedItem.stop}`,
    });

    res.json({ message: 'Itinerary item deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
