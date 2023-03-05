import { toIO } from "./util";

export const define = toIO(customElements.define.bind(customElements));
