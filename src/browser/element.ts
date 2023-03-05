import { set } from "./util";
import * as IO from "fp-ts/IO";
import * as IOO from "fp-ts/IOOption";
import * as O from "fp-ts/Option";

type addEventListener = <K extends keyof HTMLElementEventMap>(
  event: K
) => (
  cb: (e: HTMLElementEventMap[K]) => undefined
) => <D extends HTMLElement>(dom: D) => IO.IO<IO.IO<D>>;
export const addEventListener: addEventListener = (e) => (f) => (d) => () => {
  d.addEventListener(e, f);
  return () => {
    d.removeEventListener(e, f);
    return d;
  };
};

type appendChild = <C extends Node>(
  child: C
) => <D extends Element | ShadowRoot>(dom: D) => IO.IO<D>;
export const appendChild: appendChild = (c) => (d) => () => {
  d.appendChild(c);
  return d;
};

type innerHTML = (html: string) => <D extends HTMLElement>(dom: D) => IO.IO<D>;
export const innerHTML: innerHTML = (v) => (d) => set(d)("innerHTML")(v);

type querySelector = <R extends Element>(
  id: string
) => <D extends HTMLElement | Document | ShadowRoot>(dom: D) => IOO.IOOption<R>;
export const querySelector: querySelector = (id) => (d) => () =>
  O.fromNullable(d.querySelector(id));

type querySelectorAll = <R extends Element>(
  id: string
) => <D extends HTMLElement | Document>(dom: D) => IO.IO<R[]>;
export const querySelectorAll: querySelectorAll = (id) => (d) => () =>
  Array.from(d.querySelectorAll(id));

type setAttribute = (
  key: string
) => (value: string) => <D extends Element>(dom: D) => IO.IO<D>;
export const setAttribute: setAttribute = (k) => (v) => (d) => () => {
  d.setAttribute(k, v);
  return d;
};
