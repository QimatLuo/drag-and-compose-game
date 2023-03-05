import { Board, Item } from "./type";
import * as t from "io-ts";

export const createItem: createItem = (p) =>
  Item.decode({
    id: p.id || crypto.randomUUID(),
    type: p.type,
  });

export const createBoard: createBoard = (p) =>
  Board.decode({
    items: p.items || [],
  });

export const addItemToBoard: addItemToBoard = (b) => (i) =>
  Board.decode({
    items: [i].concat(b.items),
  });

export const removeItemFromBoard: removeItemFromBoard = (i) => (b) =>
  Board.decode({
    items: b.items.filter((x) => x.id !== i.id),
  });

export type createItem = (partialItem: Partial<Item>) => t.Validation<Item>;
export type createBoard = (partialItem: Partial<Board>) => t.Validation<Board>;
export type addItemToBoard = (
  board: Board
) => (item: Item) => t.Validation<Board>;
export type removeItemFromBoard = (
  item: Item
) => (board: Board) => t.Validation<Board>;
