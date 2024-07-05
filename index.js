/* eslint-disable global-require */

'use strict';

const allRules = {
  'no-unused-styles': require('./lib/rules/no-unused-styles'),
};

function configureAsError(rules) {
  const result = {};
  for (const key in rules) {
    if (!rules.hasOwnProperty(key)) {
      continue;
    }
    result['react-native-unistyles/' + key] = 2;
  }
  return result;
}

const allRulesConfig = configureAsError(allRules);

module.exports = {
  deprecatedRules: {},
  rules: allRules,
  rulesConfig: {
    'no-unused-styles': 0,
  },
  configs: {
    all: {
      plugins: [
        'react-native-unistyles',
      ],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: allRulesConfig,
    },
  },
};
