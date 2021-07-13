const package = require('./package.json');
const codepoints = require('./src/template/mapping.json');

module.exports = {
    name: 'codicon',
    prefix: 'codicon',
    codepoints: codepoints,
    inputDir: './src/icons',
    outputDir: './dist',
    fontTypes: ['ttf'],
    normalize: true,
    assetTypes: ['css', 'html'],
    templates: {
        html: './src/template/preview.hbs',
        css: './src/template/styles.hbs'
    },
    formatOptions: {
        ttf: {
            url: package.url,
            description: package.description,
            version: package.fontVersion
        }
    }
};