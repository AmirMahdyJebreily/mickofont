import { IconName } from './types';

/**
 * Generates a TypeScript union type code from icon names.
 * Uses CSS class names (kebab-case with prefix).
 */
export function generateUnionCode(iconNames: IconName[], exportName: string): string {
    const members = iconNames.map(icon => `'${icon.cssClass}'`).join(' | ');

    return `/**
 * Auto-generated TypeScript union type for icon names.
 * Uses CSS class names (kebab-case format).
 * Generated from SVG files in your icons directory.
 */
export type ${exportName} = ${members};
`;
}
