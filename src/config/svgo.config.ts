import { Config, PluginConfig } from "svgo";

export const svgoFullConfig: Config = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // 'removeDimensions' is false by default in preset-default, so we enable it.
          removeDimensions: true, 
          // 'removeViewBox' is true by default, so we disable it to keep it.
          removeViewBox: false, 
          
        },
      },
    },
    // You can add other plugins that are not in the default preset here.
    // For example, to strip out all fill/stroke attributes:
    'removeUselessStrokeAndFill',
  ] as PluginConfig[], // <-- The key fix is casting to the correct 'Plugin' type
};

export const svgoMidConfig: Config = {
  multipass: false,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeDimensions: true,
          removeViewBox: false,
          // 'mergePaths' is true by default, so we disable it for medium optimization.
          mergePaths: false, 
        },
      },
    },
  ] as PluginConfig[], // <-- Also apply the cast here
};