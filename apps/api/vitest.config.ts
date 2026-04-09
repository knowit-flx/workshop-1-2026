import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "json-summary", "html"],
      include: ["src/app.ts", "src/chat-request.ts"],
      exclude: ["src/**/*.test.ts"]
    }
  }
});
