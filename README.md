<img alt="react-native-unistyles" src="assets/banner.png">

# ESLint plugin for React Native Unistyles

![NPM Downloads](https://img.shields.io/npm/d18m/eslint-plugin-react-native-unistyles) [![GitHub Repo stars](https://img.shields.io/github/stars/RodSarhan/eslint-plugin-react-native-unistyles?style=social)](https://github.com/RodSarhan/eslint-plugin-react-native-unistyles) ![NPM Version](https://img.shields.io/npm/v/eslint-plugin-react-native-unistyles) [![License](https://img.shields.io/github/license/RodSarhan/eslint-plugin-react-native-unistyles)](https://github.com/RodSarhan/eslint-plugin-react-native-unistyles/blob/main/LICENSE)

[React Native Unistyles](https://github.com/jpudysz/react-native-unistyles) linting rules for ESLint. This repository is structured like (and contains code from) [eslint-plugin-react-native](https://github.com/Intellicode/eslint-plugin-react-native).

## Supported Versions

This plugin supports Unistyles v3 starting from v3.0.1.
For v2 support you can install v0.2.9

## Installation

Install eslint-plugin-react-native-unistyles

```sh
yarn add eslint-plugin-react-native-unistyles -D
```

## Flat Configs

The plugin supports flat configs
Example:

```js
const {defineConfig} = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const reactCompiler = require('eslint-plugin-react-compiler');
const unistyles = require('eslint-plugin-react-native-unistyles');

module.exports = defineConfig([
    expoConfig,
    reactCompiler.configs.recommended,
    unistyles.configs.recommended,
])
```

For older eslint versions you can use the 'recommended-legacy' or 'recommended-all' configs

If it is not already the case you must also configure `ESLint` to support JSX.

```json
{"parserOptions": {"ecmaFeatures": {"jsx": true}}}
```

Then, enable all of the rules that you would like to use.

```json
{
    "rules": {
        "react-native-unistyles/no-unused-styles": "warn",
        "react-native-unistyles/sort-styles": [
            "warn",
            "asc",
            {"ignoreClassNames": false, "ignoreStyleProperties": false}
        ]
    }
}
```

## List of supported rules

- [no-unused-styles](docs/rules/no-unused-styles.md): Detect `createStyleSheet` styles which are not used in your React components
- [sort-styles](docs/rules/sort-styles.md): Detect `createStyleSheet` styles which are not in correct sort order
