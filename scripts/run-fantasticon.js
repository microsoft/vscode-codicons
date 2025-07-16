/**
 * Script to run fantasticon with explicit path handling for Windows CI compatibility
 */
const { generateFonts } = require('fantasticon');
const fs = require('fs');
const path = require('path');

// For direct access to the internal APIs if needed
let runnerModule;
try {
  runnerModule = require('fantasticon/lib/generators/runner');
} catch (e) {
  console.log('Could not load fantasticon runner module: ' + e.message);
}

// Log environment information for debugging
console.log('Running fantasticon on platform: ' + process.platform);
console.log('Node version: ' + process.version);
console.log('Current working directory: ' + process.cwd());

// Get absolute paths
const rootDir = path.resolve(__dirname, '..');
const inputDir = path.resolve(rootDir, 'src', 'icons');
const outputDir = path.resolve(rootDir, 'dist');
const templateHtml = path.resolve(rootDir, 'src', 'template', 'preview.hbs');
const templateCss = path.resolve(rootDir, 'src', 'template', 'styles.hbs');

// Normalize all paths to use forward slashes for consistency across platforms
let normalizedInputDir = inputDir.replace(/\\/g, '/');
const normalizedOutputDir = outputDir.replace(/\\/g, '/');
const normalizedTemplateHtml = templateHtml.replace(/\\/g, '/');
const normalizedTemplateCss = templateCss.replace(/\\/g, '/');

// Log all resolved paths for debugging
console.log('Root directory: ' + rootDir);
console.log('Input directory: ' + inputDir);
console.log('Output directory: ' + outputDir);
console.log('Template HTML: ' + templateHtml);
console.log('Template CSS: ' + templateCss);
console.log('Normalized input directory: ' + normalizedInputDir);

// Load configuration
const pkgPath = path.join(rootDir, 'package.json');
const codepointsPath = path.join(rootDir, 'src', 'template', 'mapping.json');

console.log('Package.json path: ' + pkgPath);
console.log('Codepoints path: ' + codepointsPath);

// Check if package.json exists
if (!fs.existsSync(pkgPath)) {
  console.error('Error: package.json not found at: ' + pkgPath);
  process.exit(1);
}

// Check if mapping.json exists
if (!fs.existsSync(codepointsPath)) {
  console.error('Error: mapping.json not found at: ' + codepointsPath);
  process.exit(1);
}

// Check if template files exist
if (!fs.existsSync(templateHtml)) {
  console.error('Error: HTML template not found at: ' + templateHtml);
  process.exit(1);
}

if (!fs.existsSync(templateCss)) {
  console.error('Error: CSS template not found at: ' + templateCss);
  process.exit(1);
}

const pkg = require(pkgPath);
const codepoints = require(codepointsPath);

// Verify input directory exists
console.log('Looking for SVG icons in: ' + inputDir);
if (!fs.existsSync(inputDir)) {
  console.error('Error: Input directory not found: ' + inputDir);
  process.exit(1);
}

// Check if there are SVG files in the input directory
const allFiles = fs.readdirSync(inputDir);
console.log('Total files in directory: ' + allFiles.length);

// Get all SVG files with more reliable detection for Windows
const svgFiles = allFiles.filter(function(file) { 
  // Check both lowercase and original case for maximum compatibility
  return file.toLowerCase().endsWith('.svg') || file.endsWith('.SVG'); 
});

// Log some details about the first few files for diagnostics
if (svgFiles.length > 0) {
  console.log('First 5 SVG files:');
  for (var i = 0; i < Math.min(5, svgFiles.length); i++) {
    const filePath = path.join(inputDir, svgFiles[i]);
    const stats = fs.statSync(filePath);
    try {
      // Check if file is readable and has content
      const content = fs.readFileSync(filePath, 'utf8');
      const isSvgContent = content.includes('<svg') && content.includes('</svg>');
      console.log(' - ' + svgFiles[i] + ' (size: ' + stats.size + ' bytes, valid SVG: ' + isSvgContent + ')');
    } catch (error) {
      console.log(' - ' + svgFiles[i] + ' (size: ' + stats.size + ' bytes, ERROR: ' + error.message + ')');
    }
  }
}

if (svgFiles.length === 0) {
  console.error('Error: No SVG files found in ' + inputDir);
  process.exit(1);
}
console.log('Found ' + svgFiles.length + ' SVG files in the input directory');

