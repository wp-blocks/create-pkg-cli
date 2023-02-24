#!/usr/bin/env node

/**
 * @typedef {import('./index').Context} Context
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import prompts from "prompts";

import { templatePath } from "./utils.js";

/**
 * @returns {Promise<Context>}
 */
export async function prompt() {
  let cwd = process.argv[2] || ".";

  if (cwd === ".") {
    const opts = await prompts([
      {
        type: "text",
        name: "dir",
        message: "Where should we create your project?\n  (leave blank to use current directory)",
      },
    ]);

    if (opts.dir) {
      cwd = opts.dir;
    }
  }

  if (fs.existsSync(cwd)) {
    if (fs.readdirSync(cwd).length > 0) {
      const response = await prompts({
        type: "confirm",
        name: "value",
        message: "Directory not empty. Continue?",
        initial: false,
      });

      if (!response.value) {
        process.exit(1);
      }
    }
  }

  let npmConfig;

  try {
    npmConfig = JSON.parse(execSync("npm config list --json", { encoding: "utf-8" }));
  } catch (_) {
    // pass
  }

  const name = path.basename(path.resolve(cwd));

  /** @type {Context} */
  const ctx = {
    cwd,
    root: true,
    template: templatePath(),
    name: name,
    author: {},
  };

  console.log(npmConfig);

  const author = {
    email: npmConfig["init-author-email"],
    name: npmConfig["init-author-name"],
    url: npmConfig["init-author-url"],
  };

  for (const [key, value] of Object.entries(author)) {
    if (value !== undefined && value.length > 1) {
      ctx.author = ctx.author ?? {};
      ctx.author[key] = value;
    }
  }

  const options = await prompts([
    {
      type: "text",
      name: "name",
      message: `What should the name of the package be?`,
      initial: ctx.name,
    },
    {
      type: "text",
      name: "repo",
      message: `What should the repository url be?`,
    },
  ]);

  if (options.name) {
    ctx.name = options.name;
  }

  if (options.repo) {
    ctx.repo = options.repo;
  }

  const match = /^(@[\w_.-]+)\/(.*)$/.exec(options.name);

  if (match) {
    const [, scope, basename] = match;
    ctx.scope = scope;
    ctx.basename = basename;
  }

  if (!ctx?.author?.name) {
    const opts = await prompts([
      {
        type: "text",
        name: "name",
        message: "What is the author's name?",
      },
    ]);

    if (opts.name) {
      ctx.author.name = opts.name;
    }
  }

  if (!ctx.author.email) {
    const opts = await prompts([
      {
        type: "text",
        name: "email",
        message: "What is the author's email?",
      },
    ]);

    if (opts.email) {
      ctx.author.email = opts.email;
    }
  }

  if (!ctx.author.url) {
    const opts = await prompts([
      {
        type: "text",
        name: "url",
        message: "What is the url of the author's website?",
      },
    ]);

    if (opts.url) {
      ctx.author.url = opts.url;
    }
  }

  return ctx;
}
