import { Event } from '../../src/db';

/**
 * Tracks events to MongoDB for analytics with Mongoose Studio
 */

export default async function track(req, res) {
  try {
    const { sessionId, type, data } = req.body;

    const event = new Event({
      sessionId,
      type,
      data
    });

    await event.save();

    return res.status(200).json(event);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
