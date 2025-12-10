/* eslint-disable */
var pkg = require('./package.json');
var path = require('path');
var mapping = require('./src/template/mapping.json');

// Ensure paths are platform-agnostic for Windows CI
var inputDir = path.resolve(__dirname, 'src', 'icons');
var outputDir = path.resolve(__dirname, 'dist');
var templateHtml = path.resolve(__dirname, 'src', 'template', 'preview.hbs');
var templateCss = path.resolve(__dirname, 'src', 'template', 'styles.hbs');

// Convert new mapping format back to alias -> code format for fantasticon
// New format: { "code": ["alias1", "alias2", ...] }
// Fantasticon expects: { "alias1": code, "alias2": code, ... }
var codepoints = {};
Object.entries(mapping).forEach(function([code, aliases]) {
    var codeNum = parseInt(code);
    aliases.forEach(function(alias) {
        codepoints[alias] = codeNum;
    });
});

module.exports = {
    name: 'codicon',
    prefix: 'codicon',
    codepoints: codepoints,
    inputDir: inputDir,
    outputDir: outputDir,
    fontTypes: ['ttf'],
    normalize: true,
    assetTypes: ['css', 'html'],
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
};