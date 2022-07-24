module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: 'tsconfig.json',
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint/eslint-plugin',
      'no-null'
    ],
    extends: [
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    root: true,
    env: {
      node: true,
      jest: true,
    },
    rules: {
      "array-callback-return": "error",
      "brace-style": [ "error","1tbs", { "allowSingleLine": false }],
      "camelcase": "off",
      'curly': [ 'error', 'all' ],
      "no-return-await": "off",
      "no-invalid-this": "off",
      'no-empty-pattern': "error",
      "no-magic-numbers": "off",
      "no-unused-vars": "off",
      "no-null/no-null": "error",
      "object-shorthand": ["error", "always"],
      "semi": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "space-before-blocks": "error",
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/explicit-function-return-type': 'error',
      "@typescript-eslint/explicit-member-accessibility": ["error", { accessibility: 'no-public' }],
      '@typescript-eslint/interface-name-prefix': 'off',
      "@typescript-eslint/no-invalid-this": "error",
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/no-for-in-array": "error",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/no-magic-numbers": [
        "error",
        {
          "ignoreEnums": true,
          "ignoreArrayIndexes": true,
          "ignoreNumericLiteralTypes": true,
          "ignoreReadonlyClassProperties": true,
          "ignore": [ 0, 1]
        }
      ],
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^(_|type)" }],
      "@typescript-eslint/return-await": ["error", "always"],
      "@typescript-eslint/semi": ["error", "never"],
    },
    "ignorePatterns": [
      ".eslintrc.js",
      '[0-9]*.ts' // not to lint migrations files, example: 152325322-create-db.ts
    ],
  };
  