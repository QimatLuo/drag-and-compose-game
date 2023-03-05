import { toIO } from "./util";

export const createElement = toIO(document.createElement.bind(document));
