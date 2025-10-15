export default {
  testEnvironment: 'node',
  transform: {},
  collectCoverageFrom: ['src/**/*.js'],
  moduleNameMapper: {
    '^@soulstone/config$': '<rootDir>/../../packages/config/src/index.js',
    '^@soulstone/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@soulstone/types/(.*)$': '<rootDir>/../../shared/types/$1',
  },
};
