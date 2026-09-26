import { Command } from 'commander';
import svgtofont from 'svgtofont';
import { loadProjectConfig } from '../../config/loader';
import { CLIConfig, OptimizationLevel } from '../../types/ProjectConfig';
import { svgoFullConfig, svgoMidConfig } from '../../config/svgo.config';
import { processSvgDirectory } from '../../utils/strike-to-fill';

export const makeFontOnlyCommand = new Command('make-font-only')
    .description('Processes SVG files and generates various font formats (TTF, WOFF, etc.) without TS types.')
    .option('-c, --config <file>', 'Path to the config file.')
    .option('-s, --src <folder>', 'Override the source directory for SVG icons.')
    .option('-d, --dist <folder>', 'Override the output directory for font files.')
    .option('--optimization-level <full,mid,none>', 'set optimization levels, recomended to use `mid`')
    .action(async (opts) => {
        console.log('make-font-only command registered...');

        const cliOverrides: CLIConfig = {
            optimizationLevel: opts.optimizationLevel,
            svgToFontOptions: {
                src: opts.src,
                dist: opts.dist,
            },
        };

        const [config, error] = await loadProjectConfig(cliOverrides, opts.config);

        if (error || !config) {
            console.error('❌ Configuration Error:', error?.message || 'Failed to load project configuration.');
            process.exit(1);
        }

        switch (config.optimizationLevel) {
            case OptimizationLevel.FULL:
                config.svgToFontOptions.svgoOptions = svgoFullConfig;
                if (config.verbose) console.log('✅ Optimization level set to FULL (Aggressive SVGO).');
                break;
            case OptimizationLevel.MID:
                config.svgToFontOptions.svgoOptions = svgoMidConfig;
                if (config.verbose) console.log('✅ Optimization level set to MID (Moderate SVGO).');
                break;
            case OptimizationLevel.NONE:
                config.svgToFontOptions.svgoOptions = undefined;
                if (config.verbose) console.log('⚠️ Optimization (SVGO) disabled.');
                break;
        }

        const srcPath = config.svgToFontOptions.src;
        const distPath = config.svgToFontOptions.dist;

        if (!srcPath || !distPath) {
            console.error('❌ Fatal Error: Source or distribution paths are not defined.');
            process.exit(1);
        }

        if (config.verbose) {
            console.log(`Starting font generation... (Source: ${srcPath}, Output: ${distPath})`);
        }

        try {
            if (config.strokeToFill) {
                console.warn("-----------------------------\n\n🚫🚫🚫 Danger, the 'strokeToFill' option is under develop for now. any unexpected behavior is possible...\n-----------------------------\n\n");
                const originalSvgPath = config!.svgToFontOptions.src!;
                const processedSvgPath = await processSvgDirectory(originalSvgPath);
                config!.svgToFontOptions.src = processedSvgPath;
            }

            await svgtofont(config.svgToFontOptions);

            console.log(`\n🎉 Success: Font files generated in ${distPath}`);
        } catch (err) {
            console.error(`\n❌ Font Generation Failed: An error occurred during the svgtofont process.`, err);
            process.exit(1);
        }
    });
