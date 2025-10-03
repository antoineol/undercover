import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import gitignore from 'eslint-config-flat-gitignore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Apply gitignore patterns
  gitignore(),
  // Global ignores for all configurations
  {
    ignores: [
      // Additional patterns not covered by .gitignore
      '*.config.js',
      '*.config.mjs',
      'next-env.d.ts',
      '**/*.generated.*',
      '**/turbopack-*.js',
      '**/_buildManifest.js',
      '**/_ssgManifest.js',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  ...compat.extends('prettier'),
  {
    plugins: {
      prettier: (await import('eslint-plugin-prettier')).default,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'prettier/prettier': 'error',
      // Disable ESLint rules that conflict with Prettier
      indent: 'off',
      '@typescript-eslint/indent': 'off',
      quotes: 'off',
      '@typescript-eslint/quotes': 'off',
      semi: 'off',
      '@typescript-eslint/semi': 'off',
      'comma-dangle': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      'object-curly-spacing': 'off',
      '@typescript-eslint/object-curly-spacing': 'off',
      'array-bracket-spacing': 'off',
      'computed-property-spacing': 'off',
      'space-before-blocks': 'off',
      'keyword-spacing': 'off',
      'space-infix-ops': 'off',
      'space-before-function-paren': 'off',
      'brace-style': 'off',
      '@typescript-eslint/brace-style': 'off',
      'no-multiple-empty-lines': 'off',
      'no-trailing-spaces': 'off',
      'eol-last': 'off',
      'max-len': 'off',
    },
  },
];

export default eslintConfig;
