# Project guide

This is a single-screen Expo SDK 58 JavaScript application. Keep the essential screen, calculations and styles in App.js so the report can include the complete main page code.

- Preserve assignment pricing and service rules; calculate money in integer sen.
- Show delivery selection only when planting is declined; clear the invoice on every edit.
- Use Expo-compatible dependencies (`npx expo install`). Check matching versioned documentation before changing platform APIs.
- Keep `/blue-tree-mango` aligned across Expo config, preview server and tests.
- Run `npm run lint`, `npm run typecheck`, `npm run build:web` and `npm test` after application changes.
- Maintain stacking below 800px, columns above it and keyboard-operable controls.
- If App.js changes, update Section B of the Word report verbatim. Update screenshots when visible behaviour changes.
