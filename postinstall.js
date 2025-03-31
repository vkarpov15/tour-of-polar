'use strict';

const { execSync } = require('child_process');

// This is a postinstall script for Mongoose Studio
const opts = {
  apiKey: process.env.MONGOOSE_STUDIO_API_KEY
};
console.log('Creating Mongoose studio', opts);
require('@mongoosejs/studio/frontend')(`/api/studio`, true, opts).then(() => {
  execSync(`
  mkdir -p ./public/studio
  cp -r ./node_modules/@mongoosejs/studio/frontend/public/* ./public/studio/
  `);
});
