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

// Log all resolved paths for debugging
console.log('Root directory: ' + rootDir);
console.log('Input directory: ' + inputDir);
console.log('Output directory: ' + outputDir);
console.log('Template HTML: ' + templateHtml);
console.log('Template CSS: ' + templateCss);

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
const svgFiles = fs.readdirSync(inputDir).filter(function(file) { 
  return file.endsWith('.svg'); 
});
if (svgFiles.length === 0) {
  console.error('Error: No SVG files found in ' + inputDir);
  process.exit(1);
}
console.log('Found ' + svgFiles.length + ' SVG files in the input directory');

// Run fantasticon with explicit options
generateFonts({
  name: 'codicon',
  prefix: 'codicon',
  inputDir,
  outputDir,
  fontTypes: ['ttf'],
  assetTypes: ['css', 'html'],
  normalize: true,
  codepoints,
  templates: {
    html: templateHtml,
    css: templateCss
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
