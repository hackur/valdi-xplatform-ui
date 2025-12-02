/**
 * ESLint Configuration - 2025 Best Practices
 *
 * References:
 * - TypeScript ESLint: https://typescript-eslint.io/
 * - ESLint TypeScript Config: https://www.xjavascript.com/blog/best-eslint-config-for-typescript/
 */

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
  ],
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // TypeScript - Strict Type Checking (2025 Recommendations)
    '@typescript-eslint/explicit-function-return-type': ['warn', {
      allowExpressions: true,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
    }],
    '@typescript-eslint/explicit-module-boundary-types': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-unnecessary-condition': 'warn',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/strict-boolean-expressions': 'off', // Can be too strict for some codebases
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/restrict-template-expressions': ['warn', {
      allowNumber: true,
      allowBoolean: true,
      allowNullish: true,
    }],

    // TypeScript - Code Quality
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/prefer-readonly-parameter-types': 'off', // Too strict for most codebases
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-confusing-void-expression': 'warn',
    '@typescript-eslint/no-redundant-type-constituents': 'warn',
    '@typescript-eslint/no-useless-empty-export': 'warn',
    '@typescript-eslint/prefer-reduce-type-parameter': 'warn',
    '@typescript-eslint/prefer-return-this-type': 'warn',
    '@typescript-eslint/prefer-string-starts-ends-with': 'warn',
    '@typescript-eslint/promise-function-async': 'warn',
    '@typescript-eslint/require-array-sort-compare': 'warn',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',

    // TypeScript - Best Practices
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': ['error', {
      prefer: 'type-imports',
      disallowTypeAnnotations: false,
    }],
    '@typescript-eslint/consistent-type-exports': 'error',
    '@typescript-eslint/method-signature-style': ['error', 'property'],
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

    // General ES6+ Best Practices
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
    'prefer-arrow-callback': 'warn',
    'prefer-destructuring': ['warn', {
      array: true,
      object: true,
    }],
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'no-useless-concat': 'error',
    'no-useless-constructor': 'off', // Disabled in favor of TypeScript rule
    '@typescript-eslint/no-useless-constructor': 'error',

    // Code Quality
    'no-return-await': 'off', // Disabled in favor of TypeScript rule
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],
    'require-await': 'off', // Disabled in favor of TypeScript rule
    '@typescript-eslint/require-await': 'error',
    'no-throw-literal': 'off', // Disabled in favor of TypeScript rule
    '@typescript-eslint/only-throw-error': 'error',
    'dot-notation': 'off', // Disabled in favor of TypeScript rule
    '@typescript-eslint/dot-notation': 'error',
    'no-duplicate-imports': 'error', // Re-enabled since TypeScript version has issues

    // Naming Conventions (2025 Best Practices)
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'interface',
        format: ['PascalCase'],
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'class',
        format: ['PascalCase'],
      },
      {
        selector: 'enum',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'method',
        format: ['camelCase'],
      },
      {
        selector: 'property',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },
    ],

    // Valdi Framework Specific Rules
    // Enforce 'override' keyword for lifecycle methods
    '@typescript-eslint/no-invalid-this': 'off', // Allow 'this' in arrow functions for Valdi event handlers

    // Prevent common Valdi mistakes
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@common', '@common/*', '@chat_core', '@chat_ui', '@agent_manager', '@conversation_manager', '@model_config', '@tools_demo', '@workflow_demo', '@settings'],
        message: 'Path aliases (@common, etc.) are not supported in Valdi builds. Use full module paths like "common/src/types" instead.',
      }, {
        group: ['ai', '@ai-sdk/*', 'zod'],
        message: 'AI SDK and runtime validation libraries cannot be used in Valdi (no JavaScript runtime). Use valdi_http for API calls.',
      }],
    }],

    // Performance & Correctness
    'no-await-in-loop': 'warn',
    'no-constant-binary-expression': 'error',
    'no-promise-executor-return': 'error',
    'no-self-compare': 'error',
    'no-template-curly-in-string': 'warn',
    'no-unmodified-loop-condition': 'error',
    'no-unreachable-loop': 'error',
    'require-atomic-updates': 'error',
  },
  overrides: [
    {
      // Relax rules for test files
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*'],
      parserOptions: {
        // Don't require project configuration for test files
        project: null,
      },
      rules: {
        // Disable all type-checking rules that require parserOptions.project
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/prefer-nullish-coalescing': 'off',
        '@typescript-eslint/strict-boolean-expressions': 'off',
        '@typescript-eslint/await-thenable': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/return-await': 'off',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/prefer-readonly': 'off',
        '@typescript-eslint/prefer-readonly-parameter-types': 'off',
        '@typescript-eslint/no-confusing-void-expression': 'off',
        '@typescript-eslint/no-redundant-type-constituents': 'off',
        '@typescript-eslint/prefer-reduce-type-parameter': 'off',
        '@typescript-eslint/prefer-return-this-type': 'off',
        '@typescript-eslint/prefer-string-starts-ends-with': 'off',
        '@typescript-eslint/promise-function-async': 'off',
        '@typescript-eslint/require-array-sort-compare': 'off',
        '@typescript-eslint/switch-exhaustiveness-check': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/prefer-optional-chain': 'off',
        '@typescript-eslint/only-throw-error': 'off',
      },
    },
    {
      // JavaScript files (config files, etc.)
      files: ['*.js', '*.mjs', '*.cjs'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'bazel-*/',
    'dist/',
    'build/',
    'coverage/',
    'vendor/',
    '*.config.js',
    '*.config.mjs',
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/__tests__/**',
  ],
};
