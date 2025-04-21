let promise = Promise.resolve();

// Handle critical paths where only one task can be executed at a time. Specifically, cases
// where we need to call `oso.policy()` and then some other tasks that depend on the policy.
// We don't want concurrent calls to change the policy while it's being used.
export default function enqueue(task) {
  promise = promise.then(() => task());
  return promise;
}
