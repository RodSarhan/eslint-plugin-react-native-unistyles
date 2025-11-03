import {RuleTester} from 'eslint';
import {rules} from '../../../src/rules';
import Parser from '@typescript-eslint/parser';

const rule = rules['no-unused-styles'];

const ruleTester = new RuleTester({languageOptions: {parser: Parser, parserOptions: {ecmaFeatures: {jsx: true}}}});

const tests = {
    valid: [
        {
            code: `
                const styleSheet = createStyleSheet({
                    style1: {
                        color: 'red',
                    },
                    style2: {
                        color: 'blue',
                    },
                });
                
                export function MyComponent({ isRed }) {
                    const { styles } = useStyles(styleSheet);

                    return (
                        <Text style={isRed ? styles.style1 : styles.style2}>
                            Hello
                        </Text>
                    );
                }
            `,
        },
    ],
    invalid: [],
};

ruleTester.run('no-unused-styles', rule as any, tests);
