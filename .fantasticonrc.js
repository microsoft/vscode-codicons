/* eslint-disable */
var pkg = require('./package.json');
var path = require('path');
var codepoints = require('./src/template/mapping.json');

// Ensure paths are platform-agnostic for Windows CI
var inputDir = path.resolve(__dirname, 'src', 'icons');
var outputDir = path.resolve(__dirname, 'dist');
var templateHtml = path.resolve(__dirname, 'src', 'template', 'preview.hbs');
var templateCss = path.resolve(__dirname, 'src', 'template', 'styles.hbs');

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