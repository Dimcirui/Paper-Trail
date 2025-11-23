/** @type {import('@stryker-mutator/api/core').StrykerOptions} */
module.exports = {
  mutate: [
    "src/app/api/**/*.ts",
    "!src/app/api/**/__tests__/**/*.ts",
    "!src/app/api/**/*.d.ts",
  ],
  testRunner: "jest",
  jest: {
    projectType: "custom",
    configFile: "jest.config.ts",
    enableFindRelatedTests: true,
  },
  reporters: ["progress", "clear-text", "html"],
  coverageAnalysis: "perTest",
  thresholds: {
    high: 80,
    low: 70,
    break: 65,
  },
};
