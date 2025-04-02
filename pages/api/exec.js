import { Oso } from 'oso-cloud';
import {
  configureDevServer,
  getEphemeralOsoKey
} from '@osohq/dev-server';

let oso = null;

/**
 * This endpoint initializes a local Oso dev server, points an Oso Cloud client to the
 * local Oso dev server, and executes a policy string sent in the request body.
 * It returns the policy execution result or handles any errors that occur during
 * initialization or execution.
 * The frontend uses this endpoint to run the policy the user entered in.
 */

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
