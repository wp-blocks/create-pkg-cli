import { fileURLToPath } from "node:url";

export function templatePath() {
  return fileURLToPath(new URL(`../template`, import.meta.url).href);
}
