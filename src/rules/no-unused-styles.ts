import {ESLintUtils, type TSESTree} from '@typescript-eslint/utils';

import {componentsUtils} from '../util/component';
import {StyleSheets, stylesASTHelpers} from '../util/stylesheet';

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
    create: componentsUtils.enhanceRuleWithComponentDetection((context, components) => {
        const styleSheets = new StyleSheets();
        const styleReferences = new Set<string>();

        function reportUnusedStyles(unusedStyles: Record<string, TSESTree.Property[]>) {
            Object.keys(unusedStyles).forEach((key) => {
                if ({}.hasOwnProperty.call(unusedStyles, key)) {
                    const styles = unusedStyles[key];
                    styles?.forEach((node) => {
                        const propertyName = stylesASTHelpers.getStylePropertyIdentifier(node);
                        if (propertyName) {
                            context.report({
                                node: node,
                                messageId: 'unusedStyleDetected',
                                data: {message: [`Unused style detected: ${key}.${propertyName}`]},
                                loc: node.key.loc,
                            });
                        }
                    });
                }
            });
        }

        return {
            MemberExpression: function (node) {
                const styleRef = stylesASTHelpers.getPotentialStyleReferenceFromMemberExpression(node);
                if (styleRef) {
                    styleReferences.add(styleRef);
                }
            },

            CallExpression: function (node) {
                if (stylesASTHelpers.isStyleSheetDeclaration(node)) {
                    const styleSheetName = stylesASTHelpers.getStyleSheetName(node);
                    const styles = stylesASTHelpers.getStyleDeclarations(node);
                    if (styleSheetName) {
                        styleSheets.add(styleSheetName, styles);
                    }
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
