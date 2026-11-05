const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expoConfig,
  { files: ['scripts/*.cjs'],
    languageOptions: { globals: { __dirname: 'readonly' } } },
  { ignores: ['dist/**', 'playwright-report/**', 'test-results/**'] },
]);
