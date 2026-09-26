import { Command } from 'commander';
import { loadProjectConfig } from '../../config/loader';
import { CLIConfig } from '../../types/ProjectConfig';
import { processSvgDirectory } from '../../utils/strike-to-fill';
import { generateTypeScriptEnums } from '../../utils/ts-generator';

export const makeTypeCommand = new Command('make-type')
    .description('Generates only the TypeScript types (bypassing font generation).')
    .option('-c, --config <file>', 'Path to the config file.')
    .option('-s, --src <folder>', 'Override the source directory for SVG icons.')
    .option('--use-default', 'Use default config without asking if config is missing')
    .action(async (opts) => {
        console.log('make-type command registered...');

        const cliOverrides: CLIConfig = {
            svgToFontOptions: {
                src: opts.src,
            },
        };

        const [config, error] = await loadProjectConfig(cliOverrides, opts.config, opts.useDefault);

        if (error || !config) {
            console.error('❌ Configuration Error:', error?.message || 'Failed to load project configuration.');
            process.exit(1);
        }

        if (!config.typeScript) {
            console.error('❌ Type Generation Failed: typeScript configuration is missing.');
            process.exit(1);
        }

        if (!config.typeScript.enabled) {
            console.warn('⚠️ TypeScript generation is disabled in config.');
            process.exit(0);
        }

        try {
            let effectiveSrcPath = opts.src; // Default to src if we can't find it in config

            if (config.svgToFontOptions) {
                if (config.strokeToFill) {
                    console.warn("-----------------------------\n\n🚫🚫🚫 Danger, the 'strokeToFill' option is under develop for now. any unexpected behavior is possible...\n-----------------------------\n\n");
                    const originalSvgPath = config.svgToFontOptions.src!;
                    const processedSvgPath = await processSvgDirectory(originalSvgPath);
                    config.svgToFontOptions.src = processedSvgPath;
                }
                effectiveSrcPath = config.svgToFontOptions.src as string;
            }

            if (!effectiveSrcPath) {
                console.error('❌ Fatal Error: Source path is not defined for type generation.');
                process.exit(1);
            }

            const prefix = config.typeScript.includePrefix && config.svgToFontOptions ? config.svgToFontOptions.classNamePrefix : undefined;

            await generateTypeScriptEnums(
                effectiveSrcPath,
                config.typeScript.outputFile,
                config.typeScript.exportName,
                config.typeScript.exportType,
                prefix,
                config.verbose
            );

            console.log(`\n🎉 Success: TypeScript file generated at ${config.typeScript.outputFile}`);
        } catch (err) {
            console.error(`\n❌ Type Generation Failed: An error occurred.`, err);
            process.exit(1);
        }
    });
