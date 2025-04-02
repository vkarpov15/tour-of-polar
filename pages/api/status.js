import pkg from '../../package.json';
const environment = process.env.NODE_ENV;

/**
 * API route that returns basic high-level status information for sanity checking.
 */

export default function handler(req, res) {
  const { version } = pkg;

  res.status(200).json({
    environment,
    version
  })
}
