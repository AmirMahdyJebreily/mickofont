import * as fs from 'node:fs';
import { camelCase, kebabCase } from 'change-case';
import { IconName } from './types';

/**
 * Extracts icon names from SVG files in a directory.
 * Returns both camelCase and CSS class name formats.
 */
export function getIconNamesFromDirectory(svgDirectory: string, prefix?: string): IconName[] {
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
            let camelCaseName = camelCase(name);
            if (!/^[a-zA-Z_]/.test(camelCaseName)) {
                camelCaseName = '_' + camelCaseName;
            }

            // CSS class version (kebab-case with prefix)
            let cssClassName = kebabCase(name);
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
