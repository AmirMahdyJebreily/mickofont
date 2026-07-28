import * as fs from 'node:fs';
import * as path from 'node:path';
import { TypeScriptExportType } from '../types/ProjectConfig';

/**
 * Icon name representation with both camelCase and CSS class formats
 */
interface IconName {
    camelCase: string;
    cssClass: string; // kebab-case with optional prefix
}

/**
 * Extracts icon names from SVG files in a directory.
 * Returns both camelCase and CSS class name formats.
 */
function getIconNamesFromDirectory(svgDirectory: string, prefix?: string): IconName[] {
    if (!fs.existsSync(svgDirectory)) {
        throw new Error(`SVG directory not found: ${svgDirectory}`);
    }

    const files = fs.readdirSync(svgDirectory);
    const iconNames = files
        .filter(file => file.endsWith('.svg'))
        .map(file => {
            // Remove .svg extension
            let name = file.replace(/\.svg$/, '');
            
            // camelCase version (for enum keys)
            let camelCaseName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            if (!/^[a-zA-Z_]/.test(camelCaseName)) {
                camelCaseName = '_' + camelCaseName;
            }

            // CSS class version (kebab-case with prefix)
            let cssClassName = name;
            if (prefix) {
                cssClassName = prefix + '-' + cssClassName;
            }

            return {
                camelCase: camelCaseName,
                cssClass: cssClassName
            };
        });

    // Remove duplicates based on camelCase name
    const seen = new Set<string>();
    return iconNames.filter(icon => {
        if (seen.has(icon.camelCase)) return false;
        seen.add(icon.camelCase);
        return true;
    });
}

/**
 * Generates a TypeScript enum code from icon names.
 * Keys are camelCase, values are CSS class names (kebab-case with prefix).
 */
function generateEnumCode(iconNames: IconName[], exportName: string): string {
    const members = iconNames
        .map(icon => `    ${icon.camelCase} = '${icon.cssClass}'`)
        .join(',\n');

    return `/**
 * Auto-generated TypeScript enum for icon names.
 * Keys are camelCase identifiers, values are CSS class names.
 * Generated from SVG files in your icons directory.
 */
export enum ${exportName} {
${members}
}
`;
}

/**
 * Generates a TypeScript union type code from icon names.
 * Uses CSS class names (kebab-case with prefix).
 */
function generateUnionCode(iconNames: IconName[], exportName: string): string {
    const members = iconNames.map(icon => `'${icon.cssClass}'`).join(' | ');

    return `/**
 * Auto-generated TypeScript union type for icon names.
 * Uses CSS class names (kebab-case format).
 * Generated from SVG files in your icons directory.
 */
export type ${exportName} = ${members};
`;
}

/**
 * Generates TypeScript enum or union type file based on icon names.
 * @param svgDirectory - Path to the directory containing SVG files
 * @param outputFile - Path where the TypeScript file should be generated
 * @param exportName - Name of the exported enum/type
 * @param exportType - Type of export: 'enum' or 'union'
 * @param prefix - Optional prefix to add to CSS class names
 * @param verbose - If true, logs output information
 */
export async function generateTypeScriptEnums(
    svgDirectory: string,
    outputFile: string,
    exportName: string,
    exportType: TypeScriptExportType,
    prefix?: string,
    verbose: boolean = false
): Promise<void> {
    try {
        // Get icon names from SVG files
        const iconNames = getIconNamesFromDirectory(svgDirectory, prefix);

        if (iconNames.length === 0) {
            console.warn('⚠️ No SVG files found in the icons directory.');
            return;
        }

        // Generate appropriate TypeScript code
        let tsCode: string;
        if (exportType === TypeScriptExportType.ENUM) {
            tsCode = generateEnumCode(iconNames, exportName);
        } else {
            tsCode = generateUnionCode(iconNames, exportName);
        }

        // Ensure output directory exists
        const outputDir = path.dirname(outputFile);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write to file
        fs.writeFileSync(outputFile, tsCode, 'utf-8');

        if (verbose) {
            console.log(`✅ Generated ${exportType} file: ${outputFile}`);
            console.log(`   - Export name: ${exportName}`);
            console.log(`   - Icon count: ${iconNames.length}`);
            if (prefix) {
                console.log(`   - Prefix: ${prefix}`);
            }
        }
    } catch (error) {
        console.error('❌ Failed to generate TypeScript enums:', error);
        throw error;
    }
}
