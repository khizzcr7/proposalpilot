// Browser stub for node:async_hooks. ProposalPilot's actions never use
// async-local storage; the framework's DB modules import it statically.
// This stub keeps the bundle building without claiming any DB behaviour.
export class AsyncLocalStorage<T> {
  getStore(): T | undefined {
    return undefined;
  }
  run<R>(_store: T, callback: () => R): R {
    return callback();
  }
  disable(): void {}
  enterWith(_store: T): void {}
}
export default AsyncLocalStorage;
