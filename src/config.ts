import { ItemComponent, raw, resource } from "./WebComponent";
import { customElements } from "./browser";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as IO from "fp-ts/IO";
import * as RNEA from "fp-ts/ReadonlyNonEmptyArray";
import * as RR from "fp-ts/ReadonlyRecord";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";

export const ComponentPrefix = "my";

const mapping = {
  "arrow-down": ItemComponent("vaadin:arrow-long-down", raw),
  "arrow-up": ItemComponent("vaadin:arrows-long-up", raw),
  root: ItemComponent("vaadin:question", resource(["arrow-up", "arrow-down"])),
};

export const ItemTypes = pipe(
  RR.keys(mapping),
  RNEA.fromReadonlyArray<string>,
  O.getOrElseW(() => [])
);

export const registerComponents = pipe(
  mapping,
  R.toEntries,
  A.map(([type, component]) =>
    customElements.define(`${ComponentPrefix}-${type}`, component)
  ),
  A.sequence(IO.Applicative)
);
