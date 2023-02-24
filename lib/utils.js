import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** @param {string} dir */
export function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    if (e.code === "EEXIST") return;
    throw e;
  }
}

/** @param {string} path */
export function rimraf(path) {
  (fs.rmSync || fs.rmdirSync)(path, { recursive: true, force: true });
}

/**
 * @template T
 * @param {T} x
 */
function identity(x) {
  return x;
}

/**
 * @param {string} from
 * @param {string} to
 * @param {(basename: string) => string} rename
 */
export function copy(from, to, rename = identity) {
  if (!fs.existsSync(from)) return;

  const stats = fs.statSync(from);

  if (stats.isDirectory()) {
    fs.readdirSync(from).forEach((file) => {
      copy(path.join(from, file), path.join(to, rename(file)));
    });
  } else {
    mkdirp(path.dirname(to));
    fs.copyFileSync(from, to);
  }
}

export function templatePath() {
  return fileURLToPath(new URL(`../template`, import.meta.url).href);
}

/**
 * Merge two objects.
 *
 * Intended for merging `package.json` data.
 * @param {any} target
 * @param {any} source
 */
export function merge(target, source) {
  for (const key in source) {
    if (key in target) {
      const target_value = target[key];
      const source_value = source[key];

      if (
        typeof source_value !== typeof target_value ||
        Array.isArray(source_value) !== Array.isArray(target_value)
      ) {
        throw new Error("Mismatched values");
      }

      if (typeof source_value === "object") {
        merge(target_value, source_value);
      } else {
        target[key] = source_value;
      }
    } else {
      target[key] = source[key];
    }
  }
}
