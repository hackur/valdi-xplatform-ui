module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/modules'],
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  collectCoverageFrom: [
    'modules/**/src/**/*.{ts,tsx}',
    '!modules/**/src/**/*.d.ts',
    '!modules/**/src/**/__tests__/**',
    '!modules/**/src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  moduleNameMapper: {
    '^@common$': '<rootDir>/modules/common/src/index.ts',
    '^@common/(.*)$': '<rootDir>/modules/common/src/$1',
    '^@chat_core$': '<rootDir>/modules/chat_core/src/index.ts',
    '^@chat_core/(.*)$': '<rootDir>/modules/chat_core/src/$1',
    '^@chat_ui$': '<rootDir>/modules/chat_ui/src/index.ts',
    '^@chat_ui/(.*)$': '<rootDir>/modules/chat_ui/src/$1',
    '^@main_app/(.*)$': '<rootDir>/modules/main_app/src/$1',
    '^@settings/(.*)$': '<rootDir>/modules/settings/src/$1',
    '^@tools_demo/(.*)$': '<rootDir>/modules/tools_demo/src/$1',
    '^@workflow_demo/(.*)$': '<rootDir>/modules/workflow_demo/src/$1',
    '^@agent_manager/(.*)$': '<rootDir>/modules/agent_manager/src/$1',
    '^@conversation_manager/(.*)$': '<rootDir>/modules/conversation_manager/src/$1',
    '^@model_config/(.*)$': '<rootDir>/modules/model_config/src/$1',
    '^valdi_core/(.*)$': '<rootDir>/__mocks__/valdi_core/$1',
    '^valdi_tsx/(.*)$': '<rootDir>/__mocks__/valdi_tsx/$1',
    '^valdi_http/(.*)$': '<rootDir>/__mocks__/valdi_http/$1',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/bazel-',
    '<rootDir>/node_modules',
    '<rootDir>/dist',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
  testTimeout: 10000,
};
