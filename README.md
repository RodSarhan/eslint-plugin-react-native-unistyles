# ESLint Plugin for React Native Unistyles

![react-native-unistyles](assets/banner.png)

![NPM Downloads](https://img.shields.io/npm/d18m/eslint-plugin-react-native-unistyles) [![GitHub Repo stars](https://img.shields.io/github/stars/RodSarhan/eslint-plugin-react-native-unistyles?style=social)](https://github.com/RodSarhan/eslint-plugin-react-native-unistyles) ![NPM Version](https://img.shields.io/npm/v/eslint-plugin-react-native-unistyles) [![License](https://img.shields.io/github/license/RodSarhan/eslint-plugin-react-native-unistyles)](https://github.com/RodSarhan/eslint-plugin-react-native-unistyles/blob/main/LICENSE)

> ESLint rules for [React Native Unistyles](https://github.com/jpudysz/react-native-unistyles) to help you write cleaner, more maintainable stylesheets.

## 📋 Requirements

- ESLint
- React Native Unistyles `^3.0.0`

## 📦 Installation

Install the plugin as a dev dependency:

```bash
yarn add eslint-plugin-react-native-unistyles -D
```

## ⚙️ Configuration

### ESLint Flat Config (Recommended)

For ESLint 9+ with flat config:

```js
import { defineConfig } from 'eslint/config';
import unistyles from 'eslint-plugin-react-native-unistyles';

export default defineConfig([
  // Your other configs...
  unistyles.configs.recommended,
]);
```

#### Custom Configuration

```js
import unistyles from 'eslint-plugin-react-native-unistyles';

export default defineConfig([
  {
    plugins: {
      'react-native-unistyles': unistyles,
    },
    rules: {
      'react-native-unistyles/no-unused-styles': 'error',
      'react-native-unistyles/sort-styles': [
        'warn',
        'asc',
        {
          ignoreClassNames: false,
          ignoreStyleProperties: false
        }
      ],
    },
  },
]);
```

### Legacy Configuration (.eslintrc)

For older ESLint versions:

```json
{
  "extends": ["plugin:react-native-unistyles/legacy-recommended"]****
}
```

#### Manual Rule Configuration

```json
{
  "plugins": ["react-native-unistyles"],
  "rules": {
    "react-native-unistyles/no-unused-styles": "warn",
    "react-native-unistyles/sort-styles": [
      "warn",
      "asc",
      {
        "ignoreClassNames": false,
        "ignoreStyleProperties": false
      }
    ]
  }
}
```

### Note

If it is not already the case you must also configure `ESLint` to support JSX.

```json
{
    "languageOptions": {
        "parserOptions": {
            "ecmaFeatures": {"jsx": true}
            }
        }
}
```

## 📖 Rules

| Rule | Description |
|------|-------------|
| [`no-unused-styles`](docs/rules/no-unused-styles.md) | Detect unused stylesheet definitions |
| [`sort-styles`](docs/rules/sort-styles.md) | Enforce sorted style properties |

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [eslint-plugin-react-native](https://github.com/Intellicode/eslint-plugin-react-native)
- Built for [React Native Unistyles](https://github.com/jpudysz/react-native-unistyles) by [@jpudysz](https://github.com/jpudysz)

## 📚 Related Projects

- [React Native Unistyles](https://github.com/jpudysz/react-native-unistyles) - The styling library this plugin supports
- [ESLint](https://eslint.org/) - The pluggable linting utility for JavaScript
