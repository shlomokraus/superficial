module.exports = {
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  globals: {
    "ts-jest":{
      diagnostics: false
    }
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.[tj]sx?$',
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules/", "/test/", "/dist/"],
  testEnvironment: "node",
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}