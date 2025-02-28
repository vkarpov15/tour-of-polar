'use strict';

module.exports = {
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
      },
    ];
  },
};