// Special case for Windows: make sure the glob pattern works with normalized paths
if (process.platform === 'win32') {
  console.log('Windows platform detected, applying special path handling');
  
  // Check if paths have backslashes and log information
  console.log('Input directory with raw path: ' + inputDir);
  console.log('Input directory has backslashes: ' + inputDir.includes('\\'));
  console.log('Normalized input directory: ' + normalizedInputDir);
  
  // Create a flat directory structure for icons to avoid nested paths issues
  const tempDir = path.join(outputDir, 'temp_svg_icons');
  console.log('Creating temporary directory for SVG files: ' + tempDir);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create an assets object directly for fantasticon
  const assetsMap = {};
  
  // Copy each SVG file to temp directory with a flat structure
  svgFiles.forEach(function(file, index) {
    const sourcePath = path.join(inputDir, file);
    const destPath = path.join(tempDir, file);
    const iconId = file.replace(/\.svg$/i, '');
    
    try {
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(destPath, content, 'utf8');
      
      // Add to assets map (just in case we need this approach)
      assetsMap[iconId] = {
        id: iconId,
        absolutePath: destPath.replace(/\\/g, '/'),
        relativePath: file
      };
      
      if (index < 5) {
        console.log('Copied: ' + file + ' to ' + destPath);
      } else if (index === 5) {
        console.log('... and more files');
      }
    } catch (error) {
      console.error('Error copying file: ' + sourcePath + ' - ' + error.message);
    }
  });
  
  console.log('Copied ' + svgFiles.length + ' SVG files to temp directory');
  
  // Use temp directory as input with forward slashes
  normalizedInputDir = tempDir.replace(/\\/g, '/');
  console.log('Using temp directory as input: ' + normalizedInputDir);
  
  // Create a direct asset map file that can be loaded by fantasticon
  const assetsMapFile = path.join(tempDir, 'assets.json');
  try {
    fs.writeFileSync(assetsMapFile, JSON.stringify(assetsMap, null, 2), 'utf8');
    console.log('Created assets map file at: ' + assetsMapFile);
  } catch (error) {
    console.error('Error creating assets map: ' + error.message);
  }
  
  // Verify files in temp directory
  const tempFiles = fs.readdirSync(tempDir);
  const tempSvgFiles = tempFiles.filter(file => file.toLowerCase().endsWith('.svg'));
  console.log('Found ' + tempSvgFiles.length + ' SVG files in temp directory');
  
  if (tempSvgFiles.length === 0) {
    console.error('Error: Failed to copy SVG files to temp directory');
    process.exit(1);
  }
  
  // List some of the files in the temp directory to confirm they're there
  console.log('Files in temp directory:');
  for (var i = 0; i < Math.min(5, tempSvgFiles.length); i++) {
    const tempFilePath = path.join(tempDir, tempSvgFiles[i]);
    const tempStats = fs.statSync(tempFilePath);
    console.log(' - ' + tempSvgFiles[i] + ' (size: ' + tempStats.size + ' bytes)');
    
    // Validate SVG content
    try {
      const content = fs.readFileSync(tempFilePath, 'utf8');
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        console.error('Warning: ' + tempSvgFiles[i] + ' may not be a valid SVG');
      }
    } catch (err) {
      console.error('Error reading temp SVG: ' + err.message);
    }
  }
};

// Special case for Windows - try to patch the SVG file paths directly
if (process.platform === 'win32') {
  console.log('Windows platform detected, attempting to patch internal asset paths...');
  
  // Try a workaround for Windows by creating a paths.json file
  const pathsJsonPath = path.join(outputDir, 'paths.json');
  const svgPaths = svgFiles.map(file => {
    const svgPath = path.join(normalizedInputDir, file).replace(/\\/g, '/');
    return svgPath;
  });
  
  try {
    // Write the paths to a JSON file
    fs.writeFileSync(pathsJsonPath, JSON.stringify(svgPaths, null, 2), 'utf8');
    console.log('Created paths.json with ' + svgPaths.length + ' SVG paths');
    console.log('First path: ' + svgPaths[0]);
  } catch (error) {
    console.error('Error creating paths.json: ' + error.message);
  }
}

// Run fantasticon with explicit options
console.log('Running generateFonts with inputDir: ' + normalizedInputDir);
console.log('Font name: codicon');
console.log('Font prefix: codicon');
console.log('Font types: ttf');
console.log('Asset types: css, html');

