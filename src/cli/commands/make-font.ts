// src/cli/commands/make-font.ts

import { Command } from 'commander';
import svgtofont from 'svgtofont';
import { loadProjectConfig } from '../../config/loader'; 
import { OptimizationLevel, ProjectConfig } from '../../types/ProjectConfig.d';
import { svgoFullConfig, svgoMidConfig } from '../../config/svgo.config'; // Configuration for SVGO levels

/**
 * Defines the main command to process SVGs and generate font files.
 * It integrates config loading, optimization, and the core svgtofont library call.
 */
export const makeFontCommand = new Command('make-font')
  .description('Processes SVG files and generates various font formats (TTF, WOFF, etc.).')
  .option('-s, --src <folder>', 'Override the source directory for SVG icons.')
  .option('-d, --dist <folder>', 'Override the output directory for font files.')
  .action(async (opts) => {
    
    // 1. Construct CLI overrides for the loader (CLI has highest priority)
    const cliOverrides: Partial<ProjectConfig> = {
        // Only override if the option was actually passed
        svgToFontOptions: {
            src: opts.src, 
            dist: opts.dist,
        }
    };

    // 2. Load the final configuration with explicit error checking (from loader.ts update)
    const [config, error] = loadProjectConfig(cliOverrides);

    if (error || !config) {
        console.error('❌ Configuration Error:', error?.message || 'Failed to load project configuration.');
        process.exit(1);
    }
    
    // 3. SVG Processing Pipeline: Apply SVGO Configuration based on OptimizationLevel
    switch (config.optimizationLevel) {
        case OptimizationLevel.FULL:
            // Apply the aggressive SVGO config
            config.svgToFontOptions.svgoOptions = svgoFullConfig;
            if (config.verbose) console.log('✅ Optimization level set to FULL (Aggressive SVGO).');
            break;
            
        case OptimizationLevel.MID:
            // Apply the moderate SVGO config
            config.svgToFontOptions.svgoOptions = svgoMidConfig;
            if (config.verbose) console.log('✅ Optimization level set to MID (Moderate SVGO).');
            break;

        case OptimizationLevel.NONE:
            // Explicitly set to undefined to skip the SVGO step
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
        // 4. Execute the core font generation using the final config object
        await svgtofont(config.svgToFontOptions);
        
        console.log(`\n🎉 Success: Font files generated in ${distPath}`);
        if (config.verbose) {
             console.log(`Generated: WOFF, TTF, EOT, SVG, and declarations (TS/CSS).`);
        }
        
    } catch (err) {
        console.error(`\n❌ Font Generation Failed: An error occurred during the svgtofont process.`, err);
        process.exit(1);
    }
  });