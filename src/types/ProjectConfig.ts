import { SvgToFontOptions } from 'svgtofont';

/**
 * Defines the available levels for SVG optimization.
 */
export enum OptimizationLevel {
    FULL = 'full',
    MID = 'mid',
    NONE = 'none',
}

/**
 * The main configuration structure for the project (mickofont.config.ts).
 */
export interface ProjectConfig {
    optimizationLevel: OptimizationLevel;
    verbose: boolean;

    /**
     * Official options object passed directly to the svgtofont library.
     */
    svgToFontOptions: SvgToFontOptions;
}


export type CLIConfig = Partial<ProjectConfig | {
    configFilePath: string
}>

export type PartialProjectConfig = Partial<Omit<ProjectConfig, 'svgToFontOptions'>> & {
    svgToFontOptions?: Partial<SvgToFontOptions>
};