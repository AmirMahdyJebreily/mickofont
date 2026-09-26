import { IconName } from './types';

/**
 * Generates a TypeScript enum code from icon names.
 * Keys are camelCase, values are CSS class names (kebab-case with prefix).
 */
export function generateEnumCode(iconNames: IconName[], exportName: string): string {
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
