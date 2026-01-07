const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '../src/icons');
const htmlPath = path.join(__dirname, '../dist/codicon.html');

if (!fs.existsSync(htmlPath)) {
    console.error('HTML file not found:', htmlPath);
    process.exit(1);
}

// Read all SVG files and build a data object
const svgData = {};
const svgFiles = fs.readdirSync(iconsDir).filter(file => file.endsWith('.svg'));

for (const file of svgFiles) {
    const name = path.basename(file, '.svg');
    const content = fs.readFileSync(path.join(iconsDir, file), 'utf8');
    svgData[name] = content;
}

let html = fs.readFileSync(htmlPath, 'utf8');

if (html.includes('// SVG_DATA_PLACEHOLDER')) {
    // Use regex to replace the initialization
    html = html.replace(/let svgData = .* \/\/ SVG_DATA_PLACEHOLDER/, `let svgData = ${JSON.stringify(svgData)}; // SVG_DATA_PLACEHOLDER`);
    fs.writeFileSync(htmlPath, html);
    console.log(`SVG data embedded into HTML (${Object.keys(svgData).length} icons).`);
} else {
    console.warn('SVG data placeholder not found in HTML.');
}
