/* eslint-env mocha */

import assert from 'assert';
import plugin from '../dist';

const ruleNames = ['no-unused-styles', 'sort-styles'] as const;

describe('all rule files should be exported by the plugin', () => {
    ruleNames.forEach((ruleName) => {
        it('should export ' + ruleName, () => {
            assert(plugin.rules?.[ruleName]);
        });
    });
});

describe('configurations', () => {
    it("should export a 'all' configuration", () => {
        assert(plugin.configs?.all);
    });
    it("should export a 'recommended' configuration", () => {
        assert(plugin.configs?.recommended);
    });
    it("should export a 'legacy-recommended' configuration", () => {
        assert(plugin.configs?.['legacy-recommended']);
    });
    it("should export a 'legacy-all' configuration", () => {
        assert(plugin.configs?.['legacy-all']);
    });
});
