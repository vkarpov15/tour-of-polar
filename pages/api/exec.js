import enqueue from '../../src/enqueue.mjs';
import getOso from '../../src/oso.mjs';

/**
 * This endpoint initializes a local Oso dev server, points an Oso Cloud client to the
 * local Oso dev server, and executes a policy string sent in the request body.
 * It returns the policy execution result or handles any errors that occur during
 * initialization or execution.
 * The frontend uses this endpoint to run the policy the user entered in.
 */

export default async function exec(req, res) {
  try {
    const { code, authorizeQuery, contextFacts } = req.body;
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    if (!Array.isArray(authorizeQuery)) {
      throw new Error('Authorize query must be an array');
    }
    if (authorizeQuery.length !== 3) {
      throw new Error('Authorize query must have 3 elements');
    }
    if (!authorizeQuery[0] || typeof authorizeQuery[0].type !== 'string' || typeof authorizeQuery[0].id !== 'string') {
      throw new Error('Authorize query actor must be an object with string type and id');
    }
    if (typeof authorizeQuery[1] !== 'string') {
      throw new Error('Authorize query action must be a string');
    }
    if (!authorizeQuery[2] || typeof authorizeQuery[2].type !== 'string' || typeof authorizeQuery[2].id !== 'string') {
      throw new Error('Authorize query resource must be an object with string type and id');
    }

    if (!Array.isArray(contextFacts)) {
      throw new Error('Context facts must be an array');
    }
    for (const fact of contextFacts) {
      if (!Array.isArray(fact)) {
        throw new Error('Each context fact must be an array');
      }
      if (!fact.length) {
        throw new Error('Each context fact must have at least one element');
      }
      for (const param of fact) {
        if (typeof param !== 'string' && typeof param !== 'number' && (!param || typeof param.type !== 'string' || typeof param.id !== 'string')) {
          throw new Error('Each context fact parameter must be either a string or an object with string type and id');
        }
      }
    }

    const oso = await getOso();

    const authorizeResult = await enqueue(async () => {
      await oso.policy(code);
      const authorizeResult = authorizeQuery ? await oso.authorize(...authorizeQuery, contextFacts) : null;
      return authorizeResult;
    });

    res.status(200).json({ authorizeResult });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({
      message: "Error",
      error: err.message
    });
  }
}
