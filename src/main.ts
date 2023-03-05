import "./style.css";

import { BoardComponent, BoardElement } from "./WebComponent/Board";
import { getBoard } from "./api";
import { ComponentPrefix, registerComponents } from "./config";
import {
  appendChild,
  customElements,
  document,
  querySelector,
  set,
} from "./browser";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import * as TE from "fp-ts/TaskEither";
import { flow, pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/PathReporter";

const main = pipe(
  getBoard(crypto.randomUUID()),
  TE.mapLeft(flow(E.left, PathReporter.report)),
  TE.chainIOEitherK((state) =>
    pipe(
      IO.of(`${ComponentPrefix}-board`),
      IO.chainFirst((tagName) =>
        customElements.define(tagName, BoardComponent(25))
      ),
      IO.chain((x) => document.createElement(x)),
      IO.chain((x) => set(x as BoardElement)("state")(state)),
      (x) => x,
      IO.chain((board) =>
        pipe(
          querySelector<HTMLDivElement>("#app")(window.document),
          IO.map(E.fromOption(() => ["#app not found."])),
          IOE.chainIOK(appendChild(board))
        )
      )
    )
  )
);

// eslint-disable-next-line functional/no-expression-statements
main().then(registerComponents).catch(console.error);
