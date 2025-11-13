import js from "@eslint/js";
import nextPlugin from "eslint-config-next";
import prettierRecommended from "eslint-config-prettier";
import tailwind from "eslint-plugin-tailwindcss";

export default [
  js.configs.recommended,
  ...nextPlugin(),
  prettierRecommended,
  {
    plugins: {
      tailwindcss: tailwind
    },
    rules: {
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off"
    }
  }
];