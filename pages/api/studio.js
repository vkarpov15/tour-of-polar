import db from '../../src/db';
import studio from '@mongoosejs/studio/backend/next';

const handler = studio({
  apiKey: process.env.MONGOOSE_STUDIO_API_KEY,
  connection: db
});

export default handler;
