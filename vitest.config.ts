import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // QA-UNIT-01/02: keep executable tests separate from website source.
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // The current 80% floor applies ONLY to covered library modules.
      include: ["src/lib/**/*.ts"],
      exclude: ["**/*.test.ts", "tests/**"],
      reporter: ["text", "json-summary"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
