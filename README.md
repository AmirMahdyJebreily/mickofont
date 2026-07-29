# Mickofont

A highly-optimized CLI toolchain for converting SVG icons into web font formats (TTF, WOFF, WOFF2, EOT, SVG Symbol), with optional TypeScript icon-name generation.

[![npm version](https://img.shields.io/npm/v/mickofont.svg)](https://www.npmjs.com/package/mickofont)
[![license](https://img.shields.io/npm/l/mickofont.svg)](./LICENSE)

## Features

- Convert a folder of SVG icons into TTF, WOFF, WOFF2, EOT, and SVG Symbol font formats.
- Built on top of [svgtofont](https://github.com/jaywcjlove/svgtofont) with sensible defaults.
- Configurable SVGO optimization levels (`full`, `mid`, `none`) to shrink SVG size before font generation.
- Optional TypeScript icon name generation (union type or enum) for type-safe icon usage in your app.
- Simple `init` scaffolding command to generate a ready-to-edit config file and folder structure.
- `clean` command to safely remove generated fonts and generated type files.
- Experimental `strokeToFill` conversion pipeline for stroke-based icons.

## Installation

### Local (project dependency)

```bash
npm i mickofont@latest
```

### Global (recommended for CLI usage anywhere)

```bash
npm i -g mickofont@latest
```

After a global install, the `mickofont` command becomes available directly in your terminal.

### One-off usage without installing

```bash
npx mickofont@latest init
```

## Quick Start

```bash
# 1. Scaffold config + folders
mickofont init

# 2. Drop your SVG icons into icons/svg (or your custom --src folder)

# 3. Generate the fonts
mickofont make-font

# 4. (Optional) Clean generated output
mickofont clean
```

## Commands

### `mickofont init`

Scaffolds the default `mickofont.config.js` file plus the source/dist/types folders.

| Option | Description | Default |
|---|---|---|
| `-f, --force` | Overwrite an existing config file. | `false` |
| `-s, --src <path>` | Override the source directory for SVG icons. | `icons/svg` |
| `-d, --dist <path>` | Override the output directory for font files. | `icons/fonts` |
| `--optimization-level <level>` | SVGO optimization level: `full`, `mid`, or `none`. `mid` is recommended. | `full` |

Example:

```bash
mickofont init --src assets/icons --dist assets/fonts --optimization-level mid
```

This creates `mickofont.config.js` in your current working directory, along with the `src`, `dist`, and a `types` folder (used for generated TypeScript icon names).

### `mickofont make-font`

Processes the SVG icons and generates the font files (TTF, WOFF, WOFF2, EOT, SVG Symbol) plus a matching CSS file.

| Option | Description |
|---|---|
| `-c, --config <path>` | Path to a custom config file. Defaults to `mickofont.config.js` in the current directory (or `MICKOFONT_CONFIG_PATH` env var). |
| `-s, --src <path>` | Override the source SVG directory from the config. |
| `-d, --dist <path>` | Override the output directory from the config. |
| `--optimization-level <level>` | Override the SVGO optimization level (`full`, `mid`, `none`). |

Example:

```bash
mickofont make-font --optimization-level mid
```

What happens under the hood:

1. Your config is loaded and merged with CLI overrides.
2. SVGO optimization is applied to your icons based on the chosen level.
3. If `strokeToFill` is enabled, stroke-based SVGs are converted to filled paths first (experimental).
4. `svgtofont` generates TTF/WOFF/WOFF2/EOT/SVG Symbol font files plus a CSS file in your dist folder.
5. If TypeScript generation is enabled, a union type or enum of icon names is written to the configured output file.

### `mickofont clean`

Removes the generated font output folder and the generated TypeScript types folder, based on your config.

| Option | Description |
|---|---|
| `-c, --config <path>` | Path to a custom config file. |
| `-v, --verbose` | Print detailed logs about what is being removed/skipped. |

Example:

```bash
mickofont clean --verbose
```

### `mickofont --version` / `-v`

Prints the current installed version of mickofont.

## Configuration Reference

The config file (`mickofont.config.js` by default) exports a `ProjectConfig` object:

```js
/** @type {import('mickofont/dist/types/ProjectConfig').ProjectConfig} */
module.exports = {
  verbose: false,
  optimizationLevel: 'full', // 'full' | 'mid' | 'none'
  strokeToFill: false,       // experimental: converts stroke SVGs to filled paths
  typeScript: {
    enabled: true,
    exportType: 'union',     // 'union' | 'enum'
    exportName: 'IconName',
    outputFile: './types/IconNames.ts',
    includePrefix: true,
  },
  svgToFontOptions: {
    src: 'icons/svg',
    dist: 'icons/fonts',
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
```

### Top-level options

| Key | Type | Description |
|---|---|---|
| `verbose` | `boolean` | Enables detailed logging across commands. |
| `optimizationLevel` | `'full' \| 'mid' \| 'none'` | Controls how aggressively SVGO optimizes icons before font generation. |
| `strokeToFill` | `boolean` | Experimental: converts stroke-based SVG paths to filled paths before processing. |
| `typeScript` | `object` | Controls generation of TypeScript icon-name types (see below). |
| `svgToFontOptions` | `object` | Passed directly to the underlying `svgtofont` library (see [svgtofont docs](https://github.com/jaywcjlove/svgtofont)). |

### `typeScript` options

| Key | Type | Description |
|---|---|---|
| `enabled` | `boolean` | Enables/disables TypeScript icon name generation. |
| `exportType` | `'union' \| 'enum'` | Generates either a union string literal type or a TypeScript enum. |
| `exportName` | `string` | Name of the generated type/enum (e.g. `IconName`). |
| `outputFile` | `string` | Path where the generated `.ts` file is written. |
| `includePrefix` | `boolean` | Whether generated names include the `classNamePrefix` (e.g. `mk-home`). |

### Optimization levels

| Level | Behavior |
|---|---|
| `full` | Aggressive SVGO preset (multipass, strips useless stroke/fill, removes dimensions). Smallest output, recommended for production icon sets. |
| `mid` | Moderate SVGO preset (single pass, keeps path merging disabled). Good balance of speed and size. **Recommended default.** |
| `none` | Disables SVGO entirely; SVGs are used as-is. |

## Environment Variables

| Variable | Description |
|---|---|
| `MICKOFONT_CONFIG_PATH` | Overrides the config file path for all commands, taking priority over `--config` and the default `mickofont.config.js` lookup. |

## Recommended Project Structure

```
my-project/
├── icons/
│ ├── svg/ # your raw SVG icons (input)
│ ├── fonts/ # generated font files + CSS (output)
│ └── types/
│ └── IconNames.ts # generated TypeScript icon name type
├── mickofont.config.js
└── package.json
```


## Typical Workflow

1. Run `mickofont init` once per project to scaffold config and folders.
2. Add your `.svg` icon files into the configured `src` folder.
3. Run `mickofont make-font` every time you add/update icons.
4. Import the generated CSS and, optionally, the generated `IconName` type in your frontend project for type-safe icon usage.
5. Run `mickofont clean` if you need to regenerate everything from scratch.

## Notes & Known Limitations

- The `strokeToFill` option is still under active development; unexpected behavior is possible on complex stroke-based SVGs.
- `svgToFontOptions` accepts the full option set supported by the underlying `svgtofont` library, so advanced users can pass any additional `svgtofont` option (e.g. website preview generation, custom SVG font info) directly in their config.

## License

ISC © [CodeAgha](https://github.com/AmirMahdyJebreily/mickofont)
