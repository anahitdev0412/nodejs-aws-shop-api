module.exports = {
  testEnvironment: "node",
  roots: [
    "<rootDir>/test",
  ],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleNameMapper: {
    "^@products-api/shared$": "<rootDir>/shared/index.ts",
  },
};