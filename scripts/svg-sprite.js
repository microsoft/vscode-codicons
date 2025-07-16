const SVGSpriter = require("svg-sprite");
const path = require("path");
const fs = require("fs");
const opts = require("minimist")(process.argv.slice(2));
const config = {
  mode: {
    symbol: {
      dest: opts.outDir,
      sprite: opts.outFile,
    },
  },
};
const spriter = new SVGSpriter(config);
const mapping = require("../src/template/mapping.json");

const mappingEntries = Object.entries(mapping);

// Check if the icons directory exists and has SVG files
const iconsDir = path.join(__dirname, '..', 'src', 'icons');
if (!fs.existsSync(iconsDir)) {
  console.error(`Error: Icons directory not found at ${iconsDir}`);
  process.exit(1);
}

const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));
if (svgFiles.length === 0) {
  console.error(`Error: No SVGs found in ${iconsDir}`);
  console.error('Make sure all SVG files are properly committed and available in the build.');
  process.exit(1);
}

console.log(`Found ${svgFiles.length} SVG files in ${iconsDir}`);

const findNames = (symbol) => {
  return mappingEntries.filter(([_, s]) => s === symbol).map(([name]) => name);
};

let processedFiles = 0;
mappingEntries.forEach(([mappedName, symbol]) => {
  // Use path.join for cross-platform compatibility
  const file = path.join(__dirname, '..', 'src', 'icons', `${mappedName}.svg`);

  if (fs.existsSync(file)) {
    processedFiles++;
    for (const name of findNames(symbol)) {
      // Use path.join for cross-platform compatibility
      const svgPath = path.join(__dirname, '..', 'src', 'icons', `${name}.svg`);
      spriter.add(
        svgPath,
        name + ".svg",
        fs.readFileSync(file, "utf-8"),
      );
    }
  }
});

console.log(`Processed ${processedFiles} SVG files from mapping`);

if (processedFiles === 0) {
  console.error('Error: No SVG files were processed from the mapping');
  process.exit(1);
}

spriter.compile(function (error, result, data) {
  if (error) {
    console.error('Error compiling sprites:', error);
    process.exit(1);
  }
  
  if (!result.symbol || !result.symbol.sprite) {
    console.error('Error: No sprite was generated');
    process.exit(1);
  }
  
  try {
    // Use path.join for cross-platform compatibility
    const outDirPath = path.resolve(opts.outDir);
    fs.mkdirSync(outDirPath, { recursive: true });
    fs.writeFileSync(result.symbol.sprite.path, result.symbol.sprite.contents);
    console.log(`Successfully created sprite at ${result.symbol.sprite.path}`);
  } catch (err) {
    console.error('Error writing output file:', err);
    process.exit(1);
  }
});
