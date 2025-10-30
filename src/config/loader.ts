import { ProjectConfig, OptimizationLevel, CLIConfig } from '../types/ProjectConfig';
import defaultConfig from './base.config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { merge } from 'lodash';
import { checkPath } from '../utils/check-results';


export async function loadProjectConfig(cliOptions: CLIConfig = {}, confFilePath?: string): Promise<[ProjectConfig | null, Error | null]> {
    let finalConfig: ProjectConfig = defaultConfig;
    const confPathFromCLI = (confFilePath) ? path.resolve(process.cwd(), confFilePath) : ''
    const configFilePath = process.env.MICKOFONT_CONFIG_PATH ||  confPathFromCLI || path.resolve(process.cwd(), 'mickofont.config.js');    
    if (fs.existsSync(configFilePath)) {
        try {
            const projectConfig = require(configFilePath).default || require(configFilePath);

            finalConfig = merge({}, finalConfig, projectConfig);

            const srcPath = finalConfig.svgToFontOptions.src

            if (!srcPath) {
                throw new Error("❌ Fatal Error: Source or distribution paths are not defined.");
            }

            const [srcInfo] = await Promise.all([checkPath(srcPath)]);

            if (!srcInfo.exists) {
                throw new Error(`❌ Source not found: ${srcInfo.path}\n➡ Fix: The source path does not exist. Run 'init' to create project structure or fix the src path in your config.`);
            }

            if (!srcInfo.readable) {
                throw new Error(`❌ Source not readable: ${srcInfo.path}\n➡ Fix: Check file/folder permissions or run the program with a user that has read access.`);
            }

            if (!srcInfo.isFile && !srcInfo.isDirectory) {
                throw new Error(`❌ Source exists but is neither a file nor a directory: ${srcInfo.path}`);
            }
            console.log(`✅ Loaded config from project file: ${configFilePath}`);



        } catch (error) {
            console.warn(`⚠️ Could not load project config from ${configFilePath}. Using base configuration.`);
        }
    }

    const envLevel = process.env.MICKOFONT_OPTIMIZATION_LEVEL as OptimizationLevel | undefined;

    if (envLevel) {
        if (Object.values(OptimizationLevel).includes(envLevel)) {
            finalConfig.optimizationLevel = envLevel;
        } else {
            const allowedValues = Object.values(OptimizationLevel).join(', ');
            const err = new Error(
                `Invalid MICKOFONT_OPTIMIZATION_LEVEL: "${envLevel}". Must be one of: ${allowedValues}.`
            );
            return [null, err];
        }
    }

    return [finalConfig, null];
}