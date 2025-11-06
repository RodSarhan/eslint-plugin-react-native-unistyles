import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/utils';

/**
 * StyleSheets represents the StyleSheets found in the source code.
 * @constructor
 */
export function StyleSheets() {
    this.styleSheets = {};
}

/**
 * Add adds a StyleSheet to our StyleSheets collections.
 *
 * @param {string} styleSheetName - The name of the StyleSheet.
 * @param {object} properties - The collection of rules in the styleSheet.
 */
StyleSheets.prototype.add = function (styleSheetName: string, properties: object) {
    this.styleSheets[styleSheetName] = properties;
};

/**
 * MarkAsUsed marks a rule as used in our source code by removing it from the
 * specified StyleSheet rules.
 *
 * @param {string} fullyQualifiedName - The fully qualified name of the rule.
 * for example 'styles.text'
 */
StyleSheets.prototype.markAsUsed = function (fullyQualifiedName: string) {
    const nameSplit = fullyQualifiedName.split('.');
    const styleSheetName = nameSplit[0];
    const styleSheetProperty = nameSplit[1];

    if (styleSheetName && this.styleSheets[styleSheetName]) {
        this.styleSheets[styleSheetName] = this.styleSheets[styleSheetName].filter(
            (property) => property.key.name !== styleSheetProperty,
        );
    }
};

/**
 * GetUnusedReferences returns all collected StyleSheets and their
 * unmarked rules.
 */
StyleSheets.prototype.getUnusedReferences = function () {
    return this.styleSheets;
};

