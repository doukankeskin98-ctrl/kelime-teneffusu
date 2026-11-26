import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Every first-party screen shares the game components and their color sources.
const kitRestrictions = [
  { selector: 'JSXOpeningElement[name.name="dialog"]', message: 'Use Window from GameUI.' },
  { selector: 'JSXAttribute[name.name="role"][value.value="switch"]', message: 'Use Toggle from GameUI.' },
  { selector: 'Literal[value=/game-tools-modal/]', message: 'Use Window from GameUI.' },
  { selector: 'Literal[value=/^(#[0-9a-fA-F]{3,8}$|rgba?\\()/]', message: 'Use a theme color from the kit.' },
];
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "dist/**",
    "dist-mobile/**",
    "dist-pilot/**",
    "ios/App/App/public/**",
    "ios/App/DerivedData/**",
    ".sites-runtime/**",
    ".wrangler/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["components/ui/**/*.{ts,tsx}", "hooks/use-mobile.ts"],
    rules: {
      // These files are vendored verbatim from shadcn@4.17.0. Keep the
      // registry source intact while applying the stricter rules to Site code.
      "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["components/**/*.{ts,tsx}", "app/**/*.{ts,tsx}", "mobile/**/*.{ts,tsx}"],
    ignores: ["components/ui/GameUI.tsx", "components/ui/art-palette.ts", "components/ui/theme-colors.ts"],
    rules: {"no-restricted-syntax": ["error", ...kitRestrictions]},
  },
]);

export default eslintConfig;
