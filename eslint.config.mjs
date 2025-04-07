import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended, // This applies the recommended TypeScript rules
  {
    files: ["**/*.{ts,tsx}"], // Apply only to TypeScript and TSX files
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  pluginReact.configs.flat.recommended,
]);