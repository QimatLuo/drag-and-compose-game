import { createItem } from "../model";
import * as IOE from "fp-ts/IOEither";
import * as R from "fp-ts/Record";
import { randomElem } from "fp-ts/Random";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { ReadonlyNonEmptyArray } from "io-ts-types";

export function raw() {
  return createItem({});
}

export function resource(itemTypes: ReadonlyNonEmptyArray<string>) {
  interface ItemTypeBrand {
    readonly ItemType: unique symbol;
  }
  const ItemType = t.brand(
    t.string,
    (x): x is t.Branded<string, ItemTypeBrand> => itemTypes.includes(x),
    "ItemType"
  );
  type ItemType = t.TypeOf<typeof ItemType>;
  return pipe(
    randomElem(itemTypes),
    IOE.fromIO,
    IOE.chainEitherK(ItemType.decode),
    IOE.map((x) => R.singleton("type", x)),
    IOE.chainEitherK(createItem)
  );
}
