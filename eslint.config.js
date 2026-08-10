import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  // general ignores
  { ignores: ['dist', '*.config.js', '*.config.cjs', 'supabase/**'] },

  // JS/JSX files (no TS project)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tsParser, // parser can parse JS; don't set project here
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // no `project` here
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // TypeScript files (only these use parserOptions.project)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: globals.browser,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        // point to the TS config that covers your app sources
        // adjust path if your repo uses a different file (eg. './tsconfig.json')
        project: './tsconfig.app.json',
        // ensure the resolver uses this config's directory
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // Jest test files: enable jest globals so 'jest/describe/it/expect' are defined
  {
    files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest },
      // alternatively set env: { jest: true } if preferred
    },
    plugins: {
      // optionally add 'jest' plugin if you want jest-specific rules
      // 'jest': require('eslint-plugin-jest'),
    },
  },
];
