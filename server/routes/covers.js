const express = require('express');
const mongoose = require('mongoose');
const { isCoverAssetId } = require('../config/coverGallery');

const router = express.Router();

// Uploaded covers are served without an auth header, because an <img> tag cannot
// send one. The id is the capability: 128 random bits (not an ObjectId, whose
// timestamp + counter make neighbours guessable), handed out only through the
// trip's own authenticated endpoints. Covers are decorative, so a leaked URL
// exposes one image and nothing else about the trip.
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isCoverAssetId(id)) {
    return res.status(404).json({ error: 'Cover not found' });
  }

  try {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'covers' });
    const [file] = await bucket.find({ _id: id }).limit(1).toArray();
    if (!file) return res.status(404).json({ error: 'Cover not found' });

    res.set('Content-Type', file.metadata?.contentType || 'image/webp');
    // Safe to cache forever: a new upload always gets a new id
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.set('X-Content-Type-Options', 'nosniff');
    if (file.length) res.set('Content-Length', String(file.length));

    const stream = bucket.openDownloadStream(file._id);
    stream.on('error', () => {
      if (!res.headersSent) res.status(404).end();
      else res.end();
    });
    stream.pipe(res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
