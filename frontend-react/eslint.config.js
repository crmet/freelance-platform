import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist', 'node_modules']),

  {
    files: ['**/*.{js,jsx}'],

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      // не ломаем разработку
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],

      // пустые блоки — предупреждение
      'no-empty': 'warn',

      // react hooks — только предупреждения
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/immutability': 'off',

      // refresh оставляем
      'react-refresh/only-export-components': 'warn',

      // Date.now в рендере — предупреждение
      'react-hooks/purity': 'off',

      // мягче режим
      'no-console': 'off',
    },
  },
]);