require('dotenv').config()

module.exports = {
  preset: 'ts-jest',
  verbose: true,
  roots: ['./src', './test'],
  testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/src/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
    '!**/*.d.ts',
    '!node_modules/**',
  ],
  coveragePathIgnorePatterns: ['config/*'],
  testPathIgnorePatterns: ['/node_modules/', '/lib/', '/cjs/', '/types/'],
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  // to work around https://github.com/facebook/jest/issues/11698
  testRunner: 'jest-jasmine2',
}
