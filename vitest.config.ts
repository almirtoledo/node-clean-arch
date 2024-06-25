import "dotenv/config";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { defaultExclude, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "coverage/",
        "mariadb/",
        "mongodb/",
      ],
      all: true,
    },
    exclude: [...defaultExclude],
    include: ["./tests/**"],
  },
  plugins: [viteTsConfigPaths()],
});
