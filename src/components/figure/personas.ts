import type { ModelGender } from "@/lib/schema";

export interface Persona {
  skin: string;
  hair: string;
  hairStyle: "short" | "buzz" | "curls" | "long" | "bun" | "locs";
  /** What they wear with the product: trousers under a top, a top over trousers. */
  bottom: string;
  top: string;
  shoe: string;
  pose: "side" | "pocket";
}

const men: Persona[] = [
  { skin: "#c99a78", hair: "#2a211c", hairStyle: "short", bottom: "#8fa6bd", top: "#e9e7e1", shoe: "#ecebe7", pose: "side" },
  { skin: "#7a5038", hair: "#151313", hairStyle: "locs", bottom: "#a9b6bf", top: "#2b2b2d", shoe: "#2b2b2d", pose: "pocket" },
  { skin: "#e2bfa3", hair: "#5c4030", hairStyle: "curls", bottom: "#7c8a99", top: "#d8d2c4", shoe: "#d9d6cf", pose: "side" },
  { skin: "#a8775a", hair: "#1d1a18", hairStyle: "buzz", bottom: "#9aa9b4", top: "#ecebe6", shoe: "#f0efea", pose: "pocket" },
  { skin: "#5b3b2a", hair: "#121111", hairStyle: "short", bottom: "#b3bdc4", top: "#a8a8a4", shoe: "#262628", pose: "side" },
  { skin: "#d6ab8a", hair: "#3b2c22", hairStyle: "curls", bottom: "#6f7f8f", top: "#efeee9", shoe: "#ebe9e3", pose: "pocket" },
];

const women: Persona[] = [
  { skin: "#d9b294", hair: "#3a2a20", hairStyle: "long", bottom: "#93a9bf", top: "#ecebe6", shoe: "#efeee9", pose: "pocket" },
  { skin: "#6e4733", hair: "#171414", hairStyle: "bun", bottom: "#aab7c1", top: "#2b2b2d", shoe: "#2b2b2d", pose: "side" },
  { skin: "#efcfb6", hair: "#a07a52", hairStyle: "long", bottom: "#7e8c9b", top: "#d8d2c4", shoe: "#dedbd4", pose: "side" },
  { skin: "#b07f5f", hair: "#221c19", hairStyle: "curls", bottom: "#9dacb7", top: "#efeee9", shoe: "#f1f0eb", pose: "pocket" },
  { skin: "#57392a", hair: "#141212", hairStyle: "locs", bottom: "#b5bfc6", top: "#a8a8a4", shoe: "#28282a", pose: "side" },
  { skin: "#e0b99c", hair: "#5a3f2c", hairStyle: "bun", bottom: "#71808f", top: "#eceae4", shoe: "#ecebe5", pose: "pocket" },
];

export function personaFor(gender: ModelGender, index: number): Persona {
  const list = gender === "men" ? men : women;
  return list[((index % list.length) + list.length) % list.length]!;
}
