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
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "build/",
        ".react-router/",
        "**/*.config.{js,ts}",
        "**/mocks/**",
        "**/*.d.ts",
        "**/types/**",
        "**/routes/**",
        "**/root.tsx",
        "**/translations/*.ts",
      ],
      },
    },
  };
});
