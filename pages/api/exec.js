import { Oso } from 'oso-cloud';
import {
  configureDevServer,
  getEphemeralOsoKey,
  stopRunningInstance,
} from '@osohq/dev-server';

let devServerRunning = false;

export default async function exec(req, res) {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    if (!devServerRunning) {
      await configureDevServer();
      devServerRunning = true;
    }
    const { url, apiKey } = await getEphemeralOsoKey();
    const oso = new Oso(url, apiKey);

    const result = await oso.policy(code) ?? {};

    await stopRunningInstance();

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error",
      error: err.message
    });
  }
}
