import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { merge } from 'lodash';
import defaultConfig from '../../config/base.config';

function resolveTargetPath(cwd: string, targetPath: string): string {
	return path.isAbsolute(targetPath) ? targetPath : path.resolve(cwd, targetPath);
}

function resolveConfigPath(cwd: string, configOption?: string): string {
	const confPathFromCLI = configOption ? path.resolve(cwd, configOption) : '';
	return process.env.MICKOFONT_CONFIG_PATH || confPathFromCLI || path.resolve(cwd, 'mickofont.config.js');
}

function loadConfigForClean(cwd: string, configOption?: string) {
	const configFilePath = resolveConfigPath(cwd, configOption);
	let finalConfig = defaultConfig;

	if (fs.existsSync(configFilePath)) {
		try {
			const projectConfig = require(configFilePath).default || require(configFilePath);
			finalConfig = merge({}, finalConfig, projectConfig);
		} catch (error) {
			console.warn(`⚠️ Could not load project config from ${configFilePath}. Using base configuration.`);
		}
	}

	return finalConfig;
}

async function removeDirIfExists(targetDir: string, verbose: boolean): Promise<boolean> {
	if (!fs.existsSync(targetDir)) {
		if (verbose) {
			console.log(`ℹ️ Skip (not found): ${targetDir}`);
		}
		return false;
	}

	await fs.promises.rm(targetDir, { recursive: true, force: true });
	return true;
}

export const cleanCommand = new Command('clean')
	.description('Removes generated result folders (fonts and types).')
	.option('-c, --config <file>', 'Path to the config file.')
	.option('-v, --verbose', 'Show detailed clean logs.')
	.action(async (opts) => {
		const cwd = process.cwd();
		const config = loadConfigForClean(cwd, opts.config);

		const distPath = resolveTargetPath(cwd, config.svgToFontOptions.dist as string);
		const typesOutputPath = resolveTargetPath(cwd, config.typeScript.outputFile);
		const typesDir = path.dirname(typesOutputPath);

		const targets = [...new Set([distPath, typesDir])];
		let removedCount = 0;

		try {
			for (const target of targets) {
				const removed = await removeDirIfExists(target, Boolean(opts.verbose || config.verbose));
				if (removed) {
					removedCount++;
					console.log(`✅ Removed: ${target}`);
				}
			}

			if (removedCount === 0) {
				console.log('ℹ️ Nothing to clean.');
				return;
			}

			console.log('🧹 Clean complete.');
		} catch (error) {
			console.error('❌ Clean failed:', error);
			process.exit(1);
		}
	});
