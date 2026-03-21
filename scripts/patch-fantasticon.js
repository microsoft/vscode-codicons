/*
 * Temporary Windows compatibility patch for Fantasticon.
 *
 * Context:
 * https://github.com/tancredi/fantasticon/issues/470
 *
 * Fantasticon 4.x builds the SVG discovery pattern internally using `path.join`
 * and then passes that pattern into `glob`. On Windows, `path.join` emits
 * backslashes, so the generated pattern looks like:
 *
 *   D:\a\vscode-codicons\vscode-codicons\src\icons\**\*.svg
 *
 * The `glob` package does not interpret those backslashes as path separators in
 * a glob expression. Instead, they are treated as escape characters. The result
 * is that the pattern matches zero files, even though the icons are present on
 * disk and earlier build steps such as `svgo -f ./src/icons/` can see them.
 *
 * That is why the CI failure looks misleading:
 *
 *   No SVGs found in D:/a/vscode-codicons/vscode-codicons/src/icons
 *
 * The directory exists. The files exist. The problem is the glob pattern that
 * Fantasticon constructs internally before it searches for the files.
 *
 * We already normalize the paths we pass into `.fantasticonrc.js`, but that is
 * not sufficient because Fantasticon recreates the broken Windows pattern inside
 * its own compiled runtime. The upstream issue thread repeatedly points to the
 * same low-level fix: normalize the generated glob path to forward slashes
 * before `glob` receives it.
 *
 * This script applies exactly that workaround to the installed Fantasticon
 * package on Windows before the `fantasticon` CLI is executed. It patches both
 * the library bundle and the CLI bundle because the published package contains
 * duplicated compiled entrypoints under `dist/`.
 *
 * Scope and intent:
 * - Windows only
 * - No-op on macOS/Linux
 * - Idempotent if the dependency is already patched
 * - Fails loudly if Fantasticon changes shape and the expected line is no longer
 *   present, because a silent no-op would hide a broken release path
 *
 * This should be considered a repository-side compatibility shim until the
 * upstream fix from the Fantasticon issue/PR thread lands in a released version
 * that we can consume directly.
 */
const fs = require('fs');
const path = require('path');

if (process.platform !== 'win32') {
    process.exit(0);
}

const targetFiles = [
    path.resolve(__dirname, '..', 'node_modules', 'fantasticon', 'dist', 'index.cjs'),
    path.resolve(__dirname, '..', 'node_modules', 'fantasticon', 'dist', 'cli', 'index.cjs')
];

const replacementSuffix = ".replace(/\\\\/g, '/')";
const targetSnippet = '`**/*.${ASSETS_EXTENSION}`';
let patchedFileCount = 0;
let alreadyPatchedCount = 0;

for (const targetFile of targetFiles) {
    if (!fs.existsSync(targetFile)) {
        continue;
    }

    const originalContent = fs.readFileSync(targetFile, 'utf8');
    const patchedContent = originalContent
        .split('\n')
        .map((line) => {
            if (!line.includes('const globPath = ') || !line.includes(targetSnippet) || line.includes(replacementSuffix)) {
                return line;
            }

            return line.replace(';', `${replacementSuffix};`);
        })
        .join('\n');

    if (patchedContent !== originalContent) {
        fs.writeFileSync(targetFile, patchedContent, 'utf8');
        patchedFileCount += 1;
        continue;
    }

    if (originalContent.includes(replacementSuffix)) {
        alreadyPatchedCount += 1;
    }
}

if (patchedFileCount === 0 && alreadyPatchedCount === 0) {
    console.error('fantasticon-fix: expected globPath pattern not found in installed Fantasticon files.');
    process.exit(1);
}
