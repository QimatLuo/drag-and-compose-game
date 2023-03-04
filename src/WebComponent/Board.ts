import { ComponentPrefix } from "../config";
import {
  addEventListener,
  appendChild,
  innerHTML,
  querySelector,
  querySelectorAll,
  setAttribute,
} from "../browser";
import { addItemToBoard } from "../model";
import { Board, Item } from "../type";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import * as IOO from "fp-ts/IOOption";
import * as O from "fp-ts/Option";
import { flow, pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/PathReporter";
import { ItemElement } from "./Item";
import { createElement } from "../browser/document";

export type BoardElement = InstanceType<ReturnType<typeof BoardComponent>>;

export function BoardComponent(n: number) {
  return class BoardElement extends HTMLElement {
    constructor() {
      super();

      pipe(
        IO.Do,
        IO.apS("root", IO.of(this.attachShadow({ mode: "open" }))),
        IO.apS("template", template(n)),
        IO.chainFirst((x) =>
          appendChild(x.template.content.cloneNode(true))(x.root)
        ),
        IO.chainFirst((x) => syncState(this.state, x.root))
      )();
    }

    set state(x: Board) {
      syncState(x, this.shadowRoot)();
    }
  };
}

function template(n: number) {
  const divs = A.replicate(n, `<div class="slot"></div>`).join("");

  return innerHTML(
    `
<style>
.board {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, 50px);
  grid-template-rows: repeat(5, 50px);
}

.slot {
  background-color: #333;
}

.item {
  background-color: #555;
  height: 100%;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<section class="board">
  ${divs}
</section>
  `
  )(document.createElement("template"));
}

function syncState(
  state: Board | null | undefined,
  shadowRoot: ShadowRoot | null | undefined
) {
  return pipe(
    IOO.Do,
    IOO.apS("state", IOO.fromNullable(state)),
    IOO.apS(
      "dom",
      pipe(
        O.fromNullable(shadowRoot),
        IOO.fromOption,
        IOO.chain(querySelector<HTMLElement>(".board"))
      )
    ),
    IOO.chainFirstIOK((x) => render(x.dom)(x.state))
  );
}
function render(dom: HTMLElement) {
  return (state: Board) =>
    pipe(
      state.items,
      A.filterE(IO.Applicative)((item) =>
        pipe(querySelector(`[data-id="${item.id}"]`)(dom), IO.map(O.isNone))
      ),
      IO.chain(
        flow(
          A.map((x) =>
            pipe(
              createElement(`${ComponentPrefix}-${x.type}`),
              IO.chain(setAttribute("class")("item")),
              IO.chain(setAttribute("data-id")(x.id)),
              IO.chain(setAttribute("draggable")("true")),
              IO.chainFirst(
                addEventListener("click")(generateItem(state, dom))
              ),
              IO.chainFirst(addEventListener("dragstart")(moveItem(dom))),
              IOO.fromIO,
              IOO.bindTo("child"),
              IOO.apS("parent", querySelector(".slot:empty")(dom)),
              IOO.chainFirstIOK((x) => appendChild(x.child)(x.parent))
            )
          ),
          A.sequence(IO.Applicative)
        )
      )
    );
}

function generateItem(state: Board, dom: HTMLElement) {
  return (e: MouseEvent) => {
    pipe(
      (e.target as ItemElement).next(),
      E.chain(Item.decode),
      E.chain(addItemToBoard(state)),
      E.mapLeft(flow(E.left, PathReporter.report)),
      IOE.fromEither,
      IOE.chainFirstIOK(render(dom))
    )();
    return undefined;
  };
}

function moveItem(dom: HTMLElement) {
  return (e: DragEvent) => {
    pipe(
      e.target as HTMLElement,
      IOO.fromNullable,
      IOO.bindTo("dragged"),
      IOO.bind("removeEvents", ({ dragged }) =>
        pipe(
          dom,
          querySelectorAll<HTMLDivElement>(".slot"),
          IO.chain(
            flow(
              A.map((div) =>
                addEventListener("dragenter")(itemOverlap(dragged, div))(div)
              ),
              A.sequence(IO.Applicative)
            )
          ),
          IO.map(O.of)
        )
      ),
      IOO.chainFirstIOK((x) =>
        addEventListener("dragend")(removeEvents(x.removeEvents))(x.dragged)
      )
    )();
    return undefined;
  };
}

function removeEvents(xs: IO.IO<unknown>[]) {
  return (_: Event) => {
    pipe(xs, A.sequence(IO.Applicative))();
    return undefined;
  };
}

function itemOverlap(dragged: HTMLElement, div: Element) {
  return (x: DragEvent) => {
    pipe(
      x.target as Element,
      IOO.fromNullable,
      IOO.filter((x) => x === div),
      IOO.chainIOK(appendChild(dragged))
    )();
    return undefined;
  };
}
