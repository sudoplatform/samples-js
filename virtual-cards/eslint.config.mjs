import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['dist/**', '*.js'],
  },
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-unused-expressions': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      // Typescript will do this:
      'react/prop-types': 'off',
      // Allow newspaper code structure:
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],
      // Allow async functions that don't have awaits
      '@typescript-eslint/require-await': 'off',
      // New rules in react-hooks v7 — disable to match previous behavior
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/immutability': 'off',
      'preserve-caught-error': 'off',
      // New rule in typescript-eslint v8 — disable to match previous behavior
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  prettier,
)
