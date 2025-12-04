import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const isTest = mode === "test";
  
  return {
    plugins: isTest 
      ? [tailwindcss(), tsconfigPaths()]
      : [tailwindcss(), reactRouter(), tsconfigPaths()],
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./vitest.setup.ts"],
      onConsoleLog(log: string, type: "stdout" | "stderr") {
        
        if (
          type === "stderr" &&
          (log.includes("No `HydrateFallback` element provided") ||
            log.includes("Not implemented: HTMLFormElement's requestSubmit() method"))
        ) {
          return false; 
        }
        return true; 
      },
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html", "lcov"],
        exclude: [
          "node_modules/",
          "build/",
          ".react-router/",
          "**/*.config.{js,ts}",
          "**/*.d.ts",
          "**/types/**",
          "**/root.tsx",
          "**/translations/*.ts",
          "**/test-utils.ts",
          "**/i18n/index.ts",
          "**/index.ts",
          "**/index.tsx",
        ],
      },
    },
  };
});
