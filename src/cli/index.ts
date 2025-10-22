// src/index.ts

import { Command } from 'commander';
import { makeFontCommand } from './commands/make-font';
// import { cleanCommand } from './cli/commands/clean';
// import { initCommand } from './cli/commands/init';

const PACKAGE_VERSION = '1.0.0'; 
const PACKAGE_DESCRIPTION = 'A CLI tool to process SVGs and generate font files';


function runCli() {
  const program = new Command();

  program
    .name('mickofont')
    .description(PACKAGE_DESCRIPTION)
    .version(PACKAGE_VERSION, '-v, --version', 'Output the current version of mickofont');

  program.addCommand(makeFontCommand);
  // program.addCommand(cleanCommand);
  // program.addCommand(initCommand);

  program.parse(process.argv);

  if (!process.argv.slice(2).length) {
    program.outputHelp();
  }
}

runCli();