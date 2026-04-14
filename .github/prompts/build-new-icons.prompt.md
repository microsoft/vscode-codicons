---
description: Build codicons and update mapping.json & metadata.json after adding new icons
argument-hint: List the new icon names you added (e.g. "wand, sparkle-filled")
tools: ['execute/runInTerminal', 'execute/getTerminalOutput', 'read', 'edit', 'search']
---

New SVG icons have been added to `src/icons/`. Your job is to build the font, update the template files, and verify everything is consistent.

## Steps

1. **Identify new icons** — compare `src/icons/*.svg` against the entries in `src/template/metadata.json` to find icons that don't have metadata yet. List them.

2. **Run the build** — execute `npm run build` in the `vscode-codicons` workspace root. Wait for it to finish and confirm it succeeds (exit code 0). If it fails, diagnose and fix the issue before continuing.

3. **Check mapping.json** — read `src/template/mapping.json`. The build's `fantasticon` step auto-generates this file. Verify each new icon appears as a primary name under its codepoint. If any new icon is missing, something went wrong in the build — investigate.

4. **Update metadata.json** — for each new icon that is missing from `src/template/metadata.json`, add an entry with this shape:
   ```json
   "<icon-name>": {
     "tags": ["<keyword1>", "<keyword2>", ...],
     "category": "<category>",
     "description": "<Short description of the icon>"
   }
   ```
   - **tags**: 4–8 search keywords describing the icon's visual appearance and usage.
   - **category**: one of the existing categories already in the file (e.g. `"action"`, `"navigation"`, `"debug"`, `"file"`, `"user"`, `"git"`, `"layout"`, `"editor"`, `"symbol"`, `"status"`, `"media"`, `"device"`, `"misc"`). Pick the best fit.
   - **description**: a concise one-line description.
   - Keep entries sorted alphabetically by icon name.

5. **Run the metadata check** — execute `node scripts/check-metadata.js` and confirm zero missing or orphaned entries.

6. **Summary** — list the new icons added, their codepoints from mapping.json, and their metadata entries.
