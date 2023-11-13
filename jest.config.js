module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  testRegex: 'test.ts',
  moduleFileExtensions: ['ts', 'js'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 40,
      lines: 50,
      statements: 50
    }
  },
}
