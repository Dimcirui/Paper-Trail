import type { Config } from "jest";
import { transform } from "zod";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/app/api/**/*.ts",
    "!src/app/api/**/*.d.ts",
    "!src/app/api/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85,
    },
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.json' 
      }
    ]
  },
  transformIgnorePatterns: [
    'node_modules/(?!(jose)/)' 
  ],
};

export default config;
