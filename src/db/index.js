import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  time: {
    type: Date,
    default: () => Date.now()
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

if (process.env.MONGODB_CONNECTION_STRING) {
  await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
}

export const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);
