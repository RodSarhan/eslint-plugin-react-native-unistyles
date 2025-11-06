import type {ESLint} from 'eslint';
import {rules as _rules} from './rules';

const _plugin: ESLint.Plugin = {
    meta: {name: 'eslint-plugin-react-native-unistyles', version: '3.0.4'},
    rules: _rules as unknown as ESLint.Plugin['rules'],
    // configs: {} as {all: Linter.Config; recommended: Linter.Config; 'flat/recommended': Linter.Config},
    configs: {},
};

const plugin: ESLint.Plugin = {
    ..._plugin,
    configs: {
        // flat config format
        recommended: [
            {
                plugins: {'react-native-unistyles': _plugin},
                rules: {
                    'react-native-unistyles/no-unused-styles': 'error',
                    'react-native-unistyles/sort-styles': 'off',
                },
                languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}},
            },
        ],

        // eslintrc format
        'legacy-recommended': {
            plugins: ['react-native-unistyles'],
            rules: {'react-native-unistyles/no-unused-styles': 'error', 'react-native-unistyles/sort-styles': 'off'},
            parserOptions: {ecmaFeatures: {jsx: true}},
        },

        all: [
            {
                plugins: {'react-native-unistyles': _plugin},
                rules: {
                    'react-native-unistyles/no-unused-styles': 'error',
                    ['react-native-unistyles/sort-styles']: [
                        'error',
                        'asc',
                        {ignoreClassNames: false, ignoreStyleProperties: false},
                    ],
                },
                languageOptions: {parserOptions: {ecmaFeatures: {jsx: true}}},
            },
        ],

        'legacy-all': {
            plugins: ['react-native-unistyles'],
            rules: {
                'react-native-unistyles/no-unused-styles': 'error',
                ['react-native-unistyles/sort-styles']: [
                    'error',
                    'asc',
                    {ignoreClassNames: false, ignoreStyleProperties: false},
                ],
            },
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
    },
};

module.exports = plugin;
