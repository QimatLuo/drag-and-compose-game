import * as IO from "fp-ts/IO";

type set = <D extends HTMLElement>(
  dom: D
) => <K extends keyof D>(key: K) => (value: D[K]) => IO.IO<D>;
export const set: set = (d) => (k) => (v) => () => {
  d[k] = v;
  return d;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type toIO = <F extends (...args: any[]) => ReturnType<F>>(
  f: F
) => (...args: Parameters<F>) => IO.IO<ReturnType<F>>;
export const toIO: toIO =
  (f) =>
  (...xs) =>
  () =>
    f(...xs);
