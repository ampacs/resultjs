import eslintjs from "@eslint/js";
import stylisticeslintjs from "@stylistic/eslint-plugin-js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		files: [ "**/*.{js,mjs,cjs,ts,mts}" ],
		ignores: ["dist/**/*", "coverage/**/*"],
		languageOptions: {
			globals: globals.browser,
			parserOptions: {
				project: ["./tsconfig.json", "./tsconfig.development.json"],
				tsconfigRootDir: import.meta.dirname
			}
		},
		plugins: { eslintjs },
		extends: [ eslintjs.configs.recommended ]
	},
	stylisticeslintjs.configs.all,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		rules: {
			"@stylistic/js/array-bracket-spacing": [
				"error",
				"never",
				{ singleValue: true }
			],
			"@stylistic/js/array-element-newline": ["error", "consistent"],
			"@stylistic/js/arrow-parens": ["error", "as-needed"],
			"@stylistic/js/brace-style": [
				"error",
				"1tbs",
				{ allowSingleLine: true }
			],
			"@stylistic/js/function-call-argument-newline": ["error", "consistent"],
			"@stylistic/js/function-paren-newline": ["error", "multiline-arguments"],
			"@typescript-eslint/unified-signatures": [
				"error",
				{
					ignoreDifferentlyNamedParameters: true,
					ignoreOverloadsWithDifferentJSDoc: true
				}
			],
			"@stylistic/js/implicit-arrow-linebreak": "off",
			"@stylistic/js/indent": ["error", "tab"],
			"@stylistic/js/lines-around-comment": [
				"error",
				{ beforeBlockComment: false }
			],
			"@stylistic/js/lines-between-class-members": [
				"error",
				"always",
				{ exceptAfterSingleLine: true }
			],
			"@stylistic/js/multiline-comment-style": "off",
			"@stylistic/js/multiline-ternary": ["error", "always-multiline"],
			"@stylistic/js/no-confusing-arrow": "off",
			"@stylistic/js/no-multiple-empty-lines": [
				"error",
				{ max: 1, maxEOF: 0 }
			],
			"@stylistic/js/object-curly-spacing": ["error", "always"],
			"@stylistic/js/object-property-newline": [
				"error",
				{ allowAllPropertiesOnSameLine: true }
			],
			"@stylistic/js/padded-blocks": ["error", "never"],
			"@stylistic/js/quote-props": ["error", "as-needed"],
			"@stylistic/js/space-before-function-paren": ["error", "never"],
			"@typescript-eslint/consistent-type-definitions": "off",
			"@typescript-eslint/no-confusing-void-expression": "off",
			"@typescript-eslint/no-namespace": "off",
			"@typescript-eslint/no-unnecessary-type-arguments": "warn",
			"@typescript-eslint/only-throw-error": "off",
			"@typescript-eslint/prefer-as-const": "off",
			"@typescript-eslint/use-unknown-in-catch-callback-variable": "off"
		}
	}
);
