import { ComponentPrefix } from "../config";
import { addEventListener, innerHTML, querySelectorAll } from "../browser";
import { addItemToBoard } from "../model";
import { Board, Item } from "../type";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as IO from "fp-ts/IO";
import * as IOE from "fp-ts/IOEither";
import { flow, pipe } from "fp-ts/function";
import { PathReporter } from "io-ts/PathReporter";
import { ItemElement } from "./Item";

export type BoardElement = InstanceType<ReturnType<typeof BoardComponent>>;

export function BoardComponent(n: number) {
  return class BoardElement extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" }).appendChild(
        template(n).content.cloneNode(true)
      );

      this.syncState(this.state);
    }

    set state(x: Board) {
      this.syncState(x);
    }

    syncState(state: Board | null) {
      pipe(
        verify(state, this.shadowRoot?.querySelector(".board")),
        E.match(console.debug, (x) => render(x.dom)(x.state))
      );
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
  )(document.createElement("template"))();
}

function verify(
  state: Board | null | undefined,
  dom: HTMLElement | null | undefined
) {
  return pipe(
    E.Do,
    E.apS("state", E.fromNullable("No state.")(state)),
    E.apS("dom", E.fromNullable("No dom.")(dom))
  );
}
function render(dom: HTMLElement) {
  return (state: Board) =>
    pipe(
      state.items,
      A.filter((x) => !dom.querySelector(`[data-id="${x.id}"]`)),
      A.map((x) => {
        const item = document.createElement(
          `${ComponentPrefix}-${x.type}`
        ) as ItemElement;
        item.setAttribute("class", "item");
        item.setAttribute("data-id", x.id);
        item.setAttribute("draggable", "true");
        item.addEventListener("click", generateItem(state, dom));
        item.addEventListener("dragstart", moveItem(dom));
        return item;
      })
    ).forEach((x) => {
      dom.querySelector(".slot:empty")?.appendChild(x);
    });
}

function generateItem(state: Board, dom: HTMLElement) {
  return (e: MouseEvent) => {
    pipe(
      (e.target as ItemElement).next,
      E.chain(Item.decode),
      E.chain(addItemToBoard(state)),
      E.mapLeft(flow(E.left, PathReporter.report)),
      E.match(console.debug, render(dom))
    );
  };
}

function moveItem(dom: HTMLElement) {
  return (e: DragEvent) =>
    pipe(
      pipe(
        e.target,
        E.fromNullable("moveItem() e.target is null."),
        IOE.fromEither,
        IOE.bindTo("dragged"),
        IOE.bindW("removeEvents", ({ dragged }) =>
          pipe(
            dom,
            querySelectorAll<HTMLDivElement>(".slot"),
            IO.chain(
              flow(
                A.map((div) =>
                  addEventListener("dragenter")((x) => {
                    if (x.target !== div) return;
                    div.appendChild(dragged as Element);
                  })(div)
                ),
                A.sequence(IO.Applicative)
              )
            ),
            IO.map(A.sequence(IO.Applicative)),
            IO.map(E.of)
          )
        )
      )(),
      E.match(console.debug, ({ dragged, removeEvents }) =>
        dragged.addEventListener("dragend", removeEvents)
      )
    );
}
