import {AST_NODE_TYPES, type ESLintUtils, type TSESTree} from '@typescript-eslint/utils';
import type {RuleContext, SourceCode} from '@typescript-eslint/utils/ts-eslint';

class Components {
    private list: Record<string, {node: TSESTree.Node; confidence: number}> = {};

    /**
     * Get unique identifier for a node
     */
    getId(node: TSESTree.Node) {
        return node.range?.join(':');
    }

    /**
     * Add a node to the components list, or update it if it's already in the list
     * 0=banned, 1=maybe, 2=yes
     */
    add(node: TSESTree.Node, confidence: number) {
        const id = this.getId(node);
        if (!id) return;

        if (this.list[id]) {
            if (confidence === 0 || this.list[id].confidence === 0) {
                this.list[id].confidence = 0;
            } else {
                this.list[id].confidence = Math.max(this.list[id].confidence, confidence);
            }
            return;
        }
        this.list[id] = {node, confidence};
    }

    /**
     * Find a component in the list using its node
     */
    get(node: TSESTree.Node) {
        const id = this.getId(node);
        if (!id) return;
        return this.list[id];
    }

    /**
     * Update a component in the list
     */
    set(node: TSESTree.Node, props: Record<string, any>) {
        let currentNode: TSESTree.Node | undefined = node;
        while (currentNode) {
            const id = this.getId(currentNode);
            if (id && this.list[id]) {
                break;
            }
            currentNode = node.parent;
        }
        if (!currentNode) {
            return;
        }
        const id = this.getId(currentNode);
        if (!id) return;
        const existingItem = this.list[id];
        if (existingItem) {
            this.list[id] = {...existingItem, ...props};
        }
    }

    /**
     * Return the components list
     * Components for which we are not confident are not returned
     */
    all() {
        const list: Record<string, {node: TSESTree.Node; confidence: number}> = {};
        for (const entry of Object.entries(this.list)) {
            const [id, item] = entry;
            if (item.confidence >= 2) {
                list[id] = item;
            }
        }
        return list;
    }

    /**
     * Return the length of the components list
     * Components for which we are not confident are not counted
     */
    length() {
        return Object.values(this.list).filter((item) => item.confidence >= 2).length;
    }
}

const createUtils = <ContextType extends RuleContext<string, readonly unknown[]>>(
    context: ContextType,
    sourceCode: Readonly<SourceCode>,
) => {
    // Utilities for component detection
    const utils = {
        /**
         * Check if the node is a React ES5 component
         *
         * @param {TSESTree.Node} node The AST node being checked.
         * returns True if the node is a React ES5 component, false if not
         */
        isES5Component(node: TSESTree.Node) {
            if (node.parent?.type === AST_NODE_TYPES.CallExpression) {
                return /^(React\.)?createClass$/.test(sourceCode.getText(node.parent.callee));
            }
            return false;
        },

        /**
         * Check if the node is a React ES6 component
         *
         * @param {TSESTree.Node} node The AST node being checked.
         * returns True if the node is a React ES6 component, false if not
         */
        isES6Component(node: TSESTree.Node) {
            if (node.type === AST_NODE_TYPES.ClassDeclaration || node.type === AST_NODE_TYPES.ClassExpression) {
                const superClass = node.superClass;
                if (!superClass) return false;
                return /^(React\.)?(Pure)?Component$/.test(sourceCode.getText(superClass));
            }
            return false;
        },

        /**
         * Check if the return statement is returning JSX
         *
         * @param {TSESTree.Node} node The AST node being checked (must be a ReturnStatement).
         * returns True if the return statement is returning JSX, false if not
         */
        isJSXReturnStatement(node: TSESTree.ReturnStatement) {
            const returnsJSX =
                node.argument?.type === AST_NODE_TYPES.JSXElement || node.argument?.type === AST_NODE_TYPES.JSXFragment;

            const returnsReactCreateElement =
                node.argument?.type === AST_NODE_TYPES.CallExpression
                && node.argument.callee.type === AST_NODE_TYPES.MemberExpression
                && node.argument.callee.property.type === AST_NODE_TYPES.Identifier
                && node.argument.callee.property.name === 'createElement';

            return returnsJSX || returnsReactCreateElement;
        },

        /**
         * Check if the function is returning JSX
         *
         * @param {TSESTree.Node} node The AST node being checked (must be a ReturnStatement).
         * returns True if the function is returning JSX, false if not
         */
        isArrowFunctionReturningJSXDirectly(node: TSESTree.ArrowFunctionExpression) {
            if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
                const returnsJSX =
                    node.body?.type === AST_NODE_TYPES.JSXElement || node.body?.type === AST_NODE_TYPES.JSXFragment;

                const returnsReactCreateElement =
                    node.body?.type === AST_NODE_TYPES.CallExpression
                    && node.body.callee.type === AST_NODE_TYPES.MemberExpression
                    && node.body.callee.property.type === AST_NODE_TYPES.Identifier
                    && node.body.callee.property.name === 'createElement';

                return returnsJSX || returnsReactCreateElement;
            }
            return false;
        },

        /**
         * Get the parent component node from the current scope
         *
         * returns component node, null if we are not in a component
         */
        getParentComponent(_n: TSESTree.Node) {
            return (
                utils.getParentStatelessComponent(_n)
                || utils.getParentES6Component(_n)
                || utils.getParentES5Component(_n)
            );
        },

        /**
         * Get the parent ES5 component node from the current scope
         *
         * returns component node, null if we are not in a component
         */
        getParentES5Component(_n: TSESTree.Node) {
            let scope = (context.sourceCode || context).getScope(_n);
            while (scope) {
                const node = scope.block && scope.block.parent && scope.block.parent.parent;
                if (node && utils.isES5Component(node)) {
                    return node;
                }
                if (!scope.upper) {
                    return null;
                }
                scope = scope.upper;
            }
            return null;
        },

        /**
         * Get the parent ES6 component node from the current scope
         *
         * returns component node, null if we are not in a component
         */
        getParentES6Component(_n: TSESTree.Node) {
            let scope = (context.sourceCode || context).getScope(_n);
            while (scope && scope.type !== 'class') {
                if (!scope.upper) {
                    break;
                }
                scope = scope.upper;
            }
            const node = scope.block;
            if (!node || !utils.isES6Component(node)) {
                return null;
            }
            return node;
        },

        /**
         * Get the parent stateless component node from the current scope
         *
         * returns component node, null if we are not in a component
         */
        getParentStatelessComponent(_n: TSESTree.Node) {
            let scope = (context.sourceCode || context).getScope(_n);
            while (scope) {
                const node = scope.block;
                // Ignore non functions
                const isFunction =
                    node.type === AST_NODE_TYPES.FunctionDeclaration
                    || node.type === AST_NODE_TYPES.FunctionExpression
                    || node.type === AST_NODE_TYPES.ArrowFunctionExpression;

                // Ignore classes methods
                const parentIsNotMethod = !node.parent || node.parent.type !== 'MethodDefinition';
                if (isFunction && parentIsNotMethod) {
                    return node;
                }
                if (!scope.upper) {
                    return null;
                }
                scope = scope.upper;
            }
            return null;
        },
    };
    return utils;
};

