import type {ESLintUtils, TSESTree} from '@typescript-eslint/utils';
import type {RuleContext, SourceCode} from '@typescript-eslint/utils/ts-eslint';

type Node = SuperNode;

class Components {
    private list: Record<string, {node: Node; confidence: number}> = {};

    /**
     * Get unique identifier for a node
     */
    getId(node: Node): string | undefined {
        return node && node.range?.join(':');
    }

    /**
     * Add a node to the components list, or update it if it's already in the list
     * 0=banned, 1=maybe, 2=yes
     */
    add(node: Node, confidence: number): void {
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
    get(node: Node): {node: Node; confidence: number} | undefined {
        const id = this.getId(node);
        if (!id) return;
        return this.list[id];
    }

    /**
     * Update a component in the list
     */
    set(node: Node, props: Record<string, any>): void {
        let currentNode: Node | undefined = node;
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
    all(): Record<string, {node: Node; confidence: number}> {
        const list: Record<string, {node: Node; confidence: number}> = {};
        Object.keys(this.list).forEach((i) => {
            const item = this.list[i];
            if (item && item.confidence >= 2) {
                list[i] = item;
            }
        });
        return list;
    }

    /**
     * Return the length of the components list
     * Components for which we are not confident are not counted
     */
    length(): number {
        let length = 0;
        Object.keys(this.list).forEach((i) => {
            const item = this.list[i];
            if (item && item.confidence >= 2) {
                length += 1;
            }
        });
        return length;
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
         * @param {Node} node The AST node being checked.
         * @returns {Boolean} True if the node is a React ES5 component, false if not
         */
        isES5Component(node: Node): boolean {
            if (!node.parent) {
                return false;
            }
            return /^(React\.)?createClass$/.test(sourceCode.getText(node.parent.callee as TSESTree.Node));
        },

        /**
         * Check if the node is a React ES6 component
         *
         * @param {Node} node The AST node being checked.
         * @returns {Boolean} True if the node is a React ES6 component, false if not
         */
        isES6Component(node: Node): boolean {
            if (!node.superClass) {
                return false;
            }
            return /^(React\.)?(Pure)?Component$/.test(sourceCode.getText(node.superClass as TSESTree.Node));
        },

        /**
         * Check if the node is returning JSX
         *
         * @param {Node} node The AST node being checked (must be a ReturnStatement).
         * @returns {Boolean} True if the node is returning JSX, false if not
         */
        isReturningJSX(node: Node): boolean {
            let property;
            switch (node.type) {
                case 'ReturnStatement':
                    property = 'argument';
                    break;
                case 'ArrowFunctionExpression':
                    property = 'body';
                    break;
                default:
                    return false;
            }

            const returnsJSX =
                node[property] && (node[property].type === 'JSXElement' || node[property].type === 'JSXFragment');
            const returnsReactCreateElement =
                node[property]
                && node[property].callee
                && node[property].callee.property
                && node[property].callee.property.name === 'createElement';
            return Boolean(returnsJSX || returnsReactCreateElement);
        },

        /**
         * Get the parent component node from the current scope
         *
         * @returns {Node | null} component node, null if we are not in a component
         */
        getParentComponent(_n: Node): Node | null {
            return (
                utils.getParentES6Component(_n)
                || utils.getParentES5Component(_n)
                || utils.getParentStatelessComponent(_n)
            );
        },

        /**
         * Get the parent ES5 component node from the current scope
         *
         * @returns {Node | null} component node, null if we are not in a component
         */
        getParentES5Component(_n: Node): Node | null {
            let scope = (context.sourceCode || context).getScope(_n as TSESTree.Node);
            while (scope) {
                const node = (scope.block && scope.block.parent && scope.block.parent.parent) as Node | undefined;
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
         * @returns {Node | null} component node, null if we are not in a component
         */
        getParentES6Component(_n: Node): Node | null {
            let scope = (context.sourceCode || context).getScope(_n as TSESTree.Node);
            while (scope && scope.type !== 'class') {
                if (!scope.upper) {
                    break;
                }
                scope = scope.upper;
            }
            const node = scope.block as Node;
            if (!node || !utils.isES6Component(node)) {
                return null;
            }
            return node;
        },

        /**
         * Get the parent stateless component node from the current scope
         *
         * @returns {Node | null} component node, null if we are not in a component
         */
        getParentStatelessComponent(_n: Node): Node | null {
            let scope = (context.sourceCode || context).getScope(_n as TSESTree.Node);
            while (scope) {
                const node = scope.block as Node;
                // Ignore non functions
                const isFunction = /Function/.test(node.type);
                // Ignore classes methods
                const isNotMethod = !node.parent || node.parent.type !== 'MethodDefinition';
                // Ignore arguments (callback, etc.)
                const isNotArgument = !node.parent || node.parent.type !== 'CallExpression';
                if (isFunction && isNotMethod && isNotArgument) {
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
 * Static method for component detection
 * This is a Higher-Order Function that enhances ESLint rules with React component detection
 *
 * What it does:
 * 1. Takes a rule factory function as input
 * 2. Returns a new function that creates enhanced ESLint rules
 * 3. The enhanced rules automatically detect React components in the AST
 * 4. Provides the original rule with component tracking capabilities
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
            ClassDeclaration(_node) {
                const node = _node as Node;
                if (!utils.isES6Component(node)) {
                    return;
                }
                components.add(node, 2);
            },

            ClassProperty(_node) {
                const node = _node as Node;
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 2);
            },

            ObjectExpression(_node) {
                const node = _node as Node;
                if (!utils.isES5Component(node)) {
                    return;
                }
                components.add(node, 2);
            },

            FunctionExpression(_node) {
                const node = _node as unknown as Node;
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 1);
            },

            FunctionDeclaration(_node) {
                const node = _node as unknown as Node;
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                components.add(parentNode, 1);
            },

            ArrowFunctionExpression(_node) {
                const node = _node as unknown as Node;
                const parentNode = utils.getParentComponent(node);
                if (!parentNode) {
                    return;
                }
                if (parentNode.expression && utils.isReturningJSX(parentNode)) {
                    components.add(parentNode, 2);
                } else {
                    components.add(parentNode, 1);
                }
            },

            ThisExpression(_node) {
                const node = _node as Node;
                const parentNode = utils.getParentComponent(node);
                if (!parentNode || !/Function/.test(parentNode.type)) {
                    return;
                }
                // Ban functions with a ThisExpression
                components.add(parentNode, 0);
            },

            ReturnStatement(_node) {
                const node = _node as Node;
                if (!utils.isReturningJSX(node)) {
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
