import {AST_NODE_TYPES, ESLintUtils} from '@typescript-eslint/utils';
import type {ReportFixFunction} from '@typescript-eslint/utils/ts-eslint';
import {astHelpers} from '../util/stylesheet';

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
                properties: {ignoreClassNames: {type: 'boolean'}, ignoreStyleProperties: {type: 'boolean'}},
                additionalProperties: false,
            },
        ],
    },
    defaultOptions: ['asc', {ignoreClassNames: false, ignoreStyleProperties: false}],
    create: (context) => {
        const order = context.options[0] || 'asc';
        const options = context.options[1] || {};
        const {ignoreClassNames} = options;
        const {ignoreStyleProperties} = options;
        const isValidOrder = order === 'asc' ? (a: string, b: string) => a <= b : (a: string, b: string) => a >= b;

        const sourceCode = context.sourceCode;

        function sort(array: any[]) {
            const result: any[] = [];
            return result.concat(array).sort((a, b) => {
                const identifierA = astHelpers.getStylePropertyIdentifier(a);
                const identifierB = astHelpers.getStylePropertyIdentifier(b);

                let sortOrder = 0;
                if (astHelpers.isEitherShortHand(identifierA, identifierB)) {
                    return a.range[0] - b.range[0];
                }
                if (identifierA < identifierB) {
                    sortOrder = -1;
                } else if (identifierA > identifierB) {
                    sortOrder = 1;
                }
                return sortOrder * (order === 'asc' ? 1 : -1);
            });
        }

        function report(array: any[], type: any, node: any, prev: any, current: any) {
            const currentName = astHelpers.getStylePropertyIdentifier(current);
            const prevName = astHelpers.getStylePropertyIdentifier(prev);
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

        function checkIsSorted(array: any[], arrayName: string, node: ASTNode) {
            for (let i = 1; i < array.length; i += 1) {
                const previous = array[i - 1];
                const current = array[i];

                if (previous.type !== 'Property' || current.type !== 'Property') {
                    return;
                }

                const prevName = astHelpers.getStylePropertyIdentifier(previous);
                const currentName = astHelpers.getStylePropertyIdentifier(current);

                const oneIsShorthandForTheOther =
                    arrayName === 'style properties' && astHelpers.isEitherShortHand(prevName, currentName);

                if (!oneIsShorthandForTheOther && !isValidOrder(prevName, currentName)) {
                    return report(array, arrayName, node, previous, current);
                }
            }
        }

        return {
            CallExpression: function (node) {
                if (!astHelpers.isStyleSheetDeclaration(node)) {
                    return;
                }

                const classDefinitionsChunks = astHelpers.getStyleDeclarationsChunks(node);

                if (!ignoreClassNames) {
                    classDefinitionsChunks.forEach((classDefinitions) => {
                        checkIsSorted(classDefinitions, 'class names', node);
                    });
                }

                if (ignoreStyleProperties) return;

                classDefinitionsChunks.forEach((classDefinitions) => {
                    classDefinitions.forEach((classDefinition) => {
                        if (classDefinition.value.type === AST_NODE_TYPES.ObjectExpression) {
                            const styleProperties = classDefinition.value.properties;
                            if (styleProperties.length < 2) {
                                return;
                            }
                            const stylePropertyChunks = astHelpers.getPropertiesChunks(styleProperties);
                            stylePropertyChunks.forEach((stylePropertyChunk) => {
                                checkIsSorted(stylePropertyChunk, 'style properties', node);
                            });
                        }

                        return;
                    });
                });
            },
        };
    },
});
