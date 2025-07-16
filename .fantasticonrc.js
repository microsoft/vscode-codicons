/* eslint-disable */
var pkg = require('./package.json');
var path = require('path');
var codepoints = require('./src/template/mapping.json');

module.exports = {
    name: 'codicon',
    prefix: 'codicon',
    codepoints: codepoints,
    inputDir: path.join(__dirname, 'src', 'icons'),
    outputDir: path.join(__dirname, 'dist'),
    fontTypes: ['ttf'],
    normalize: true,
    assetTypes: ['css', 'html'],
    templates: {
        html: path.join(__dirname, 'src', 'template', 'preview.hbs'),
        css: path.join(__dirname, 'src', 'template', 'styles.hbs')
    },
    formatOptions: {
        ttf: {
            url: pkg.url,
            description: pkg.description,
            version: pkg.fontVersion
        }
    }
};