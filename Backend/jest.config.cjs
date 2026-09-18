module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', {}],
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/../node_modules'],
  verbose: true,
};