import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import pluginSecurity from 'eslint-plugin-security';

export default defineConfig([
  {
    ignores: ['node_modules', 'dist', 'vitest.config.ts'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  pluginSecurity.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        ...globals.node,
        fetch: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'no-console': 'off',
    },
  },
]);
