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
          const {styles} = useStyles(styleSheet);
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
      const {styles} = useStyles(styleSheet);
      return <Text textStyle={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet((theme) => ({
      name: {},
    }));
    `,
  }, {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(styleSheet);
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
      const {styles} = useStyles(styleSheet);
      return <Text textStyle={styles.name}>Hello</Text>;
    };
    const styleSheet = createStyleSheet((theme) => {
      const someVar = 'name';
      return {
        name: {},
      };
    });
    `,
  }, {
    code: `
    const styleSheet = createStyleSheet({
      text: {}
    });

    const MyComponent = () => {
      const {styles: myStyles} = useStyles(styleSheet);
      return <Text textStyles={myStyles.text}>Hello</Text>
    };
    `,
  }, {
    code: `
    const styleSheet = createStyleSheet((theme) => ({
      text: {},
      viewStyle: {}
    }));

    const MyComponent = () => {
      const {theme, styles: myStyles} = useStyles(styleSheet);
      return <View style={myStyles.viewStyle}><Text style={myStyles.text}>Hello</Text></View>
    };
    `,
  }, {
    code: `
    const styleSheet1 = createStyleSheet((theme) => ({
      text: {},
    }));

    const styleSheet2 = createStyleSheet((theme) => ({
      viewStyle: {}
    }));

    const MyComponent = () => {
      const {theme, styles: myStyles1} = useStyles(styleSheet1);
      const textStyle = myStyles1.text
      return <Text style={textStyle}>Hello</Text>
    };
    const MyComponent2 = () => {
      const {theme, styles: myStyles2} = useStyles(styleSheet2);
      return <View style={myStyles2.viewStyle}/>
    };
    `,
  },
  {
    code: `
    const MyComponent = () => {
      const {styles} = useStyles(styleSheet);
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
      const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);
          return (
              <Text style={styles.name}>Hello</Text>
          );
      };
      const MyOtherComponent = () => {
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);

          return (
              <Text style={isRed ? styles.style1 : styles.style2}>Hello</Text>
          );
      };
    `,
  }, {
    code: `
      const styleSheet1 = createStyleSheet((theme) => ({someStyle1: {}}));
      const styleSheet2 = createStyleSheet((theme) => ({someStyle1: {}}));

      const MyComponent1 = () => {
          const {styles} = useStyles(styleSheet1);
          return <View style={styles.someStyle1} />;
      };

      const MyComponent2 = () => {
          const {styles} = useStyles(styleSheet2);
          return <View style={styles.someStyle1} />;
      };
    `,
  }, {
    code: `
      const styleSheet1 = createStyleSheet((theme) => ({someStyle1: {}}));
      const styleSheet2 = createStyleSheet((theme) => ({someStyle2: {}}));

      const MyComponent1 = () => {
          const {styles} = useStyles(styleSheet1);
          return <View style={styles.someStyle1} />;
      };

      const MyComponent2 = () => {
          const {styles} = useStyles(styleSheet2);
          return <View style={styles.someStyle2} />;
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
      export function MyComponent ({isRed}) {
          const {styles} = useStyles(styleSheet);

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
          const {styles} = useStyles(styleSheet);
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
          const {styles} = useStyles(styleSheet);

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
          const {styles} = useStyles(styleSheet);
          return (
              <Text textStyle={styles.someOtherStyle}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.text',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet(() => {
          return {
              text: {},
          };
      });
      const MyComponent = () => {
          const {styles} = useStyles(styleSheet);
          return (
              <Text style={styles.someOtherStyle}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.text',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet(() => {
          return {
              text: {},
              other: {},
          };
      });
      const MyComponent = () => {
          const {styles: myStyles} = useStyles(styleSheet);
          return (
              <Text style={myStyles.other}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.text',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet((theme) => ({
        container: {},
      }));
      const MyComponent = () => {
          const {styles: myStyles} = useStyles(styleSheet);
          return (
              <View style={styles.container}/>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.container',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet(() => {
          return {
              text: {},
              other: {},
          };
      });
      const MyComponent = () => {
          const {styles: myStyles} = useStyles(styleSheet);
          return (
              <Text style={myStyles.someThirdStyle}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.text',
    }, {
      message: 'Unused style detected: styleSheet.other',
    }],
  }, {
    code: `
      const styleSheet = createStyleSheet(() => ({
          foo: {},
          bar: {},
      }));
      const MyComponent = () => {
          const {styles} = useStyles(styleSheet);
          return (
              <Text style={styles.foo}>Hello</Text>
          );
      };
    `,
    errors: [{
      message: 'Unused style detected: styleSheet.bar',
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
