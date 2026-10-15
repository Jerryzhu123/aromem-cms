import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // `public/` holds the source site's own assets, served verbatim so the
    // clone stays 1:1 — jQuery, Bootstrap, slick, filterizr, magnific-popup,
    // the template's CSS and every image. They are not our code to lint.
    "public/**",
  ]),
]);

export default eslintConfig;
