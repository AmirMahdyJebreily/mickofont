// src/config/svgo.config.ts
// ❌ import { Config, PluginConfig } from 'svgo'; // <-- حذف شد

/**
 * SVGO configuration for aggressive optimization level (FULL).
 */
export const svgoFullConfig = { // Type is inferred as 'const' object
  multipass: true, 
  
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeDimensions: true, 
          mergePaths: true, // Aggressive merge
          removeViewBox: false, 
        },
      },
    },
    'removeMetadata', 
    'removeComments',
    'cleanupAttrs',
    'removeUselessStrokeAndFill',
  ],
};

/**
 * SVGO configuration for moderate optimization level (MID).
 */
export const svgoMidConfig = { // Type is inferred as 'const' object
  multipass: false, 
  
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeDimensions: true, 
          removeViewBox: false, 
          mergePaths: true, // Prevent merge
        },
      },
    },
    'removeMetadata', 
    'removeComments', 
    'cleanupAttrs',
  ],
};