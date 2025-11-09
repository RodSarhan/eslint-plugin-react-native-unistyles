import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/utils';

function isEveryExpressionLiteral(expressions: TSESTree.Expression[]): boolean {
    return expressions.every((expr) => {
        if (expr.type === AST_NODE_TYPES.Literal) {
            return true;
        }
        if (expr.type === AST_NODE_TYPES.TemplateLiteral) {
            const areAllExpressionsLiterals = isEveryExpressionLiteral(expr.expressions);
            return areAllExpressionsLiterals;
        }
        return false;
    });
}

export const genericUtils = {
    getStringFromTemplateLiteral(node: TSESTree.TemplateLiteral): string | undefined {
        const expressions = node.expressions;
        const areAllExpressionsLiterals = isEveryExpressionLiteral(expressions);

        if (!areAllExpressionsLiterals) return undefined;

        const finalString = node.quasis.reduce((result, quasi, index) => {
            const expr = node.expressions[index];
            let exprValue: string | undefined;
            if (expr?.type === AST_NODE_TYPES.Literal) {
                exprValue = expr.value?.toString();
            }
            if (expr?.type === AST_NODE_TYPES.TemplateLiteral) {
                const templateResult = genericUtils.getStringFromTemplateLiteral(expr);
                exprValue = templateResult;
            }

            return result + quasi.value.cooked + (exprValue ?? '');
        }, '');

        return finalString;
    },
};
