import { ItemTypes } from "./config";
import * as E from "fp-ts/Either";
import * as RA from "fp-ts/ReadonlyArray";
import * as S from "fp-ts/string";
import * as t from "io-ts";
import { UUID } from "io-ts-types";

interface ItemTypeBrand {
  readonly ItemType: unique symbol;
}
export const ItemType = t.brand(
  t.string,
  (x): x is t.Branded<string, ItemTypeBrand> => RA.elem(S.Eq)(x)(ItemTypes),
  "ItemType"
);
export type ItemType = t.TypeOf<typeof ItemType>;

interface ItemBrand {
  readonly Item: unique symbol;
}
const ItemT = t.type({
  id: UUID,
  type: ItemType,
});
export const Item = t.brand(
  ItemT,
  (x): x is t.Branded<t.TypeOf<typeof ItemT>, ItemBrand> =>
    E.isRight(ItemT.decode(x)),
  "Item"
);
export type Item = t.TypeOf<typeof Item>;

interface BoardBrand {
  readonly Board: unique symbol;
}
const BoardT = t.type({
  items: t.array(Item),
});
export const Board = t.brand(
  BoardT,
  (x): x is t.Branded<t.TypeOf<typeof BoardT>, BoardBrand> =>
    E.isRight(BoardT.decode(x)),
  "Board"
);
export type Board = t.TypeOf<typeof Board>;
