import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["allure-report/**", "allure-results/**", "cypress/screenshots/**", "cypress/videos/**"]
  },
  eslint.configs.recommended,
  tseslint.configs.recommended
);
