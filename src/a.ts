import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { Eq } from "fp-ts/string";
import { Tree, fold, make, unfoldForest, unfoldTree } from "fp-ts/Tree";
import { constant, flow, pipe } from "fp-ts/function";

function makeTree<A extends Record<string, Array<A|never>>>(config: A) {
  return unfoldTree(config, (a) => Object.entries(a)[0]);
}

const t = makeTree({
  vertical: [
    { "long-up": [{ "short-up": [] }, { "short-up": [] }] },
    { "long-down": [{ "short-down": [] }, { "short-down": [] }] },
  ],
});
pipe(t, findCombination(["short-down", "short-down"]), console.log);
pipe(t, findCombination(["log-up", "long-down"]), console.log);
pipe(t, findCombination(["long-up", "long-down"]), console.log);

function findCombination(values: string[]) {
  const matchAll = (xs: string[]) =>
    pipe(
      values,
      A.every((v) => xs.some((x) => Eq.equals(x, v))),
      (x) => !x
    );
  return (tree: Tree<string>) =>
    pipe(
      tree,
      fold<string, E.Either<string, string>>((a, bs) =>
        pipe(
          bs,
          A.sequence(E.Applicative),
          E.chain(
            flow(E.fromPredicate(matchAll, constant(a)), E.map(constant(a)))
          )
        )
      ),
      E.match(O.some, constant(O.none))
    );
}
