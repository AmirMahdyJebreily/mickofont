import * as fs from 'node:fs';
import * as path from 'node:path';
import { TypeScriptExportType } from '../../types/ProjectConfig';
import { getIconNamesFromDirectory } from './get-icon-names';
import { generateEnumCode } from './generate-enum';
import { generateUnionCode } from './generate-union';

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
