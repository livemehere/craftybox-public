// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import typescriptParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  ...tseslint.configs.recommended,
  {
    ignores: ['electron-builder.ts', 'dist/**/*', 'release/**/*'],
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json'
      },
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin
    },
    rules: {
      'import/order': [
        'error',
        {
          'newlines-between': 'always'
        }
      ],
      'react/no-unknown-property': ['error', { ignore: ['css'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/ban-ts-comment': 'off'
    }
  }
];
