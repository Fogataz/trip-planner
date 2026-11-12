const express = require('express');
const TripComment = require('../models/TripComment');
const Trip = require('../models/Trip');
const { generateText } = require('../services/ai');
const { requestLanguage } = require('../services/language');
const User = require('../models/User');
const { notifyTrip } = require('../services/notifications');
const { can } = require('../services/permissions');
const { loadMember } = require('../services/membership');

const router = express.Router();

// A trip the caller holds no role on is a 404 to them, not a 403 — this file
// already took that line and it is the right one (principle 3). The decision
// itself goes through can(), like every other — G5 · One helper.
const allows = async (trip, uid, capability) =>
  !!trip && can(await loadMember(trip.groupId, uid), trip, capability);

// Get all comments for a trip
router.get('/trip/:tripId', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!(await allows(trip, req.user.uid, 'trip.view'))) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    const comments = await TripComment.find({ tripId: req.params.tripId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ask a question about a trip
router.post('/trip/:tripId', async (req, res) => {
  try {
    const { question } = req.body;
    const tripId = req.params.tripId;
    const userId = req.user.uid;

    // Validate trip exists and the caller belongs to it
    const trip = await Trip.findById(tripId);
    // AI Q&A is question.ask — open to every active member, guests included.
    if (!(await allows(trip, userId, 'question.ask'))) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Create comment with question
    const comment = new TripComment({
      tripId,
      userId,
      question,
    });

    await comment.save();

    const asker = await User.findOne({ uid: userId });
    notifyTrip(trip, userId, {
      title: `New question in ${trip.name}`,
      body: `${asker?.email || 'Someone'} asked: ${String(question).slice(0, 120)}`,
    });

    // Generate answer with the AI model
    try {
      const prompt = `The user is planning a trip from ${trip.origin?.address} to ${trip.destination?.address} departing on ${new Date(trip.startDate).toLocaleDateString()}.

Here are the AI travel suggestions:
${trip.travelSuggestions?.raw_suggestions || 'No suggestions available'}

User's question: ${question}

Provide a helpful, concise answer about their trip. Keep it to 2-3 sentences.`;

      const answer = await generateText(prompt, { language: requestLanguage(req) });

      comment.answer = answer;
      comment.answeredAt = new Date();
      await comment.save();
    } catch (err) {
      console.error('Error generating answer:', err.message);
      comment.answer = 'Unable to generate answer at this moment. Please try again.';
      await comment.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
