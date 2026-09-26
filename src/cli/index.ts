#!/usr/bin/env node
// src/index.ts

import { Command } from "commander";
import { makeFontCommand } from "./commands/make-font";
import { makeTypeCommand } from "./commands/make-type";
import { makeFontOnlyCommand } from "./commands/make-font-only";
import { cleanCommand } from "./commands/clean";
import { initCommand } from "./commands/init";

const PACKAGE_VERSION = "1.2.14";
const PACKAGE_DESCRIPTION =
  "A CLI tool to process SVGs and generate font files";

function runCli() {
  console.log(
    "MICKOFONT (by codeagha : https://github.com/AmirMahdyJebreily/mickofont)",
  );

  const program = new Command();

  program
    .name("mickofont")
    .description(PACKAGE_DESCRIPTION)
    .version(
      PACKAGE_VERSION,
      "-v, --version",
      "Output the current version of mickofont",
    );

  program.addCommand(makeFontCommand);
  program.addCommand(makeTypeCommand);
  program.addCommand(makeFontOnlyCommand);
  program.addCommand(cleanCommand);
  program.addCommand(initCommand);

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

runCli();
