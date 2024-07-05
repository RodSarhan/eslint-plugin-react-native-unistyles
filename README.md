# ESLint plugin for React Native Unistyles

React Native Unistyles linting rules for ESLint. This repository is structured like (and contains code from) the excellent [eslint-plugin-react-native](https://github.com/Intellicode/eslint-plugin-react-native).

## Installation

Install eslint-plugin-react-native-unistyles

```sh
yarn add eslint-plugin-react-native-unistyles -D
```

## Configuration

Add `plugins` section and specify react-native-unistyles as a plugin.

```json
{
  "plugins": ["react-native-unistyles"]
}
```

If it is not already the case you must also configure `ESLint` to support JSX.

```json
{
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    }
  }
}
```

Then, enable all of the rules that you would like to use.

```json
{
  "rules": {
    "react-native-unistyles/no-unused-styles": "warn",
  }
}
```

## List of supported rules

- [no-unused-styles](docs/rules/no-unused-styles.md): Detect `createStyleSheet` styles which are not used in your React components

## Shareable configurations

### All

This plugin also exports an `all` configuration that includes every available rule.

```js
{
  "plugins": [
    /* ... */
    "react-native-unistyles"
  ],
  "extends": [/* ... */, "plugin:react-native-unistyles/all"]
}
```

**Note**: These configurations will import `eslint-plugin-react-native-unistyles` and enable JSX in [parser options](http://eslint.org/docs/user-guide/configuring#specifying-parser-options).
