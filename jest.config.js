module.exports = {
  verbose: true,
  transform: {
    "^.+\\.ts$": "ts-jest"
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$",
  moduleDirectories: ["node_modules", "app"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "\\.(css|eot|woff|woff2)$": "<rootDir>/app/spec/__mocks__/styleMock.js",
    "util/jss": "<rootDir>/app/spec/__mocks__/jssMock.js"
  },
  globals: {
    "ts-jest": {
      tsConfigFile: "tsconfig.json"
    }
  },
  roots: ["<rootDir>/app"],
  collectCoverage: true,
  coveragePathIgnorePatterns: ["/node_modules"]
}
