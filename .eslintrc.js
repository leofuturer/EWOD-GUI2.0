module.exports = {
  env: {
    browser: true,
    es2021: true,
    'jest': true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'airbnb',
    'react-app/jest',
    'react-app',
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
    'react/jsx-no-bind': ['off'],
    'linebreak-style': 'off',
  },
};
