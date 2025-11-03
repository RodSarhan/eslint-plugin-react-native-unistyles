/* eslint-env mocha */

import assert from 'assert';
import plugin from '..';
import {rules} from '../src/rules';

const ruleNames = ['no-unused-styles', 'sort-styles'] as const;

const defaultSettings = {'no-unused-styles': 0, 'sort-styles': 0};

describe('all rule files should be exported by the plugin', () => {
    ruleNames.forEach((ruleName) => {
        it('should export ' + ruleName, () => {
            assert.equal(plugin.rules[ruleName], rules[ruleName]);
        });

        if ({}.hasOwnProperty.call(defaultSettings, ruleName)) {
            const val = defaultSettings[ruleName];
            it('should configure ' + ruleName + ' to ' + val + ' by default', () => {
                assert.equal(plugin.rulesConfig[ruleName], val);
            });
        } else {
            it('should configure ' + ruleName + ' off by default', () => {
                assert.equal(plugin.rulesConfig[ruleName], 0);
            });
        }
    });
});

describe('configurations', () => {
    it("should export a 'all' configuration", () => {
        assert(plugin.configs?.all);
        // @ts-expect-error -- ignore
        Object.keys(plugin.configs.all.rules).forEach((configName) => {
            assert.equal(configName.indexOf('react-native-unistyles/'), 0);
            // @ts-expect-error -- ignore
            assert.equal(plugin.configs.all.rules[configName], 2);
        });
        ruleNames.forEach((ruleName) => {
            // @ts-expect-error -- ignore
            const deprecatedRules = plugin.deprecatedRules || {};
            const inDeprecatedRules = Boolean(deprecatedRules[ruleName]);
            // @ts-expect-error -- ignore
            const inAllConfig = Boolean(plugin.configs?.all.rules['react-native-unistyles/' + ruleName]);
            assert(inDeprecatedRules !== inAllConfig);
        });
    });
});
