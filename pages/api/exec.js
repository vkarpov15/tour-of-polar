import { Oso } from 'oso-cloud';
import {
  configureDevServer,
  getEphemeralOsoKey,
  stopRunningInstance,
} from '@osohq/dev-server';

let oso = null;

export default async function exec(req, res) {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    if (!oso) {
      await configureDevServer();
      const { url, apiKey } = await getEphemeralOsoKey();
      oso = new Oso(url, apiKey);
    }

    const result = await oso.policy(code) ?? {};

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Error",
      error: err.message
    });
  }
}
