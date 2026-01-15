// @ts-check
import eslint from '@eslint/js'
import eslintPluginAstro from 'eslint-plugin-astro'
import sonarjs from 'eslint-plugin-sonarjs'
import eslintSveltePlugin from 'eslint-plugin-svelte'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'
import svelteParser from 'svelte-eslint-parser'
import tseslint from 'typescript-eslint'


export default defineConfig(
  globalIgnores(['.astro/*', 'dist/*', '.vercel/*']),
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  sonarjs.configs.recommended,
  {
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        alert: 'readonly',
        console: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        Headers: 'readonly',
      },
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      'sonarjs/todo-tag': 'off',
      'sonarjs/prefer-read-only-props': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/pseudo-random': 'off',
    },
  },
  eslintPluginAstro.configs.recommended,
  eslintPluginAstro.configs['jsx-a11y-strict'],
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  ...eslintSveltePlugin.configs.recommended,
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parser: svelteParser,
      parserOptions: {
        parser: tseslint.parser,
        project: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.svelte'],
      },
    },
    rules: {
      'sonarjs/no-empty-collection': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-identical-functions': 'off',
    },
  },
)
