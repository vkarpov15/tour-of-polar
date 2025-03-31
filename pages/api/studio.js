import '../../src/db'; // Ensure the database connection is established
import studio from '@mongoosejs/studio/backend/next';

const handler = studio({ apiKey: process.env.MONGOOSE_STUDIO_API_KEY });

export default handler;
