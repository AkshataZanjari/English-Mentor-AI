import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextConfig,
  {
    ignores: [".next/", "node_modules/", "public/"]
  },
  {
    rules: {
      "no-undef": "off",
      "no-empty": "off"
    }
  }
);
