'use strict';

const withMongooseStudio = require('@mongoosejs/studio/next');

module.exports = withMongooseStudio({
  async rewrites() {
    return [
      {
        source: '/list',
        destination: '/list.html'
      },
      {
        source: '/:chapter/:number(\\d+)',
        destination: '/index.html',
      },
      {
        source: '/',
        destination: '/index.html',
      }
    ];
  },
});
