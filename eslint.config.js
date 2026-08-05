import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

/* ════════════════════════════════════════════════════════════════════
   YourMark CMS — ESLint (flat config)
   Correctness rules ON · purely stylistic noise OFF.
   Run:  npx eslint .            (or add to CI)
   ════════════════════════════════════════════════════════════════════ */
export default tseslint.config(
  { ignores: ["dist", "node_modules", "supabase", "*.config.js", "*.config.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    languageOptions: { ecmaVersion: 2022, sourceType: "module" },
    rules: {
      /* correctness */
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      /* HMR convenience — not applicable to our multi-export UI kit */
      "react-refresh/only-export-components": "off",
    },
  },
);
