import { Board } from "./type";
import * as T from "fp-ts/Task";
import { pipe } from "fp-ts/function";

export const getBoard = (id: string) =>
  pipe(
    {
      id,
      items: [
        {
          id: crypto.randomUUID(),
          type: "root",
        },
      ],
    },
    T.of,
    T.map(Board.decode)
  );