type UtilsType = ReturnType<typeof createUtils>;

type PassedRuleType<ContextType extends RuleContext<string, readonly unknown[]>> = (
    context: ContextType,
    components: Components,
    utils: UtilsType,
) => ESLintUtils.RuleListener;

/**
 * This is a Higher-Order Function that enhances ESLint rules with React component detection
 *
 * What it does:
 * 1. Takes a rule factory function as input
 * 2. Returns a new function that creates enhanced ESLint rules
 */

export const enhanceRuleWithComponentDetection: <
    ContextType extends RuleContext<string, readonly unknown[]>,
    Options extends readonly unknown[],
>(
    rule: PassedRuleType<ContextType>,
) => (context: ContextType, optionsWithDefault: Options) => ESLintUtils.RuleListener = (rule) => {
    return (context, _node) => {
        const sourceCode = context.sourceCode;
        const components = new Components();

        const utils = createUtils(context, sourceCode);

        // Component detection instructions
        const detectionInstructions: ESLintUtils.RuleListener = {
            ClassDeclaration(node) {
                if (!utils.isES6Component(node)) {
                    return;
                }
                components.add(node, 2);
            },

            ClassProperty(node) {
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 2);
            },

            ObjectExpression(node) {
                if (!utils.isES5Component(node)) {
                    return;
                }
                components.add(node, 2);
            },

            // example: const MyComponent = wrapper(function() { return <JSX />; });
            // example 2: const MyComponent = wrapper(function named() { return <JSX />; });
            // confidence 1 because we can't be sure it's a component until we see a return statement
            // and return statements case is handled separately
            FunctionExpression(node) {
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 1);
            },

            // example: function MyComponent() { return <JSX />; }
            // confidence 1 because we can't be sure it's a component until we see a return statement
            // and return statements case is handled separately
            FunctionDeclaration(node) {
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 1);
            },

            // example: const MyComponent = wrapper(() => { return <JSX />; });
            // example 2: const MyComponent = wrapper(() => <JSX />);
            // No need to handle () => {return <JSX />} as it's covered by ReturnStatement
            // Hence the node.expression check
            ArrowFunctionExpression(node) {
                if (node.expression && utils.isArrowFunctionReturningJSXDirectly(node)) {
                    components.add(node, 2);
                }
                // Otherwise, we can't be sure it's a component until we see a return statement
                else {
                    components.add(node, 1);
                }
            },

            ThisExpression(node) {
                const parentNode = utils.getParentComponent(node);
                if (!parentNode || !/Function/.test(parentNode.type)) {
                    return;
                }
                // Ban functions with a ThisExpression
                components.add(parentNode, 0);
            },

            ReturnStatement(node) {
                if (!utils.isJSXReturnStatement(node)) {
                    return;
                }
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 2);
            },
        };

        // Update the provided rule instructions to add the component detection
        const ruleInstructions = rule(context, components, utils);
        const updatedRuleInstructions = {...ruleInstructions};
        Object.keys(detectionInstructions).forEach((instruction) => {
            updatedRuleInstructions[instruction] = (node) => {
                detectionInstructions[instruction]?.(node);
                return ruleInstructions[instruction]?.(node);
            };
        });
        // Return the updated rule instructions
        return updatedRuleInstructions;
    };
};

export default Components;
