import type {RuleModule} from '@typescript-eslint/utils/ts-eslint';
import type {ESLint} from 'eslint';
import {rules} from './src/rules';

type RuleKey = keyof typeof rules;
type RuleType = RuleModule<any, any, any>;
type RulesType = Record<RuleKey, RuleType>;

interface Plugin extends Omit<ESLint.Plugin, 'rules'> {
    rules: RulesType;
    rulesConfig: Record<string, number>;
}

function configureAsError(passedRules: RulesType) {
    const result: ESLint.ConfigData['rules'] = {};
    for (const key in passedRules) {
        if (!{}.hasOwnProperty.call(passedRules, key)) {
            continue;
        }

        result['react-native-unistyles/' + key] = 2;
    }
    return result;
}

const allRulesConfig = configureAsError(rules);

const plugin: Plugin = {
    meta: {name: 'eslint-plugin-react-native-unistyles', version: '0.3.0'},
    rules: rules,
    rulesConfig: {'no-unused-styles': 0, 'sort-styles': 0},
    configs: {
        all: {plugins: ['react-native-unistyles'], parserOptions: {ecmaFeatures: {jsx: true}}, rules: allRulesConfig},
    },
};

export default plugin;
