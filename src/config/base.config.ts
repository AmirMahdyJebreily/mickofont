import path from 'node:path';
import { ProjectConfig, OptimizationLevel } from '../types/ProjectConfig';

const rootPath = process.cwd();

/**
 * DEFAULT CONFIGURATION: The ultimate fallback defaults.
 */
const defaultConfig: ProjectConfig = {
    verbose: false,
    optimizationLevel: OptimizationLevel.FULL, 

    svgToFontOptions: {
        src: path.resolve(rootPath, 'icons'),
        dist: path.resolve(rootPath, 'fonts'),
        fontName: 'micko-icons',
        classNamePrefix: 'mko',
        
        // CRUCIAL: Normalization and Scaling Consistency
        svgicons2svgfont: {
            fontHeight: 1000, 
            normalize: true,  
        },
        
        // svgoOptions will be determined at runtime by 'optimizationLevel'
        svgoOptions: undefined, 
        
        css: true, 
    },
};

export default defaultConfig;