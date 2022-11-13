module.exports = {
  root: true,

  settings: {
    react: {
      version: 'detect', // React version. "detect" automatically picks the version you have installed.
    },
  },
  overrides: [
    // Standard typescript rules
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: ['@typescript-eslint', 'react', 'react-hooks'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:react/recommended',
        'prettier',
      ],
      rules: {
        'no-unused-expressions': 'error',
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',
        '@typescript-eslint/no-non-null-assertion': 'error',
        // To allow placeholder vars:
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-empty-interface': [
          'error',
          { allowSingleExtends: true },
        ],
        // Typescript will do this:
        'react/prop-types': 'off',
        // Allow newspaper code structure:
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-misused-promises': [
          'error',
          { checksVoidReturn: false }
        ],
        // Allow async functions that don't have awaits
        '@typescript-eslint/require-await': 'off',
      },
    },
  ],
}
