import { Item } from "../type";
import "@vaadin/icons";
import * as t from "io-ts";

export type ItemElement = InstanceType<ReturnType<typeof ItemComponent>>;

export function ItemComponent(icon: string, next: () => t.Validation<Item>) {
  return class ItemElement extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: "open" }).innerHTML = `
<vaadin-icon icon="${icon}"></vaadin-icon>
  `;
    }

    next = next;
  };
}
