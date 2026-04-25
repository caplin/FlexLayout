import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
// 1. Import the hooks plugin
import pluginReactHooks from "eslint-plugin-react-hooks";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  
  // 2. Add the Hooks configuration
  {
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "react/react-in-jsx-scope": "off",
      // You can also manually adjust hook rules here if needed:
      // "react-hooks/exhaustive-deps": "warn" 
    },
  },
  {
    settings: {
      react: {
        version: '19.2.5',
      },
    },
  },
]);