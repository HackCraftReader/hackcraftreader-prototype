module.exports = {
  "extends": ["semistandard", "standard-jsx"],
  "parserOptions": {
    "ecmaVersion": 8 // or 2017
  },
  "parser": "babel-eslint",  
  "rules": {
    "comma-dangle": ["error", "only-multiline"],
    "space-before-function-paren": [
      "error", 
      {"anonymous": "always", "named": "never", "asyncArrow": "always"}
    ]
  }
};
