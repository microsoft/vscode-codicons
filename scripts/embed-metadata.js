const fs = require('fs');
const path = require('path');

const metadataPath = path.join(__dirname, '../src/template/metadata.json');
const htmlPath = path.join(__dirname, '../dist/codicon.html');

if (!fs.existsSync(htmlPath)) {
    console.error('HTML file not found:', htmlPath);
    process.exit(1);
}

const metadata = fs.readFileSync(metadataPath, 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');

const placeholder = '{} // METADATA_PLACEHOLDER';
const replacement = `${metadata} // METADATA_PLACEHOLDER`;

if (html.includes('// METADATA_PLACEHOLDER')) {
    // Use regex to replace the initialization
    html = html.replace(/let metadata = .* \/\/ METADATA_PLACEHOLDER/, `let metadata = ${metadata}; // METADATA_PLACEHOLDER`);
    fs.writeFileSync(htmlPath, html);
    console.log('Metadata embedded into HTML.');
} else {
    console.warn('Metadata placeholder not found in HTML.');
}
