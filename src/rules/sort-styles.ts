import {AST_NODE_TYPES, ESLintUtils, type TSESTree} from '@typescript-eslint/utils';
import type {ReportFixFunction} from '@typescript-eslint/utils/ts-eslint';
import {stylesASTHelpers} from '../util/stylesheet';

const createRule = ESLintUtils.RuleCreator(
    (name) => `https://github.com/RodSarhan/eslint-plugin-react-native-unistyles/blob/main/docs/rules/${name}.md`,
);

export const sortStyles = createRule({
    name: 'sort-styles',
    meta: {
        docs: {description: 'Disallow unused styles'},
        type: 'suggestion',
        messages: {
            expectedDifferentOrder:
                "Expected {{ type }} to be in {{ order }}ending order. '{{ currentName }}' should be before '{{ prevName }}'.",
        },
        fixable: 'code',
        schema: [
            {type: 'string', enum: ['asc', 'desc']},
            {
                type: 'object',
                properties: {ignoreStyleNames: {type: 'boolean'}, ignoreStyleProperties: {type: 'boolean'}},
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: ['asc', {ignoreStyleNames: false, ignoreStyleProperties: false}],
    create: (context) => {
        const order = context.options[0] || 'asc';
        const options = context.options[1] || {};
        const {ignoreStyleNames} = options;
        const {ignoreStyleProperties} = options;
        const isValidOrder = order === 'asc' ? (a: string, b: string) => a <= b : (a: string, b: string) => a >= b;

        const sourceCode = context.sourceCode;

        function sort(array: TSESTree.Property[]) {
            const result: TSESTree.Property[] = [];
            return result.concat(array).sort((a, b) => {
                const identifierA = stylesASTHelpers.getStylePropertyIdentifier(a);
                const identifierB = stylesASTHelpers.getStylePropertyIdentifier(b);

                let sortOrder = 0;
                if (identifierA && identifierB && stylesASTHelpers.isEitherShortHand(identifierA, identifierB)) {
                    return a.range[0] - b.range[0];
                }
                if (identifierA && identifierB) {
                    if (identifierA < identifierB) {
                        sortOrder = -1;
                    } else if (identifierA > identifierB) {
                        sortOrder = 1;
                    }
                }
                return sortOrder * (order === 'asc' ? 1 : -1);
            });
        }

        function report(args: {
            array: TSESTree.Property[];
            type: string;
            node: TSESTree.CallExpression;
            prev: TSESTree.Property;
            current: TSESTree.Property;
        }) {
            const {array, type, node, prev, current} = args;
            const currentName = stylesASTHelpers.getStylePropertyIdentifier(current);
            const prevName = stylesASTHelpers.getStylePropertyIdentifier(prev);
            const hasComments = array
                .map((prop) => [...sourceCode.getCommentsBefore(prop), ...sourceCode.getCommentsAfter(prop)])
                .reduce((hasComment, comment) => hasComment || comment.length > 0, false);

            const fixFunction: ReportFixFunction = (fixer) => {
                const sortedArray = sort(array);
                const fixesArray = array.map((item, i) => {
                    if (item !== sortedArray[i]) {
                        return fixer.replaceText(item, sourceCode.getText(sortedArray[i]));
                    }
                    return null;
                });
                return fixesArray.filter((x) => !!x);
            };

            context.report({
                node,
                messageId: 'expectedDifferentOrder',
                data: {type, order, currentName, prevName},
                loc: current.key.loc,
                fix: hasComments ? undefined : fixFunction,
            });
        }

        function checkIsSorted(args: {
            array: TSESTree.Property[];
            type: 'style-properties' | 'style-names';
            node: TSESTree.CallExpression;
        }) {
            const {array, type, node} = args;
            for (let i = 1; i < array.length; i += 1) {
                const prev = array[i - 1];
                const current = array[i];

                if (prev?.type !== AST_NODE_TYPES.Property || current?.type !== AST_NODE_TYPES.Property) {
                    return;
                }

                const prevName = stylesASTHelpers.getStylePropertyIdentifier(prev);
                const currentName = stylesASTHelpers.getStylePropertyIdentifier(current);

                const oneIsShorthandForTheOther =
                    type === 'style-properties'
                    && prevName
                    && currentName
                    && stylesASTHelpers.isEitherShortHand(prevName, currentName);

                if (!oneIsShorthandForTheOther && prevName && currentName && !isValidOrder(prevName, currentName)) {
                    return report({array, type, node, prev, current});
                }
            }
        }

        return {
            CallExpression: function (node) {
                if (!stylesASTHelpers.isStyleSheetDeclaration(node)) {
                    return;
                }

                const styleDeclarationsChunks = stylesASTHelpers.getStyleDeclarationsChunks(node);

                if (!ignoreStyleNames) {
                    styleDeclarationsChunks.forEach((styleDeclarationChunk) => {
                        checkIsSorted({array: styleDeclarationChunk, type: 'style-names', node});
                    });
                }

                if (ignoreStyleProperties) return;

                styleDeclarationsChunks.forEach((styleDeclarationChunk) => {
                    styleDeclarationChunk.forEach((styleChunck) => {
                        let innerStyleProperties: TSESTree.ObjectLiteralElement[] = [];
                        if (styleChunck.value.type === AST_NODE_TYPES.ObjectExpression) {
                            innerStyleProperties = styleChunck.value.properties;
                        }
                        if (styleChunck.value.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                            if (styleChunck.value.body.type === AST_NODE_TYPES.ObjectExpression) {
                                innerStyleProperties = styleChunck.value.body.properties;
                            }
                            if (styleChunck.value.body.type === AST_NODE_TYPES.BlockStatement) {
                                const returnStatement = styleChunck.value.body.body.find(
                                    (statement) => statement.type === AST_NODE_TYPES.ReturnStatement,
                                );
                                if (returnStatement?.argument?.type === AST_NODE_TYPES.ObjectExpression) {
                                    innerStyleProperties = returnStatement.argument.properties;
                                }
                            }
                        }
                        if (styleChunck.value.type === AST_NODE_TYPES.FunctionExpression) {
                            const returnStatement = styleChunck.value.body.body.find(
                                (statement) => statement.type === AST_NODE_TYPES.ReturnStatement,
                            );
                            if (returnStatement?.argument?.type === AST_NODE_TYPES.ObjectExpression) {
                                innerStyleProperties = returnStatement.argument.properties;
                            }
                        }
                        if (innerStyleProperties.length < 2) {
                            return;
                        }
                        const stylePropertyChunks = stylesASTHelpers.getPropertiesChunks(innerStyleProperties);
                        stylePropertyChunks.forEach((stylePropertyChunk) => {
                            checkIsSorted({array: stylePropertyChunk, type: 'style-properties', node});
                        });

                        return;
                    });
                });
            },
        };
    },
});
