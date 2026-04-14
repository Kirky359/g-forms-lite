/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/__tests__/**/*.spec.ts'],
  moduleNameMapper: {
    '^@forms/shared$': '<rootDir>/../shared/src/index.ts',
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
  },
  // Coverage — scoped to service and resolver files; entity/DTO/module decorator
  // files are excluded because they contain no logic to unit-test.
  // Prisma-calling methods are not unit-tested (no DB in CI), which keeps
  // function coverage lower than line coverage — reflect that in the threshold.
  collectCoverageFrom: [
    'src/form/form.service.ts',
    'src/form/form.resolver.ts',
    'src/response/response.service.ts',
    'src/response/response.resolver.ts',
  ],
  coverageThreshold: {
    global: {
      lines: 40,
      functions: 30,
    },
  },
};