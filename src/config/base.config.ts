import path from 'node:path';
import { ProjectConfig, OptimizationLevel } from '../types/ProjectConfig';
import { SvgToFontOptions } from 'svgtofont';

const rootPath = process.cwd();

const defaultSvgToFontOptions: SvgToFontOptions = {
    src: path.resolve(rootPath, 'svg'),
    dist: path.resolve(rootPath, 'fonts'),
    fontName: 'mickofont' as const,
    classNamePrefix: "mk",
    css: true as const,
    emptyDist: false as const,
    generateInfoData: true as const,
    // IMPORTANT
    svgicons2svgfont: {
        fontHeight: 1000 as const,
        normalize: false as const,
    } as const,
    svgoOptions: {
        multipass: true as const,
    } as const,
} as const satisfies SvgToFontOptions;

/**
 * DEFAULT CONFIGURATION: The ultimate fallback defaults.
 */
const defaultConfig: ProjectConfig = {
    verbose: false,
    optimizationLevel: OptimizationLevel.FULL,
    strokeToFill: false,
    svgToFontOptions: defaultSvgToFontOptions
};

export default defaultConfig;