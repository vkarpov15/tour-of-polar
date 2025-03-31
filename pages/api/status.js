import pkg from '../../package.json';
const environment = process.env.NODE_ENV;

console.log('BB', pkg);

export default function handler(req, res) {
  const { version } = pkg;

  res.status(200).json({
    environment,
    version: version
  })
}
