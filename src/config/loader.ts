import { ProjectConfig, OptimizationLevel } from '../types/ProjectConfig';
import defaultConfig from './base.config';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { merge } from 'lodash';


export function loadProjectConfig(cliOptions: Partial<ProjectConfig> = {}): [ProjectConfig | null, Error | null] {
    let finalConfig: ProjectConfig = defaultConfig;

    const configFilePath = process.env.MICKOFONT_CONFIG_PATH || path.resolve(process.cwd(), 'mickofont.config.js');

    if (fs.existsSync(configFilePath)) {
        try {
            const projectConfig = require(configFilePath).default || require(configFilePath);

            finalConfig = merge({}, finalConfig, projectConfig);
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

    finalConfig = merge({}, finalConfig, cliOptions);


    return [finalConfig, null];
}