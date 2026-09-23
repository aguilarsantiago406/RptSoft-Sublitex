module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', {}],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@nestjs/mapped-types|@nestjs/swagger|@nestjs/common|@nestjs/core)/)',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/../node_modules'],
  verbose: true,
};