import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true, checkJS: false },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // Fix the problematic no-unused-expressions rule
      "@typescript-eslint/no-unused-expressions": "off",
      // Allow console.log in development
      "no-console": "off",
    },
  },
  // Server-specific configuration
  {
    files: ["server/**/*.{ts,js}"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      // Server files can use console.log and require statements
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  // UI components (shadcn/ui) configuration
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      // Relax rules for UI library components
      "react-refresh/only-export-components": "off",
    },
  },
  // Application Flow and database code configuration
  {
    files: [
      "server/routes/applicationFlow.ts", 
      "src/services/applicationFlowService.ts",
      "server/routes/llmIntegration.ts",
      "src/services/llmIntegrationService.ts",
      "src/components/LLMConfigurationSection.tsx"
    ],
    rules: {
      // Allow any types for database interaction and LLM integration code
      "@typescript-eslint/no-explicit-any": "off",
      "no-case-declarations": "off",
      "no-useless-escape": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  }
);
