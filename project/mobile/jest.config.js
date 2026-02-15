module.exports = {
  preset: "jest-expo",
  testMatch: ["**/?(*.)+(spec|test).(ts|tsx)"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/screens/**",
    "!src/theme/**",
    "!src/navigation/**",
    "!src/api/**",
    "!src/**/index.ts",
    "!src/**/*.d.ts",
  ],
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "coverage",
};
