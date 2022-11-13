// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config()

module.exports = {
  preset: 'ts-jest',
  verbose: true,
  roots: ['./src', './e2e'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  collectCoverage: false,
  collectCoverageFrom: ['src/**/*.ts'],
  coveragePathIgnorePatterns: [
    'config/*',
  ],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node', 'd.ts'],
  // to work around https://github.com/facebook/jest/issues/11698
  testRunner: 'jest-jasmine2',
}
