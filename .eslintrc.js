module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'jest',
  ],
  rules: {
    'react/prop-types': ['off'],
    'quotes': 'off',
    'arrow-parens': 'off',
    'react/jsx-boolean-value': 'off',
    'no-unused-vars': 'off',
    'max-len': 'off',
    'object-curly-newline': 'off',
    'no-trailing-spaces': 'off'
    'react/jsx-no-bind': 'off'
  },
};
