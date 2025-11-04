import {RuleTester} from 'eslint';
import {rules} from '../../../src/rules';
import Parser from '@typescript-eslint/parser';

const rule = rules['no-unused-styles'];

const ruleTester = new RuleTester({languageOptions: {parser: Parser, parserOptions: {ecmaFeatures: {jsx: true}}}});

const tests = {
    valid: [
        {
            code: `
const MyComponent = () => {
    return <Text textStyle={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create({name: {}});
    `,
        },
        {
            code: `
const MyComponent = () => {
    return <Text textStyle={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create((theme) => ({name: {}}));
    `,
        },
        {
            code: `
const MyComponent = () => {
    return <Text textStyle={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create((theme) => {
    return {name: {}};
});
    `,
        },
        {
            code: `
const MyComponent = () => {
    return <Text textStyle={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create((theme) => {
    const someVar = 'name';
    return {name: {}};
});
    `,
        },
        {
            code: `
const styles = StyleSheet.create((theme) => ({text: {}, viewStyle: {}}));

const MyComponent = () => {
    return (
        <View style={styles.viewStyle}>
            <Text style={styles.text}>Hello</Text>
        </View>
    );
};
    `,
        },
        {
            code: `
const styles1 = StyleSheet.create((theme) => ({text: {}}));

const styles2 = StyleSheet.create((theme) => ({viewStyle: {}}));

const MyComponent = () => {
    const textStyle = styles1.text;
    return <Text style={textStyle}>Hello</Text>;
};
const MyComponent2 = () => {
    return <View style={styles2.viewStyle} />;
};
    `,
        },
        {
            code: `
const MyComponent = () => {
    return <Text style={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create(function returnStyles(theme) {
    return {name: {}};
});
    `,
        },
        {
            code: `
const MyComponent = () => {
    return <Text style={styles.name}>Hello</Text>;
};
const styles = StyleSheet.create(function returnStyles(theme) {
    const someVar = 'name';
    return {name: {}};
});
    `,
        },
        {
            code: `
const styles = StyleSheet.create({name: {}});

const MyComponent = () => {
    return <Text textStyle={styles.name}>Hello</Text>;
};

    `,
        },
        {
            code: `
const styles = StyleSheet.create({name: {}, welcome: {}});
const MyComponent = () => {
    return <Text style={styles.name}>Hello</Text>;
};
const MyOtherComponent = () => {
    return <Text style={styles.welcome}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({text: {}});
const MyComponent = () => {
    return <Text style={[styles.text, textStyle]}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({text: {}});
const MyComponent = () => {
    const condition1 = true;
    const condition2 = true;

    return <Text style={[condition1 && condition2 && styles.text]}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({text1: {}, text2: {}});
const MyComponent = () => {
    const condition = true;

    return <Text style={[condition ? styles.text1 : styles.text2]}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({style1: {color: 'red'}, style2: {color: 'blue'}});
export const MyComponent = ({isRed}) => {
    return <Text style={isRed ? styles.style1 : styles.style2}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles1 = StyleSheet.create((theme) => ({someStyle1: {}}));
const styles2 = StyleSheet.create((theme) => ({someStyle1: {}}));

const MyComponent1 = () => {
    return <View style={styles1.someStyle1} />;
};

const MyComponent2 = () => {
    return <View style={styles2.someStyle1} />;
};
    `,
        },
        {
            code: `
const styles1 = StyleSheet.create((theme) => ({someStyle1: {}}));
const styles2 = StyleSheet.create((theme) => ({someStyle2: {}}));

const MyComponent1 = () => {
    return <View style={styles1.someStyle1} />;
};

const MyComponent2 = () => {
    return <View style={styles2.someStyle2} />;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({style1: {color: 'red'}, style2: {color: 'blue'}});
export function MyComponent({isRed}) {
    return <Text style={isRed ? styles.style1 : styles.style2}>Hello</Text>;
}
    `,
        },
        {
            code: `
const styles = StyleSheet.create({name: {}});
    `,
        },
        {
            code: `
const styles = StyleSheet.create({});
const MyComponent = () => {
    return <Text style={styles.name}>Hello</Text>;
};
    `,
        },
        {
            code: `
const MyComponent = () => {
    const condition = true;
    const myStyle = condition ? styles.text1 : styles.text2;

    return <Text style={myStyle}>Hello</Text>;
};
const styles = StyleSheet.create({text1: {}, text2: {}});
    `,
        },
        {
            code: `
const additionalStyles = {};
const styles = StyleSheet.create({text: {}, ...additionalStyles});
const MyComponent = () => {
    return <Text style={styles.text}>Hello</Text>;
};
    `,
        },
        {
            code: `
const styles = StyleSheet.create({text: {}});
export default function MyComponent() {
    return <Text style={styles.text}>Hello</Text>;
}
    `,
        },
    ],

    invalid: [
        {
            code: `
const styles = StyleSheet.create({text: {}});
const MyComponent = () => {
    return <Text textStyle={styles.someOtherStyle}>Hello</Text>;
};
    `,
            errors: [{message: 'Unused style detected: styles.text'}],
        },
        {
            code: `
const styles = StyleSheet.create(() => {
    return {text: {}};
});
const MyComponent = () => {
    return <Text style={styles.someOtherStyle}>Hello</Text>;
};
    `,
            errors: [{message: 'Unused style detected: styles.text'}],
        },
        {
            code: `
const styles = StyleSheet.create(() => {
    return {text: {}, other: {}};
});

const MyComponent = () => {
    return <Text style={styles.other}>Hello</Text>;
};
    `,
            errors: [{message: 'Unused style detected: styles.text'}],
        },
        {
            code: `
const styles = StyleSheet.create(() => {
    return {text: {}, other: {}};
});
const myStyles = styles;
const MyComponent = () => {
    return <Text style={myStyles.someThirdStyle}>Hello</Text>;
};

    `,
            errors: [{message: 'Unused style detected: styles.text'}, {message: 'Unused style detected: styles.other'}],
        },
        {
            code: `
export const styles = StyleSheet.create(() => ({foo: {}, bar: {}}));
export const MyComponent = () => {
    return <Text style={styles.foo}>Hello</Text>;
};
    `,
            errors: [{message: 'Unused style detected: styles.bar'}],
        },
        // TODO: failing
        {
            code: `
export const MyComponent = wrapper(() => {
    return <Text style={styles.foo}>Hello</Text>;
});
export const styles = StyleSheet.create(() => ({foo: {}, bar: {}}));
    `,
            errors: [{message: 'Unused style detected: styles.bar'}],
        },
        {
            code: `
const MyComponent = () => {
    return <Text style={styles.foo}>Hello</Text>;
};

export const WrappedComponent = wrapper(MyComponent);

export const styles = StyleSheet.create(() => ({foo: {}, bar: {}}));
    `,
            errors: [{message: 'Unused style detected: styles.bar'}],
        },
    ],
};

ruleTester.run('no-unused-styles', rule as any, tests);
