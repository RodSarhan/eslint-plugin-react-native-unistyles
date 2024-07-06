/**
 * @fileoverview No unused styles defined in javascript files
 */

'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/no-unused-styles');

require('@babel/eslint-parser');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

const ruleTester = new RuleTester();
const tests = {
  valid: [{
    code: `
      const styleSheet = createStyleSheet({
          style1: {
              color: 'red',
          },
          style2: {
              color: 'blue',
          },
      });
      export function MyComponent ({isRed}) {
          const {styles} = useStyles(styleSheet);

          return (
              <Text style={isRed ? styles.style1 : styles.style2}>Hello</Text>
          );
      };
    `,
  }],

  invalid: [],
};

const config = {
  parser: require.resolve('@babel/eslint-parser'),
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: [
          ['estree', { classFeatures: true }],
          'jsx',
        ],
      },
    },
  },
  settings: {},
};

tests.valid.forEach((t) => Object.assign(t, config));
tests.invalid.forEach((t) => Object.assign(t, config));

ruleTester.run('no-unused-styles', rule, tests);
