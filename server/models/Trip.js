const mongoose = require('mongoose');

// A trip cover is either a curated gallery entry (key = gallery slug) or an
// uploaded image (key = GridFS file id). focalY is the point every crop centres on.
const coverSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['gallery', 'upload'], required: true },
    key: { type: String, required: true },
    focalY: { type: Number, default: 50, min: 0, max: 100 },
    dominantColor: String,
    alt: String,
    width: Number,
    height: Number,
    setBy: String,
    setAt: Date,
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema({
  cover: {
    type: coverSchema,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  groupId: {
    type: String,
    required: true,
    unique: true,
  },
  destination: {
    lat: Number,
    lng: Number,
    address: String,
  },
  origin: {
    lat: Number,
    lng: Number,
    address: String,
  },
  accommodation: {
    name: String,
    address: String,
  },
  startDate: Date,
  endDate: Date,
  // When the end date is not known yet: an approximate length in days, e.g. 8 to 10
  durationDays: {
    min: { type: Number, min: 1, max: 365 },
    max: { type: Number, min: 1, max: 365 },
  },
  members: [
    {
      userId: String,
      email: String,
      role: {
        type: String,
        enum: ['organizer', 'member'],
        default: 'member',
      },
      status: {
        type: String,
        enum: ['pending', 'active', 'removed'],
        default: 'active',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      invitedBy: String,
      invitedAt: Date,
      inviteAccepted: Date,
    },
  ],
  itinerary: [
    {
      stop: String,
      time: Date,
      transport: String,
      notes: String,
      createdBy: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedBy: String,
      updatedAt: Date,
      version: {
        type: Number,
        default: 1,
      },
    },
  ],
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  travelSuggestions: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
});

tripSchema.index({ groupId: 1 });
tripSchema.index({ createdBy: 1 });
tripSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('Trip', tripSchema);
