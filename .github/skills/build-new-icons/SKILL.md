---
name: build-new-icons
description: Use after adding SVG icons to vscode-codicons. Builds the codicon font, verifies generated mappings, adds searchable metadata, and checks icon metadata consistency.
---

# Build New Icons

Use this workflow after new SVG icons are added to `src/icons/`.

## Workflow

1. Compare `src/icons/*.svg` with the entries in `src/template/metadata.json`.
2. Identify and list every icon that does not yet have metadata. If the user supplied icon names, verify them against this comparison rather than assuming the list is complete.
3. Read `src/template/mapping.json` and allocate the next unused decimal codepoint to each new icon. Add each icon as the primary name under its codepoint and keep the codepoints in ascending order.
4. Add an entry to `src/template/metadata.json` for every new icon:

   ```json
   "<icon-name>": {
     "tags": ["<keyword1>", "<keyword2>"],
     "category": "<category>",
     "description": "<Short description of the icon>"
   }
   ```

   - Add four to eight search tags that describe the icon's appearance and likely uses.
   - Use the best-fitting category already present in the file, such as `action`, `navigation`, `debug`, `file`, `user`, `git`, `layout`, `editor`, `symbol`, `status`, `media`, `device`, or `misc`.
   - Write a concise, one-line description.
   - Keep entries sorted alphabetically by icon name.

5. Run `npm run build` from the `vscode-codicons` repository root and wait for it to finish.
6. If the build fails, diagnose and fix the failure before continuing.
7. Verify that every new icon remains a primary name under its assigned codepoint in `src/template/mapping.json`.
8. Run `node scripts/check-metadata.js`.
9. Confirm that the metadata check reports no missing or orphaned entries.
10. Summarize:
    - The new icon names.
    - Their codepoints from `src/template/mapping.json`.
    - Their entries from `src/template/metadata.json`.
