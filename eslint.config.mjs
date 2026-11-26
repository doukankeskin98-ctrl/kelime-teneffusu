import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// 0.58.3 covers the shared settings lists and the Arena entry surface.
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
    files: [
      "components/game/SettingsHome.tsx", "components/game/GameSettings.tsx",
      "components/game/SoundSettings.tsx", "components/game/DailyReminder.tsx",
      "components/game/PrivacyInfo.tsx", "components/game/PlayPreferences.tsx",
    ],
    rules: { "no-restricted-syntax": ["error", ...kitRestrictions] },
  },
  {
    files: ["components/game/Arena.tsx", "components/game/common.tsx"],
    rules: {
      "no-restricted-syntax": ["error", ...kitRestrictions.flatMap(rule =>
        ['FunctionDeclaration[id.name="GameToolsSheet"]',
         'VariableDeclarator[id.name="roundPreference"]',
         'JSXElement:has(> JSXOpeningElement > JSXAttribute[name.name="surface"][value.value="arena"])'].map(parent => ({
          ...rule, selector: parent + " " + rule.selector + ':not(JSXElement:has(> JSXOpeningElement[name.name="Modal"]) *)',
        })))],
    },
  },
]);

export default eslintConfig;
