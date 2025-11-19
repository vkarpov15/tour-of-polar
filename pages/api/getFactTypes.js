import enqueue from '../../src/enqueue.mjs';
import getOso from '../../src/oso.mjs';

/**
 *
 */

export default async function getFactTypes(req, res) {
  try {
    const { code } = req.body;
    if (typeof code !== 'string') {
      throw new Error('Code must be a string');
    }

    const oso = await getOso();
    // Critical path: ensure no other function call overwrites the policy while it is being used.
    const { autocompleteInfo, factSuggestions } = await enqueue(async () => {
      await oso.policy(code);
      const { result: autocompleteInfo } = await oso.api._get('/autocomplete_info');
      const factSuggestions = getFactSuggestions(autocompleteInfo);
      return { autocompleteInfo, factSuggestions };
    });

    res.status(200).json({ autocompleteInfo, factSuggestions });
  } catch (err) {
    console.log(err.stack);
    res.status(500).json({
      message: "Error",
      error: err.message
    });
  }
}

function getFactSuggestions(autocompleteInfo) {
  delete autocompleteInfo.suggestions['has_permission'];
  for (const [key, value] of Object.entries(autocompleteInfo.suggestions)) {
    const newValue = [];
    for (const pattern of value) {
      for (let i = 0; i < pattern.length; ++i) {
        const arg = pattern[i];
        newValue[i] = newValue[i] || [];
        if (!newValue[i].find(argOption => argOption.kind === arg.kind && argOption.value === arg.value)) {
          newValue[i].push(arg);
        }
      }
    }

    for (const arg of newValue) {
      for (let i = 0; i < arg.length; ++i) {
        const argOption = arg[i];
        if (argOption.kind === 'symbol' && argOption.value === 'Actor') {
          arg.splice(i, 1, { ...autocompleteInfo.actors[0] });
          arg.push(...autocompleteInfo.actors.slice(1).map(actor => ({ ...actor })));
        }
      }
    }

    autocompleteInfo.suggestions[key] = newValue;
  }
  return autocompleteInfo.suggestions;
}
