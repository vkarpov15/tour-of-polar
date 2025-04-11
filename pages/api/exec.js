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
    const { code, authorizeQuery } = req.body;
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    if (!oso) {
      await configureDevServer();
      const { url, apiKey } = await getEphemeralOsoKey();
      oso = new Oso(url, apiKey);
    }

    const result = await oso.policy(code) ?? {};

    const authorizeResult = authorizeQuery ? await oso.authorize(...parseAuthorizeQuery(authorizeQuery)) : null;

    res.status(200).json({ authorizeResult });
  } catch (err) {
    res.status(500).json({
      message: "Error",
      error: err.message
    });
  }
}

function parseAuthorizeQuery(authorizeString) {
  let parts = authorizeString.trim().split(/\s+/);
  if (parts.length !== 3) {
    throw new Error("There was an error parsing this query.");
  }
  let actor = extractLegacyTypedId(parts[0]);
  let action = extractLegacyTypedId(parts[1]);
  let resource = extractLegacyTypedId(parts[2]);

  if (actor.id.length === 0) {
    throw new Error(`Actor ID must be set: ${actor.type}:<id>`);
  }
  if (action.type !== "String") {
    throw new Error(`Action ${parts[1]} must be of type String.`);
  }
  if (action.id.length === 0) {
    throw new Error("Action cannot be empty");
  }
  if (resource.id.length === 0) {
    throw new Error(`Resource ID must be set: ${resource.type}:<id>`);
  }

  return parts;
}

function extractLegacyTypedId(token) {
  // pass quoted terms as String types
  const matches = removeSurroundingQuotes(token);
  if (matches) {
    return { type: "String", id: matches.replaceAll('"', "") };
  }

  const [first, ...rest] = token.split(":");

  if (rest.length > 0) {
    return { type: first, id: rest.join(":") };
  } else {
    return { type: "String", id: first.replaceAll('"', "") };
  }
}

function removeSurroundingQuotes(s) {
  const matches = s.match(/^"(.+)"$/);
  return matches ? matches[1] : null;
}
