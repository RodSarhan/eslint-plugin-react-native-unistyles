import {AST_NODE_TYPES, ESLintUtils, TSESTree} from '@typescript-eslint/utils';
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

            const fixFunction: ReportFixFunction = (fixer) => {
                // Create sorted array with properties and their associated comments
                const sortedArray = sort(array);

                // Build property-comment pairs for original and sorted arrays
                const originalPairs = array.map((prop) => ({
                    property: prop,
                    comments: sourceCode.getCommentsBefore(prop),
                }));

                const sortedPairs = sortedArray.map((prop) => {
                    const originalPair = originalPairs.find((pair) => pair.property === prop);
                    return originalPair || {property: prop, comments: []};
                });

                // Generate fixes by replacing each property with its sorted counterpart
                const fixes = [];
                for (let i = 0; i < array.length; i++) {
                    const originalProp = array[i];
                    const sortedPair = sortedPairs[i];

                    if (!originalProp || !sortedPair) {
                        continue;
                    }

                    if (originalProp !== sortedPair.property) {
                        // Build replacement text with comments above the property
                        let replacementText = '';

                        // Add comments above the property
                        sortedPair.comments.forEach((comment) => {
                            if (comment.type === TSESTree.AST_TOKEN_TYPES.Line) {
                                replacementText += sourceCode.getText(comment) + '\n';
                            }
                            if (comment.type === TSESTree.AST_TOKEN_TYPES.Block) {
                                // For block comments, preserve indentation by getting the original property's indentation
                                const originalPropStartLine = sourceCode.getLocFromIndex(originalProp.range[0]).line;
                                const lines = sourceCode.getLines();
                                const lineText = lines[originalPropStartLine - 1];
                                const indentation = lineText?.match(/^(\s*)/)?.[1] || '';

                                replacementText += sourceCode.getText(comment) + '\n' + indentation;
                            }
                        });

                        // Add the property itself
                        replacementText += sourceCode.getText(sortedPair.property);

                        // Calculate the range to include comments above the original property
                        const commentsBeforeOriginal = sourceCode.getCommentsBefore(originalProp);
                        const startPos =
                            commentsBeforeOriginal.length > 0 && commentsBeforeOriginal[0]
                                ? commentsBeforeOriginal[0].range[0]
                                : originalProp.range[0];

                        fixes.push(fixer.replaceTextRange([startPos, originalProp.range[1]], replacementText));
                    }
                }

                return fixes;
            };

            context.report({
                node,
                messageId: 'expectedDifferentOrder',
                data: {type, order, currentName, prevName},
                loc: current.key.loc,
                fix: fixFunction,
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
