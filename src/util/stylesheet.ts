import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/utils';
import {genericUtils} from './generic';

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
                if (property.key.type === AST_NODE_TYPES.TemplateLiteral) {
                    const keyString = genericUtils.getStringFromTemplateLiteral(property.key);
                    return keyString !== styleSheetProperty;
                }

                return true;
            });
        }
    }

    /**
     * GetUnusedReferences returns all collected StyleSheets and their unmarked rules.
     */
    getUnusedReferences(): Record<string, TSESTree.Property[]> {
        return this.styleSheets;
    }
}

export const stylesASTHelpers = {
    containsStyleSheetObject(node: TSESTree.Node, objectNames: string[]): boolean {
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

    containsCreateCall(node: TSESTree.Node): boolean {
        if (node.type === AST_NODE_TYPES.CallExpression) {
            const callee = node.callee;
            if (callee.type === AST_NODE_TYPES.MemberExpression) {
                // StyleSheet.create
                const property = callee.property;
                if (property.type === AST_NODE_TYPES.Identifier) {
                    return property.name === 'create';
                }
                // StyleSheet["create"]
                if (property.type === AST_NODE_TYPES.Literal) {
                    return property.value === 'create';
                }
                // StyleSheet[`create`]
                if (property.type === AST_NODE_TYPES.TemplateLiteral) {
                    const propertyName = genericUtils.getStringFromTemplateLiteral(property);
                    return propertyName === 'create';
                }
            }
        }
        return false;
    },

    isStyleSheetDeclaration(node: TSESTree.Node): boolean {
        const objectNames = ['StyleSheet'];
        // has StylesSheet indetifier
        const hasStyleSheetObject = stylesASTHelpers.containsStyleSheetObject(node, objectNames);
        // calls create function StyleSheet.create
        const hasCreateCall = stylesASTHelpers.containsCreateCall(node);
        return hasStyleSheetObject && hasCreateCall;
    },

    getStyleSheetName(node: TSESTree.CallExpression) {
        const parent = node.parent;
        if (parent.type === AST_NODE_TYPES.VariableDeclarator) {
            if (parent.id.type === AST_NODE_TYPES.Identifier) {
                return parent.id.name;
            }
        }
        return undefined;
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

    getStyleDeclarationsChunks(node: TSESTree.CallExpression): TSESTree.Property[][] {
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

            // example StyleSheet.create( { ... } )
            if (firstArgument?.type === AST_NODE_TYPES.ObjectExpression) {
                const properties = firstArgument.properties;
                return getChunks(properties);
            }

            // example StyleSheet.create(() => ( { ... } ))
            // example StyleSheet.create(() => { return { ... } })
            if (firstArgument?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                const body = firstArgument.body;

                // example StyleSheet.create(() => ( { ... } ))
                if (body?.type === AST_NODE_TYPES.ObjectExpression) {
                    const properties = body.properties;
                    return getChunks(properties);
                }

                // example StyleSheet.create(() => { return { ... } })
                if (body.type === AST_NODE_TYPES.BlockStatement) {
                    const statements = body.body;
                    const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                    const argument = returnStatement?.argument;
                    if (argument?.type === AST_NODE_TYPES.ObjectExpression) {
                        const properties = argument.properties;
                        return getChunks(properties);
                    }
                }
            }

            // example StyleSheet.create(function () { ... })
            // example2 StyleSheet.create(function namedfunc() { ... })
            if (firstArgument?.type === AST_NODE_TYPES.FunctionExpression) {
                const body = firstArgument.body;
                const statements = body.body;
                const returnStatement = statements.find((body) => body.type === AST_NODE_TYPES.ReturnStatement);
                const argument = returnStatement?.argument;
                if (argument?.type === AST_NODE_TYPES.ObjectExpression) {
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
                    return genericUtils.getStringFromTemplateLiteral(node) ?? '';
                default:
                    return '';
            }
        }

        return '';
    },

    getStylePropertyIdentifier(node: TSESTree.Property): string | undefined {
        if (node.key) {
            return stylesASTHelpers.getExpressionIdentifier(node.key);
        }
        return undefined;
    },

    // example: styles.text & styles['text'] & styles[`text`]
    getPotentialStyleReferenceFromMemberExpression(node: TSESTree.MemberExpression): string | undefined {
        if (node.parent.type === AST_NODE_TYPES.MemberExpression) return undefined;

        let objectName: string | undefined;
        if (node.object.type === AST_NODE_TYPES.Identifier) {
            objectName = node.object.name;
        }
        if (node.object.type === AST_NODE_TYPES.Literal) {
            objectName = node.object.value?.toString();
        }
        if (node.object.type === AST_NODE_TYPES.TemplateLiteral) {
            objectName = genericUtils.getStringFromTemplateLiteral(node.object);
        }

        let propertyName: string | undefined;
        if (node.property.type === AST_NODE_TYPES.Identifier) {
            propertyName = node.property.name;
        }
        if (node.property.type === AST_NODE_TYPES.Literal) {
            propertyName = node.property.value?.toString();
        }
        if (node.property.type === AST_NODE_TYPES.TemplateLiteral) {
            propertyName = genericUtils.getStringFromTemplateLiteral(node.property);
        }

        if (objectName && propertyName) {
            return `${objectName}.${propertyName}`;
        }
        return undefined;
    },

    // example: margin vs marginTop
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
