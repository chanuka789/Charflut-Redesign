// Next's standalone output leaves out static assets; copy them in so
// `node .next/standalone/server.js` serves everything on its own.
import { cpSync, existsSync } from "node:fs";

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) cpSync("public", ".next/standalone/public", { recursive: true });
