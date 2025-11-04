import {defineConfig, globalIgnores} from 'eslint/config';
import nodePlugin from 'eslint-plugin-n';
import eslintPlugin from 'eslint-plugin-eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unistylesPlugin from './dist/index.js';

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommended,
    nodePlugin.configs['flat/recommended-script'],
    eslintPlugin.configs.recommended,
    eslintPluginPrettierRecommended,
    unistylesPlugin.configs.recommended,
    globalIgnores(['node_modules/', 'dist/']),
    {
        plugins: {},
        rules: {
            'n/exports-style': ['error', 'module.exports'],
            'n/no-missing-import': 'off',
            'n/no-missing-require': 'off',
            'eslint-plugin/require-meta-docs-description': 'error',
            // Prettier
            'prettier/prettier': 'off',
            // START TS RULES
            '@typescript-eslint/consistent-type-imports': ['error', {fixStyle: 'inline-type-imports'}],
            '@typescript-eslint/no-explicit-any': 'off',
            // Must be off to not interfere with the next one
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': ['off', {ignoreRestSiblings: true}],
            'no-extra-boolean-cast': 'off',
            eqeqeq: 'off',
            curly: 'off',
            quotes: 'off',
        },
        ignores: ['dist/', 'node_modules/'],
    },
]);
