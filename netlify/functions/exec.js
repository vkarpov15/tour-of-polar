'use strict';

const { Oso } = require('oso-cloud');

const oso = new Oso('http://localhost:9001', 'e_0123456789_12345_osotesttoken01xiIn', { debug: { print: true } });

exports.handler = async function(event, context) {
  try {
    const { code } = JSON.parse(event.body);
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }
    const res = await oso.policy(code) ?? {};
    console.log('BB', res);
    // Handle request
    return {
      statusCode: 200,
      body: JSON.stringify(res)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error",
        error: err.message
      })
    };
  }
}
