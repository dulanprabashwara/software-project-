// tests/jest.config.js
// ─────────────────────────────────────────────────────────────────────────────
// Jest configuration for frontend unit tests.
// rootDir = tests/ folder (where this config lives).
// Tests only cover pure JS logic (lib/api.js etc.) — no React rendering.
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Use Node environment — lib/api.js is pure JS, no DOM needed
  testEnvironment: "node",

  // rootDir is the tests/ folder itself
  roots: ["<rootDir>"],

  // Find all .test.js files inside tests/
  testMatch: ["**/*.test.js"],

  testPathIgnorePatterns: ["/node_modules/"],

  verbose: true,
  testTimeout: 10000,

  // Transform ES module imports (Next.js uses ESM export syntax)
  // We tell Jest to treat .js files as CommonJS via transform
  transform: {},

  // Map the ES module "lib/api.js" as if it were a CommonJS module
  // so our test can require() it
  extensionsToTreatAsEsm: [],

  // Allow importing from outside the tests folder
  moduleDirectories: ["node_modules", "<rootDir>/.."],
};
