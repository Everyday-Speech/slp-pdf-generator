/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
    transform: {
        '^.+\\.ts?$': 'esbuild-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['**/tests/unit/**/*.test.ts'],
    collectCoverageFrom: ['**/*.ts', '!**/*.d.ts', '!**/index.ts'],
    coveragePathIgnorePatterns: ['node_modules', 'mock-data', 'interfaces', 'config'],
    moduleDirectories: ['node_modules', './'],
};
