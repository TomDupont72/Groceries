module.exports = {
  preset: "jest-expo",
  testMatch: ["**/?(*.)+(spec|test).(ts|tsx)"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/**/__tests__/**"],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "coverage",
};
