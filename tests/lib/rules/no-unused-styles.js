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
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text textStyle={styles.name}>Hello</Text>
          );
      };
      const styleSheet = createStyleSheet({
          name: {},
      });
    `,
  }, {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(stylesheet);
      return <Text textStyle={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet((theme) => ({
      name: {},
    }));
    `,
  }, {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(stylesheet);
      return <Text textStyle={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet((theme) => {
      return {
        name: {},
      };
    });
    `,
  }, {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(stylesheet);
      return <Text textStyle={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet((theme) => {
      const someVar = 'name';
      return {
        name: {},
      };
    });
    `,
  },
  // TODO: Support this case
  // {
  //   code: `
  //   const styleSheet = createStyleSheet({
  //     text: {}
  //   });

  //   const MyComponent = () => {
  //     const {styles: myStyles} = useStyles(styleSheet);
  //     return <Text textStyles={myStyles.text}>Hello</Text>
  //   };
  //   `,
  // },
  {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(stylesheet);
      return <Text style={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet(function returnStyles(theme) {
      return {
        name: {},
      };
    });
    `,
  }, {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(stylesheet);
      return <Text style={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet(function returnStyles(theme) {
    const someVar = 'name';
      return {
        name: {},
      };
    });
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          name: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text textStyle={styles.name}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          name: {},
          welcome: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text style={styles.name}>Hello</Text>
          );
      };
      const MyOtherComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text style={styles.welcome}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          text: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text style={[styles.text, textStyle]}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          text: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          const condition1 = true;
          const condition2 = true;

          return (
              <Text style={[condition && condition2 && styles.text]}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          text1: {},
          text2: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          const condition = true;

          return (
              <Text style={[condition ? styles.text1 : styles.text2]}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          style1: {
              color: 'red',
          },
          style2: {
              color: 'blue',
          },
      });
      export const MyComponent = ({isRed}) => {
          const {styles} = useStyles(stylesheet);

          return (
              <Text style={isRed ? styles.style1 : styles.style2}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet = createStyleSheet({
          name: {},
      });
    `,
  }, {
    code: `
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          const condition = true;
          const myStyle = condition ? styles.text1 : styles.text2;

          return (
              <Text style={myStyle}>Hello</Text>
          );
      };
      const styleSheet = createStyleSheet({
          text1: {},
          text2: {},
      });
    `,
  }, {
    code: `
      const additionalStyles = {};
      const styleSheet = createStyleSheet({
          text: {},
          ...additionalStyles,
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);

          return (
              <Text style={styles.text}>Hello</Text>
          );
      };
    `,
  }],

  invalid: [{
    code: `
      const styleSheet = createStyleSheet({
          text: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text textStyle={styles.someOtherStyle}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styles.text',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet(() => {
          return {
              text: {},
          };
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text style={styles.someOtherStyle}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styles.text',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet({
          foo: {},
          bar: {},
      });
      const MyComponent = () => {
          const {styles} = useStyles(stylesheet);
          return (
              <Text style={styles.foo}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styles.bar',
    }],
  }],
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
