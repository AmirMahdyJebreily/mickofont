import { Command } from 'commander';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getProjectConfigTypeImportPath(cwd: string): string {
    let packageName = 'mickofont';

    try {
        const packageJsonPath = require.resolve('mickofont/package.json', { paths: [cwd] });
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as { name?: string };

        if (packageJson.name) {
            packageName = packageJson.name;
        }
    } catch {
    }

    return `${packageName}/dist/types/ProjectConfig`;
}

function createDefaultConfigFile(typeImportPath: string, srcFolder: string, distFolder: string, optimizationLevel: string, typeOutputFile: string): string {
    const serializedSrcFolder = JSON.stringify(srcFolder);
    const serializedDistFolder = JSON.stringify(distFolder);
    const serializedOptimizationLevel = JSON.stringify(optimizationLevel);
    const serializedTypeOutputFile = JSON.stringify(typeOutputFile);

    return `/** @type {import('${typeImportPath}').ProjectConfig} */
module.exports = {
    verbose: false,
    optimizationLevel: ${serializedOptimizationLevel},
    strokeToFill: false,
    typeScript: {
        enabled: true,
        exportType: 'union',
        exportName: 'IconName',
        outputFile: ${serializedTypeOutputFile},
        includePrefix: true,
    },
    svgToFontOptions: {
        src: ${serializedSrcFolder},
        dist: ${serializedDistFolder},
        fontName: 'mickofont',
        classNamePrefix: 'mk',
        css: true,
        emptyDist: false,
        generateInfoData: true,
        svgicons2svgfont: {
            fontHeight: 1000,
            normalize: false,
        },
        svgoOptions: {
            multipass: true,
        },
    },
};
`;
}

export const initCommand = new Command('init')
    .description('Scaffold the default mickofont configuration and folders.')
    .option('-f, --force', 'Overwrite an existing config file.')
    .option('-s, --src <folder>', 'Override the source directory for SVG icons.')
    .option('-d, --dist <folder>', 'Override the output directory for font files.')
    .option('--optimization-level <full,mid,none>', 'set optimization levels, recomended to use `mid`')
    .action((options) => {
        const cwd = process.cwd();
        const typeImportPath = getProjectConfigTypeImportPath(cwd);
        const configPath = path.resolve(cwd, 'mickofont.config.js');
        const srcFolder = options.src ?? 'icons/svg';
        const distFolder = options.dist ?? 'icons/fonts';
        const optimizationLevel = options.optimizationLevel ?? 'full';
        const distParentDir = path.dirname(distFolder);
        const typeOutputFile = (distParentDir === '.'
            ? './types/IconNames.ts'
            : path.join(distParentDir, 'types', 'IconNames.ts'))
            .replace(/\\/g, '/');
        const svgPath = path.resolve(cwd, srcFolder);
        const fontsPath = path.resolve(cwd, distFolder);
        const typesPath = path.resolve(cwd, path.dirname(typeOutputFile));

        if (fs.existsSync(configPath) && !options.force) {
            console.error(`❌ Config already exists at ${configPath}. Use --force to overwrite it.`);
            process.exit(1);
        }

        fs.mkdirSync(svgPath, { recursive: true });
        fs.mkdirSync(fontsPath, { recursive: true });
        fs.mkdirSync(typesPath, { recursive: true });

        fs.writeFileSync(configPath, createDefaultConfigFile(typeImportPath, srcFolder, distFolder, optimizationLevel, typeOutputFile), 'utf8');

        console.log(`✅ Created default config: ${configPath}`);
        console.log(`✅ Ensured folders exist: ${svgPath}, ${fontsPath}, ${typesPath}`);
    });
