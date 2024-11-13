module.exports = {
  env: {
    browser: true,
    es2021: true,
    // 'jest/globals': true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:cypress/recommended',
    'airbnb',
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
    // 'jest',
  ],
  rules: {
    'react/prop-types': 'off',
    'linebreak-style': 'off',

    
    'quotes': ['off', 'single'],                    
    'object-curly-newline': 'off',       
    'comma-dangle': 'off',                    
    'operator-linebreak': 'off',       
    'nonblock-statement-body-position': 'off',
    'curly': 'off',
    'react/jsx-no-bind': 'off',
    'react/jsx-curly-newline': 'off',
    'implicit-arrow-linebreak': 'off',
    'indent': 'off',                  
    'function-paren-newline': 'off',               
  },
};
