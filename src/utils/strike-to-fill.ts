/**
 * This module provides a complete pipeline for processing SVG files:
 * 1. Loads all SVGs from a source directory.
 * 2. Converts any stroke-based paths to fill-based paths.
 * 3. Saves the processed SVG files to a new, unique temporary directory.
 */

// --- Node.js Built-in Modules ---
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// --- NPM Dependencies ---
// Used for fast, reliable XML/SVG parsing
import * as cheerio from 'cheerio';
// Used for the complex geometry of converting strokes to fills
const outline = require('svg-path-outline');

/**
 * =================================================================
 * STEP 2 & 3: Check for strokes and convert them to fills.
 * (This is your provided function, with the `import` fixed)
 * =================================================================
 *
 * Checks an SVG string for stroke-based paths and converts them to
 * fill-based paths. If no strokes are found, it returns the
 * original content.
 */
function convertStrokesToFills(svgContent: string): string {
  // 1. Load the SVG content into cheerio for safe parsing
  const $ = cheerio.load(svgContent, {
    xmlMode: true, // We are parsing SVG/XML, not HTML
  });

  // 2. Find every <path> element that has a 'stroke' attribute
  const pathsToConvert = $('path[stroke]');

  // If no paths have strokes, return the original content immediately.
  // This is the "check" step.
  if (pathsToConvert.length === 0) {
    return svgContent;
  }

  pathsToConvert.each((index, element) => {
    const $path = $(element);

    // 3. Get all the stroke properties
    const d = $path.attr('d');
    const stroke = $path.attr('stroke');
    const strokeWidth = $path.attr('stroke-width');
    const strokeLinecap = $path.attr('stroke-linecap') as 'round' | 'butt' | 'square' | undefined;
    const strokeLinejoin = $path.attr('stroke-linejoin') as 'round' | 'miter' | 'bevel' | undefined;

    // Skip if essential properties are missing
    if (!d || !stroke || !strokeWidth) {
      return;
    }

    const width = parseFloat(strokeWidth);
    if (isNaN(width) || width === 0) {
      return;
    }

    // 4. --- THE CORE LOGIC ---
    // Use the geometry library to calculate the new filled path 'd'
    const newD = outline(d, width, {
      join: strokeLinejoin || 'miter', // Default 'miter'
      cap: strokeLinecap || 'butt',   // Default 'butt'
    });

    // 5. Modify the path element
    $path.attr('d', newD);        // Set the new path data
    $path.attr('fill', stroke);   // Set the fill to the old stroke color

    // Remove the old stroke attributes
    $path.removeAttr('stroke');
    $path.removeAttr('stroke-width');
    $path.removeAttr('stroke-linecap');
    $path.removeAttr('stroke-linejoin');
    
    // Also remove fill="none" if it exists
    if ($path.attr('fill') === 'none') {
      $path.removeAttr('fill');
    }
  });

  // 6. Return the modified SVG as a string
  return $.xml();
}

/**
 * =================================================================
 * STEP 1: Load all SVG files from a directory concurrently.
 * =================================================================
 *
 * @param srcDir The source directory to read SVGs from.
 * @returns A Map where keys are filenames (e.g., "icon.svg")
 * and values are the string content of the file.
 */
async function loadSvgFiles(srcDir: string): Promise<Map<string, string>> {
  try {
    const files = await fs.readdir(srcDir);
    const svgFiles = files.filter(file => file.toLowerCase().endsWith('.svg'));

    // Create an array of promises to read all files concurrently
    const readPromises = svgFiles.map(async (file): Promise<[string, string]> => {
      const filePath = path.join(srcDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      return [file, content];
    });

    // Wait for all files to be read
    const fileEntries = await Promise.all(readPromises);

    return new Map(fileEntries);
  } catch (err: any) {
    console.error(`Error reading files from ${srcDir}:`, err);
    throw new Error(`Could not load SVG files: ${err.message}`);
  }
}

/**
 * =================================================================
 * STEP 4: Write processed files to a new temporary directory.
 * =================================================================
 *
 * @param files A Map of filenames and their new string content.
 * @returns The absolute path to the newly created temporary directory.
 */
async function writeFilesToTempDir(files: Map<string, string>): Promise<string> {
  try {
    // 1. Create a unique folder name in the OS's temp directory
    const tempBaseDir = os.tmpdir();
    const uniqueId = crypto.randomBytes(6).toString('hex');
    const tempDirPath = path.join(tempBaseDir, `mickofont-processed-${uniqueId}`);

    // 2. Create the directory
    await fs.mkdir(tempDirPath, { recursive: true });

    // 3. Create an array of promises to write all files concurrently
    const writePromises: Promise<void>[] = [];
    for (const [filename, content] of files) {
      const outputPath = path.join(tempDirPath, filename);
      writePromises.push(fs.writeFile(outputPath, content, 'utf-8'));
    }

    // 4. Wait for all files to be written
    await Promise.all(writePromises);

    // 5. Return the path to the new directory
    return tempDirPath;
  } catch (err: any) {
    console.error(`Error writing files to temporary directory:`, err);
    throw new Error(`Could not write temp files: ${err.message}`);
  }
}

/**
 * =================================================================
 * MAIN PIPELINE FUNCTION
 * =================================================================
 *
 * Executes the full process:
 * 1. Loads all SVGs from `srcDir`.
 * 2. Converts strokes to fills on all of them.
 * 3. Writes the new files to a unique temporary directory.
 *
 * @param srcDir The source directory containing your .svg files.
 * @returns The absolute path to the temporary directory
 * containing the processed files.
 */
export async function processSvgDirectory(srcDir: string): Promise<string> {
  console.log(`[Step 1/4] Loading SVG files from: ${srcDir}`);
  const loadedFiles = await loadSvgFiles(srcDir);
  console.log(`[Step 2/4] Found ${loadedFiles.size} SVG files.`);

  console.log('[Step 3/4] Processing files: checking for strokes and converting to fills...');
  const processedFiles = new Map<string, string>();
  let convertedCount = 0;

  for (const [filename, originalContent] of loadedFiles) {
    const processedContent = convertStrokesToFills(originalContent);
    if (originalContent !== processedContent) {
      convertedCount++;
    }
    processedFiles.set(filename, processedContent);
  }
  console.log(`[Step 3/4] Conversion complete. ${convertedCount} files were modified.`);

  console.log('[Step 4/4] Writing processed files to a new temporary directory...');
  const tempPath = await writeFilesToTempDir(processedFiles);
  console.log(`[Step 4/4] Success! Processed files are ready in: ${tempPath}`);

  return tempPath;
}