generateFonts({
  name: 'codicon',
  prefix: 'codicon',
  inputDir: normalizedInputDir, // Use normalized path for Windows compatibility
  outputDir: normalizedOutputDir, // Use normalized path for Windows compatibility
  fontTypes: ['ttf'],
  assetTypes: ['css', 'html'],
  normalize: true,
  codepoints,
  // fontPath option removed as it's not supported
  templates: {
    html: normalizedTemplateHtml, // Use normalized path for Windows compatibility
    css: normalizedTemplateCss // Use normalized path for Windows compatibility
  },
  formatOptions: {
    ttf: {
      url: pkg.url,
      description: pkg.description,
      version: pkg.fontVersion
    }
  },
  // Custom getIconId function to handle Windows path issues - try various approaches
  getIconId: function(options) {
    // Log the options for diagnostics
    if (process.platform === 'win32' && options.index < 5) {
      console.log('getIconId options for #' + options.index + ':');
      console.log(' - basename: ' + options.basename);
      console.log(' - relativeDirPath: ' + options.relativeDirPath);
      console.log(' - absoluteFilePath: ' + options.absoluteFilePath);
      console.log(' - relativeFilePath: ' + options.relativeFilePath);
    }
    
    // For Windows paths, we want to extract just the filename
    const basename = options.basename;
    return basename;
  }
})
.then(function(results) {
  console.log('Fantasticon completed successfully:');
  
  // Show which files were generated
  console.log('Generated files:');
  console.log('✔ Generated font file: ' + path.join(outputDir, 'codicon.ttf'));
  console.log('✔ Generated CSS file: ' + path.join(outputDir, 'codicon.css'));
  console.log('✔ Generated HTML preview: ' + path.join(outputDir, 'codicon.html'));
})
.catch(function(error) {
  console.error('Error running fantasticon: ' + error.message);
  console.error('Error stack: ' + error.stack);
  
  // WINDOWS FALLBACK APPROACH
  if (process.platform === 'win32') {
    console.log('Using Windows fallback approach...');
    
    // Check if we can access the internal APIs
    if (runnerModule) {
      try {
        console.log('Attempting to use direct runner module...');
        
        // Create assets object directly
        const directAssets = {};
        svgFiles.forEach(function(file) {
          const iconId = file.replace(/\.svg$/i, '');
          const svgPath = path.join(normalizedInputDir, file).replace(/\\/g, '/');
          directAssets[iconId] = {
            id: iconId,
            absolutePath: svgPath,
            relativePath: file
          };
        });
        
        console.log('Created direct assets object with ' + Object.keys(directAssets).length + ' icons');
        
        // Create a runner with our direct assets
        const { Runner } = runnerModule;
        const runner = new Runner({
          name: 'codicon',
          prefix: 'codicon',
          fontTypes: ['ttf'],
          assetTypes: ['css', 'html'],
          codepoints: codepoints,
          formatOptions: {
            ttf: {
              url: pkg.url,
              description: pkg.description,
              version: pkg.fontVersion
            }
          },
          templates: {
            html: normalizedTemplateHtml,
            css: normalizedTemplateCss
          },
          pathOptions: {}
        });
        
        console.log('Created runner, attempting to generate fonts directly...');
        
        // Try to generate fonts with our assets
        runner.generateFonts(directAssets)
          .then(function(directResults) {
            console.log('Direct font generation successful');
            
            // Write the results to files
            Object.keys(directResults).forEach(function(type) {
              const outputPath = path.join(outputDir, 'codicon.' + type);
              fs.writeFileSync(outputPath, directResults[type]);
              console.log('✔ Generated ' + type + ' file: ' + outputPath);
            });
          })
          .catch(function(directError) {
            console.error('Error with direct font generation: ' + directError.message);
            console.error('Error stack: ' + directError.stack);
            process.exit(1);
          });
        
        return; // Don't exit with error if we're trying the fallback
      } catch (fallbackError) {
        console.error('Error with fallback approach: ' + fallbackError.message);
        console.error('Error stack: ' + fallbackError.stack);
      }
    } else {
      console.error('Runner module not available for fallback');
    }
  }
  
  console.error('Current working directory: ' + process.cwd());
  console.error('Input directory (' + inputDir + ') exists: ' + fs.existsSync(inputDir));
  console.error('Output directory (' + outputDir + ') exists: ' + fs.existsSync(outputDir));
  
  // Additional Windows-specific diagnostics
  if (process.platform === 'win32') {
    console.error('Windows-specific diagnostics:');
    console.error('normalizedInputDir: ' + normalizedInputDir);
    try {
      const tempFiles = fs.readdirSync(normalizedInputDir);
      console.error('Files in normalizedInputDir: ' + tempFiles.length);
      console.error('First 5 files in normalizedInputDir:');
      for (var i = 0; i < Math.min(5, tempFiles.length); i++) {
        console.error(' - ' + tempFiles[i]);
      }
    } catch (readError) {
      console.error('Error reading normalizedInputDir: ' + readError.message);
    }
  }
  
  process.exit(1);
});

// Run fantasticon with explicit options
generateFonts({
  name: 'codicon',
  prefix: 'codicon',
  inputDir: normalizedInputDir, // Use normalized path for Windows compatibility
  outputDir: normalizedOutputDir, // Use normalized path for Windows compatibility
  fontTypes: ['ttf'],
  assetTypes: ['css', 'html'],
  normalize: true,
  codepoints,
  // fontPath option removed as it's not supported
  templates: {
    html: normalizedTemplateHtml, // Use normalized path for Windows compatibility
    css: normalizedTemplateCss // Use normalized path for Windows compatibility
  },
  formatOptions: {
    ttf: {
      url: pkg.url,
      description: pkg.description,
      version: pkg.fontVersion
    }
  }
})
.then(function(results) {
  console.log('Fantasticon completed successfully:');
  
  // Show which files were generated
  console.log('Generated files:');
  console.log('✔ Generated font file: ' + path.join(outputDir, 'codicon.ttf'));
  console.log('✔ Generated CSS file: ' + path.join(outputDir, 'codicon.css'));
  console.log('✔ Generated HTML preview: ' + path.join(outputDir, 'codicon.html'));
})
.catch(function(error) {
  console.error('Error running fantasticon: ' + error.message);
  console.error('Error stack: ' + error.stack);
  console.error('Current working directory: ' + process.cwd());
  console.error('Input directory (' + inputDir + ') exists: ' + fs.existsSync(inputDir));
  console.error('Output directory (' + outputDir + ') exists: ' + fs.existsSync(outputDir));
  process.exit(1);
});
