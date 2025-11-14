/// <reference types="vitest/globals" />
import "@testing-library/jest-dom";
import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";

declare module "vitest" {
  export const describe: typeof import("vitest").describe;
  export const it: typeof import("vitest").it;
  export const expect: typeof import("vitest").expect;
  export const vi: typeof import("vitest").vi;
  export const beforeEach: typeof import("vitest").beforeEach;
  export const afterEach: typeof import("vitest").afterEach;
  
  interface Assertion<T = unknown> extends TestingLibraryMatchers<T, void> {
    readonly _jestDomMatchers: true;
  }
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<unknown, void> {
    readonly _jestDomMatchers: true;
  }
}

