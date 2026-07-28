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
 * Defines the available types for TypeScript code generation.
 */
export enum TypeScriptExportType {
    ENUM = 'enum',
    UNION = 'union',
}

/**
 * Configuration for TypeScript enum/union generation.
 */
export interface TypeScriptConfig {
    enabled: boolean;
    exportType: TypeScriptExportType;
    exportName: string;
    outputFile: string;
    includePrefix: boolean;
}

/**
 * The main configuration structure for the project (mickofont.config.ts).
 */
export interface ProjectConfig {
    optimizationLevel: OptimizationLevel;
    verbose: boolean;
    strokeToFill: boolean
    typeScript: TypeScriptConfig;

    /**
     * Official options object passed directly to the svgtofont library.
     */
    svgToFontOptions: SvgToFontOptions;
}


export type CLIConfig = Partial<ProjectConfig>

export type PartialProjectConfig = Partial<Omit<ProjectConfig, 'svgToFontOptions' | 'typeScript'>> & {
    svgToFontOptions?: Partial<SvgToFontOptions>;
    typeScript?: Partial<TypeScriptConfig>;
};