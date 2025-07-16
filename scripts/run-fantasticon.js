/**
 * Script to run fantasticon with explicit path handling for Windows CI compatibility
 */
const { generateFonts } = require('fantasticon');
const path = require('path');
const fs = require('fs');

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
  
  // Copy each SVG file to temp directory with a flat structure
  svgFiles.forEach(function(file) {
    const sourcePath = path.join(inputDir, file);
    const destPath = path.join(tempDir, file);
    
    try {
      const content = fs.readFileSync(sourcePath, 'utf8');
      fs.writeFileSync(destPath, content, 'utf8');
      console.log('Copied: ' + file + ' to ' + destPath);
    } catch (error) {
      console.error('Error copying file: ' + sourcePath + ' - ' + error.message);
    }
  });
  
  console.log('Copied ' + svgFiles.length + ' SVG files to temp directory');
  
  // Use temp directory as input with forward slashes
  normalizedInputDir = tempDir.replace(/\\/g, '/');
  console.log('Using temp directory as input: ' + normalizedInputDir);
  
  // Verify files in temp directory
  const tempFiles = fs.readdirSync(tempDir);
  const tempSvgFiles = tempFiles.filter(file => file.toLowerCase().endsWith('.svg'));
  console.log('Found ' + tempSvgFiles.length + ' SVG files in temp directory');
  
  if (tempSvgFiles.length === 0) {
    console.error('Error: Failed to copy SVG files to temp directory');
    process.exit(1);
  }
};

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
  },
  // Custom getIconId function to handle Windows path issues
  getIconId: function(options) {
    const basename = options.basename;
    // Simple function to just use the basename of the file
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
