import {ESLintUtils} from '@typescript-eslint/utils';

import {enhanceRuleWithComponentDetection} from '../util/Components';
import {StyleSheets, astHelpers} from '../util/stylesheet';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/RodSarhan/eslint-plugin-react-native-unistyles/blob/main/docs/rules/${name}.md`,
);

export const noUnusedStyles = createRule({
    name: 'no-unused-styles',
    meta: {
        docs: {description: 'Disallow unused styles'},
        type: 'suggestion',
        messages: {unusedStyleDetected: '{{ message }}'},
        schema: [],
    },
    defaultOptions: [],
    create: enhanceRuleWithComponentDetection((context, components) => {
        const styleSheets = new StyleSheets();
        const styleReferences = new Set<string>();

        function reportUnusedStyles(unusedStyles: any) {
            Object.keys(unusedStyles).forEach((key) => {
                if ({}.hasOwnProperty.call(unusedStyles, key)) {
                    const styles = unusedStyles[key];
                    styles.forEach((node: ASTNode) => {
                        context.report({
                            node: node as any,
                            messageId: 'unusedStyleDetected',
                            data: {message: ['Unused style detected: ', key, '.', node.key.name].join('')},
                        });
                    });
                }
            });
        }

        return {
            MemberExpression: function (node) {
                const styleRef = astHelpers.getPotentialStyleReferenceFromMemberExpression(node);
                if (styleRef) {
                    styleReferences.add(styleRef);
                }
            },

            CallExpression: function (node) {
                if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
                    const styleSheetName = astHelpers.getStyleSheetName(node);
                    const styles = astHelpers.getStyleDeclarations(node);

                    styleSheets.add(styleSheetName, styles);
                }
            },

            'Program:exit': function () {
                const list = components.all();
                if (Object.keys(list).length > 0) {
                    styleReferences.forEach((reference) => {
                        styleSheets.markAsUsed(reference);
                    });
                    reportUnusedStyles(styleSheets.getUnusedReferences());
                }
            },
        };
    }),
});
