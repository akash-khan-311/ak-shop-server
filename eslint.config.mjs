import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        process: 'readonly'
      }
    },
    rules: {
      // JS rules
      'no-unused-vars': 'off', // TS handle করবে
      'no-unused-expressions': 'error',
      'no-console': 'warn',
      'no-undef': 'off',
      'prefer-const': 'error',
      // 🔥 Prettier OFF
      'prettier/prettier': 'off',

      // TS rules
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off'
    }
  },

  {
    ignores: ['node_modules', 'dist']
  },

  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended
]
