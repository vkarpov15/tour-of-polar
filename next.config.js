'use strict';

module.exports = {
  async rewrites() {
    return [
      {
        source: '/:number(\\d+)',
        destination: '/index.html',
      },
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};
