import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/utils';

/**
 * StyleSheets represents the StyleSheets found in the source code.
 */
export class StyleSheets {
    private styleSheets: Record<string, TSESTree.Property[]> = {};

    /**
     * Add a StyleSheet to our StyleSheets collections.
     */
    add(styleSheetName: string, properties: TSESTree.Property[]): void {
        this.styleSheets[styleSheetName] = properties;
    }

    /**
     * MarkAsUsed marks a rule as used in our source code by removing it from the
     * specified StyleSheet rules.
     *
     * @param fullyQualifiedName - The fully qualified name of the rule (e.g., 'styles.text')
     */
    markAsUsed(fullyQualifiedName: string): void {
        const nameSplit = fullyQualifiedName.split('.');
        const styleSheetName = nameSplit[0];
        const styleSheetProperty = nameSplit[1];

        if (styleSheetName && this.styleSheets[styleSheetName]) {
            this.styleSheets[styleSheetName] = this.styleSheets[styleSheetName].filter((property) => {
                if (property.key.type === AST_NODE_TYPES.Identifier) {
                    return property.key.name !== styleSheetProperty;
                }
                if (property.key.type === AST_NODE_TYPES.Literal) {
                    return property.key.value?.toString() !== styleSheetProperty;
                }

                return true;
            });
        }
    }

    /**
     * GetUnusedReferences returns all collected StyleSheets and their unmarked rules.
     */
    getUnusedReferences(): Record<string, any> {
        return this.styleSheets;
    }
}

export const astHelpers = {
    containsStyleSheetObject(node: TSESTree.Node, objectNames: string[]): boolean {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const callee = node.callee;
            if (callee.type === AST_NODE_TYPES.MemberExpression) {
                const object = callee.object;
                if (object.type === AST_NODE_TYPES.Identifier) {
                    return objectNames.includes(object.name);
                }
                if (object.type === AST_NODE_TYPES.Literal) {
                    return objectNames.includes(object.value?.toString() ?? '');
                }
            }
        }
        return false;
    },

    containsCreateCall(node: TSESTree.Node): boolean {
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

    isStyleSheetDeclaration(node: TSESTree.Node): boolean {
        const objectNames = ['StyleSheet'];
        return Boolean(astHelpers.containsStyleSheetObject(node, objectNames) && astHelpers.containsCreateCall(node));
    },

    getStyleSheetName(node: TSESTree.CallExpression): string | undefined {
        // @ts-expect-error -- safe
        const nodeParentIdName = node.parent.id.name as string | undefined;
        return nodeParentIdName;
    },

    getStyleDeclarations(node: TSESTree.Node): TSESTree.Property[] {
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

    getStyleDeclarationsChunks(node: TSESTree.Node): TSESTree.Property[][] {
        const getChunks = (
            properties: TSESTree.ObjectLiteralElement[] | (TSESTree.Property | TSESTree.RestElement)[],
        ): TSESTree.Property[][] => {
            const result: TSESTree.Property[][] = [];
            let chunk: TSESTree.Property[] = [];
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

    getPropertiesChunks(properties: TSESTree.ObjectLiteralElement[]): TSESTree.Property[][] {
        const result: TSESTree.Property[][] = [];
        let chunk: TSESTree.Property[] = [];
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

    getExpressionIdentifier(node: TSESTree.Node): string {
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

    getStylePropertyIdentifier(node: TSESTree.Property): string | undefined {
        if (node && node.key) {
            return astHelpers.getExpressionIdentifier(node.key);
        }
        return undefined;
    },

    getPotentialStyleReferenceFromMemberExpression(node: TSESTree.MemberExpression): string | undefined {
        if (node.parent.type === AST_NODE_TYPES.MemberExpression) return undefined;
        const objectName =
            node.object.type === 'Identifier'
                ? node.object.name
                : node.object.type === 'Literal'
                  ? node.object.value?.toString()
                  : undefined;
        const propertyName =
            node.property.type === 'Identifier'
                ? node.property.name
                : node.property.type === 'Literal'
                  ? node.property.value?.toString()
                  : undefined;
        if (objectName && propertyName) {
            return [objectName, propertyName].join('.');
        }
        return undefined;
    },

    isEitherShortHand(property1: string, property2: string): boolean {
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
