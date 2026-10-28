import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());

// Node 22+ ships its own global localStorage that shadows jsdom's and has no methods
// unless started with --localstorage-file. Give tests a working in-memory Storage.
function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (k) => data.get(k) ?? null,
    key: (i) => [...data.keys()][i] ?? null,
    removeItem: (k) => void data.delete(k),
    setItem: (k, v) => void data.set(k, String(v)),
  };
}
for (const name of ["localStorage", "sessionStorage"] as const) {
  if (typeof globalThis[name]?.clear !== "function") {
    Object.defineProperty(globalThis, name, { value: memoryStorage(), configurable: true });
  }
}