export const astHelpers = {
    containsStyleSheetObject: function (node: TSESTree.Node, objectNames: string[]) {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const callee = node.callee;
            if (callee.type === AST_NODE_TYPES.MemberExpression) {
                const object = callee.object;
                if (object.type === AST_NODE_TYPES.Identifier) {
                    return objectNames.includes(object.name);
                }
            }
        }
        return false;
    },

    containsCreateCall: function (node: TSESTree.Node) {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const callee = node.callee;
            if (callee.type === AST_NODE_TYPES.MemberExpression) {
                const property = callee.property;
                if (property.type === AST_NODE_TYPES.Identifier) {
                    return property.name === 'create';
                }
            }
        }
        return false;
    },

    isStyleSheetDeclaration: function (node: TSESTree.Node) {
        const objectNames = ['StyleSheet'];

        return Boolean(astHelpers.containsStyleSheetObject(node, objectNames) && astHelpers.containsCreateCall(node));
    },

    getStyleSheetName: function (node: TSESTree.CallExpression) {
        // @ts-expect-error -- safe
        const nodeParentIdName = node.parent.id.name as string | undefined;
        return nodeParentIdName;
    },

    getStyleDeclarations: function (node: TSESTree.Node) {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const firstArgument = node.arguments[0];

            if (
                firstArgument?.type === AST_NODE_TYPES.ObjectExpression
                || firstArgument?.type === AST_NODE_TYPES.ObjectPattern
            ) {
                const properties = firstArgument.properties;
                return properties.filter((property) => property.type === AST_NODE_TYPES.Property);
            }

            if (firstArgument?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                const body = firstArgument.body;

                if (body?.type === AST_NODE_TYPES.ObjectExpression || body?.type === AST_NODE_TYPES.ObjectPattern) {
                    const properties = body.properties;
                    return properties.filter((property) => property.type === AST_NODE_TYPES.Property);
                }

                if (body.type === AST_NODE_TYPES.BlockStatement) {
                    const statements = body.body;
                    const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                    const argument = returnStatement?.argument;
                    if (
                        argument?.type === AST_NODE_TYPES.ObjectExpression
                        || argument?.type === AST_NODE_TYPES.ObjectPattern
                    ) {
                        const properties = argument.properties;
                        return properties.filter((property) => property.type === AST_NODE_TYPES.Property);
                    }
                }
            }

            if (firstArgument?.type === AST_NODE_TYPES.FunctionExpression) {
                const body = firstArgument.body;
                const statements = body.body;
                const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                const argument = returnStatement?.argument;
                if (
                    argument?.type === AST_NODE_TYPES.ObjectExpression
                    || argument?.type === AST_NODE_TYPES.ObjectPattern
                ) {
                    const properties = argument.properties;
                    return properties.filter((property) => property.type === AST_NODE_TYPES.Property);
                }
            }
        }

        return [];
    },

    getStyleDeclarationsChunks: function (node: TSESTree.Node) {
        const getChunks = (
            properties: TSESTree.ObjectLiteralElement[] | (TSESTree.Property | TSESTree.RestElement)[],
        ) => {
            const result = [];
            let chunk = [];
            for (const property of properties) {
                if (property.type === AST_NODE_TYPES.Property) {
                    chunk.push(property);
                } else if (chunk.length) {
                    result.push(chunk);
                    chunk = [];
                }
            }
            if (chunk.length) {
                result.push(chunk);
            }
            return result;
        };

        if (node.type === AST_NODE_TYPES.CallExpression) {
            const firstArgument = node.arguments[0];

            if (
                firstArgument?.type === AST_NODE_TYPES.ObjectExpression
                || firstArgument?.type === AST_NODE_TYPES.ObjectPattern
            ) {
                const properties = firstArgument.properties;
                return getChunks(properties);
            }

            if (firstArgument?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                const body = firstArgument.body;

                if (body?.type === AST_NODE_TYPES.ObjectExpression || body?.type === AST_NODE_TYPES.ObjectPattern) {
                    const properties = body.properties;
                    return getChunks(properties);
                }

                if (body.type === AST_NODE_TYPES.BlockStatement) {
                    const statements = body.body;
                    const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                    const argument = returnStatement?.argument;
                    if (
                        argument?.type === AST_NODE_TYPES.ObjectExpression
                        || argument?.type === AST_NODE_TYPES.ObjectPattern
                    ) {
                        const properties = argument.properties;
                        return getChunks(properties);
                    }
                }
            }

            if (firstArgument?.type === AST_NODE_TYPES.FunctionExpression) {
                const body = firstArgument.body;
                const statements = body.body;
                const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                const argument = returnStatement?.argument;
                if (
                    argument?.type === AST_NODE_TYPES.ObjectExpression
                    || argument?.type === AST_NODE_TYPES.ObjectPattern
                ) {
                    const properties = argument.properties;
                    return getChunks(properties);
                }
            }
        }

        return [];
    },

    getPropertiesChunks: function (properties: TSESTree.ObjectLiteralElement[]) {
        const result = [];
        let chunk = [];
        for (const property of properties) {
            if (property.type === AST_NODE_TYPES.Property) {
                chunk.push(property);
            } else if (chunk.length) {
                result.push(chunk);
                chunk = [];
            }
        }
        if (chunk.length) {
            result.push(chunk);
        }
        return result;
    },

    getExpressionIdentifier: function (node: TSESTree.Node): string {
        if (node) {
            switch (node.type) {
                case 'Identifier':
                    return node.name;
                case 'Literal':
                    return node.value?.toString() ?? '';
                case 'TemplateLiteral':
                    return node.quasis.reduce((result, quasi, index) => {
                        const expression = node.expressions[index];
                        if (!expression) {
                            return result + quasi.value.cooked;
                        }
                        return result + quasi.value.cooked + astHelpers.getExpressionIdentifier(expression);
                    }, '');

                default:
                    return '';
            }
        }

        return '';
    },

    getStylePropertyIdentifier: function (node: TSESTree.Property) {
        if (node && node.key) {
            return astHelpers.getExpressionIdentifier(node.key);
        }
        return undefined;
    },

    getPotentialStyleReferenceFromMemberExpression: function (node: TSESTree.MemberExpression) {
        if (node.parent.type === AST_NODE_TYPES.MemberExpression) return undefined;
        const objectName = node.object.type === 'Identifier' ? node.object.name : undefined;
        const propertyName = node.property.type === 'Identifier' ? node.property.name : undefined;
        if (objectName && propertyName) {
            return [objectName, propertyName].join('.');
        }
        return undefined;
    },

    isEitherShortHand: function (property1: string, property2: string) {
        const shorthands = ['margin', 'padding', 'border', 'flex'];
        if (shorthands.includes(property1)) {
            return property2.startsWith(property1);
        }
        if (shorthands.includes(property2)) {
            return property1.startsWith(property2);
        }
        return false;
    },
};
