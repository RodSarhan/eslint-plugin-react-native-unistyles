import type {TSESTree} from '@typescript-eslint/utils';
import type eslint from 'eslint';

type Node =
    | TSESTree.AccessorProperty
    | TSESTree.ArrayExpression
    | TSESTree.ArrayPattern
    | TSESTree.ArrowFunctionExpression
    | TSESTree.AssignmentExpression
    | TSESTree.AssignmentPattern
    | TSESTree.AwaitExpression
    | TSESTree.BinaryExpression
    | TSESTree.BlockStatement
    | TSESTree.BreakStatement
    | TSESTree.CallExpression
    | TSESTree.CatchClause
    | TSESTree.ChainExpression
    | TSESTree.ClassBody
    | TSESTree.ClassDeclaration
    | TSESTree.ClassExpression
    | TSESTree.ConditionalExpression
    | TSESTree.ContinueStatement
    | TSESTree.DebuggerStatement
    | TSESTree.Decorator
    | TSESTree.DoWhileStatement
    | TSESTree.EmptyStatement
    | TSESTree.ExportAllDeclaration
    | TSESTree.ExportDefaultDeclaration
    | TSESTree.ExportNamedDeclaration
    | TSESTree.ExportSpecifier
    | TSESTree.ExpressionStatement
    | TSESTree.ForInStatement
    | TSESTree.ForOfStatement
    | TSESTree.ForStatement
    | TSESTree.FunctionDeclaration
    | TSESTree.FunctionExpression
    | TSESTree.Identifier
    | TSESTree.IfStatement
    | TSESTree.ImportAttribute
    | TSESTree.ImportDeclaration
    | TSESTree.ImportDefaultSpecifier
    | TSESTree.ImportExpression
    | TSESTree.ImportNamespaceSpecifier
    | TSESTree.ImportSpecifier
    | TSESTree.JSXAttribute
    | TSESTree.JSXClosingElement
    | TSESTree.JSXClosingFragment
    | TSESTree.JSXElement
    | TSESTree.JSXEmptyExpression
    | TSESTree.JSXExpressionContainer
    | TSESTree.JSXFragment
    | TSESTree.JSXIdentifier
    | TSESTree.JSXMemberExpression
    | TSESTree.JSXNamespacedName
    | TSESTree.JSXOpeningElement
    | TSESTree.JSXOpeningFragment
    | TSESTree.JSXSpreadAttribute
    | TSESTree.JSXSpreadChild
    | TSESTree.JSXText
    | TSESTree.LabeledStatement
    | TSESTree.Literal
    | TSESTree.LogicalExpression
    | TSESTree.MemberExpression
    | TSESTree.MetaProperty
    | TSESTree.MethodDefinition
    | TSESTree.NewExpression
    | TSESTree.ObjectExpression
    | TSESTree.ObjectPattern
    | TSESTree.PrivateIdentifier
    | TSESTree.Program
    | TSESTree.Property
    | TSESTree.PropertyDefinition
    | TSESTree.RestElement
    | TSESTree.ReturnStatement
    | TSESTree.SequenceExpression
    | TSESTree.SpreadElement
    | TSESTree.StaticBlock
    | TSESTree.Super
    | TSESTree.SwitchCase
    | TSESTree.SwitchStatement
    | TSESTree.TaggedTemplateExpression
    | TSESTree.TemplateElement
    | TSESTree.TemplateLiteral
    | TSESTree.ThisExpression
    | TSESTree.ThrowStatement
    | TSESTree.TryStatement
    | TSESTree.TSAbstractAccessorProperty
    | TSESTree.TSAbstractKeyword
    | TSESTree.TSAbstractMethodDefinition
    | TSESTree.TSAbstractPropertyDefinition
    | TSESTree.TSAnyKeyword
    | TSESTree.TSArrayType
    | TSESTree.TSAsExpression
    | TSESTree.TSAsyncKeyword
    | TSESTree.TSBigIntKeyword
    | TSESTree.TSBooleanKeyword
    | TSESTree.TSCallSignatureDeclaration
    | TSESTree.TSClassImplements
    | TSESTree.TSConditionalType
    | TSESTree.TSConstructorType
    | TSESTree.TSConstructSignatureDeclaration
    | TSESTree.TSDeclareFunction
    | TSESTree.TSDeclareKeyword
    | TSESTree.TSEmptyBodyFunctionExpression
    | TSESTree.TSEnumBody
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSEnumMember
    | TSESTree.TSExportAssignment
    | TSESTree.TSExportKeyword
    | TSESTree.TSExternalModuleReference
    | TSESTree.TSFunctionType
    | TSESTree.TSImportEqualsDeclaration
    | TSESTree.TSImportType
    | TSESTree.TSIndexedAccessType
    | TSESTree.TSIndexSignature
    | TSESTree.TSInferType
    | TSESTree.TSInstantiationExpression
    | TSESTree.TSInterfaceBody
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSInterfaceHeritage
    | TSESTree.TSIntersectionType
    | TSESTree.TSIntrinsicKeyword
    | TSESTree.TSLiteralType
    | TSESTree.TSMappedType
    | TSESTree.TSMethodSignature
    | TSESTree.TSModuleBlock
    | TSESTree.TSModuleDeclaration
    | TSESTree.TSNamedTupleMember
    | TSESTree.TSNamespaceExportDeclaration
    | TSESTree.TSNeverKeyword
    | TSESTree.TSNonNullExpression
    | TSESTree.TSNullKeyword
    | TSESTree.TSNumberKeyword
    | TSESTree.TSObjectKeyword
    | TSESTree.TSOptionalType
    | TSESTree.TSParameterProperty
    | TSESTree.TSPrivateKeyword
    | TSESTree.TSPropertySignature
    | TSESTree.TSProtectedKeyword
    | TSESTree.TSPublicKeyword
    | TSESTree.TSQualifiedName
    | TSESTree.TSReadonlyKeyword
    | TSESTree.TSRestType
    | TSESTree.TSSatisfiesExpression
    | TSESTree.TSStaticKeyword
    | TSESTree.TSStringKeyword
    | TSESTree.TSSymbolKeyword
    | TSESTree.TSTemplateLiteralType
    | TSESTree.TSThisType
    | TSESTree.TSTupleType
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.TSTypeAnnotation
    | TSESTree.TSTypeAssertion
    | TSESTree.TSTypeLiteral
    | TSESTree.TSTypeOperator
    | TSESTree.TSTypeParameter
    | TSESTree.TSTypeParameterDeclaration
    | TSESTree.TSTypeParameterInstantiation
    | TSESTree.TSTypePredicate
    | TSESTree.TSTypeQuery
    | TSESTree.TSTypeReference
    | TSESTree.TSUndefinedKeyword
    | TSESTree.TSUnionType
    | TSESTree.TSUnknownKeyword
    | TSESTree.TSVoidKeyword
    | TSESTree.UnaryExpression
    | TSESTree.UpdateExpression
    | TSESTree.VariableDeclaration
    | TSESTree.VariableDeclarator
    | TSESTree.WhileStatement
    | TSESTree.WithStatement
    | TSESTree.YieldExpression;

/**
 * SuperNode - A manually created type that combines all discriminated union members
 * into a single object type with all possible properties from every TSESTree node type.
 * This gives you access to all properties that could exist on any AST node.
 * (AI generated)
 */
type SuperNode = {
    // Common properties that exist on all nodes
    type: string;
    range?: [number, number];
    loc?: TSESTree.SourceLocation;
    parent?: SuperNode;

    // Properties from various node types - all optional since not every node has every property
    // Identifiers and literals
    name?: string;
    value?: any;
    raw?: string;
    regex?: {pattern: string; flags: string};
    bigint?: string;

    // Expressions and statements
    expression?: SuperNode;
    body?: SuperNode | SuperNode[];
    declarations?: SuperNode[];
    id?: SuperNode;
    params?: SuperNode[];
    defaults?: SuperNode[];
    rest?: SuperNode;
    generator?: boolean;
    async?: boolean;
    returnType?: SuperNode;

    // Binary and logical expressions
    left?: SuperNode;
    right?: SuperNode;
    operator?: string;

    // Member expressions
    object?: SuperNode;
    property?: SuperNode;
    computed?: boolean;
    optional?: boolean;

    // Call expressions
    callee?: SuperNode;
    arguments?: SuperNode[];
    typeParameters?: SuperNode;

    // Assignment expressions
    assignmentOperator?: string;

    // Update expressions
    argument?: SuperNode;
    prefix?: boolean;

    // Conditional expressions
    test?: SuperNode;
    consequent?: SuperNode;
    alternate?: SuperNode;

    // Array and object patterns/expressions
    elements?: (SuperNode | null)[];
    properties?: SuperNode[];

    // Object properties
    key?: SuperNode;
    method?: boolean;
    shorthand?: boolean;
    kind?: 'init' | 'get' | 'set' | 'method' | 'constructor';

    // Function expressions
    init?: SuperNode;

    // Class declarations
    superClass?: SuperNode;
    implements?: SuperNode[];
    decorators?: SuperNode[];

    // Class methods and properties
    static?: boolean;
    abstract?: boolean;
    accessibility?: 'public' | 'private' | 'protected';
    readonly?: boolean;
    declare?: boolean;
    definite?: boolean;
    override?: boolean;

    // Import/Export declarations
    source?: SuperNode;
    specifiers?: SuperNode[];
    declaration?: SuperNode;
    exported?: SuperNode;
    local?: SuperNode;
    imported?: SuperNode;

    // JSX specific properties
    openingElement?: SuperNode;
    closingElement?: SuperNode;
    children?: SuperNode[];
    attributes?: SuperNode[];
    selfClosing?: boolean;
    namespace?: SuperNode;

    // Template literals
    quasis?: SuperNode[];
    expressions?: SuperNode[];

    // Try/catch statements
    block?: SuperNode;
    handler?: SuperNode;
    finalizer?: SuperNode;
    param?: SuperNode;

    // Switch statements
    discriminant?: SuperNode;
    cases?: SuperNode[];

    // Switch cases
    label?: SuperNode;

    // Loops
    update?: SuperNode;

    // Labels
    labelName?: SuperNode;

    // TypeScript specific properties
    typeAnnotation?: SuperNode;
    typeArguments?: SuperNode;
    constraint?: SuperNode;
    default?: SuperNode;

    // Module declarations
    global?: boolean;

    // Enum declarations
    const?: boolean;
    members?: SuperNode[];

    // Interface declarations
    heritage?: SuperNode[];

    // Type aliases and references
    typeName?: SuperNode;

    // Mapped types
    nameType?: SuperNode;

    // Conditional types
    checkType?: SuperNode;
    extendsType?: SuperNode;
    trueType?: SuperNode;
    falseType?: SuperNode;

    // Index signatures
    parameters?: SuperNode[];

    // Template literal types
    types?: SuperNode[];

    // Tuple types
    elementTypes?: SuperNode[];

    // Any other properties that might exist on specific node types
    [key: string]: any;
};

declare global {
    interface ASTNode extends TSESTree.Node {
        [_: string]: any; // TODO: fixme
    }
    type SuperNode = SuperNode;
    type Scope = eslint.Scope.Scope;
    type Token = eslint.AST.Token;
    type Fixer = eslint.Rule.RuleFixer;
    type JSXAttribute = ASTNode;
    type JSXElement = ASTNode;
    type JSXFragment = ASTNode;
    type JSXOpeningElement = ASTNode;
    type JSXSpreadAttribute = ASTNode;

    type Context = eslint.Rule.RuleContext;

    type TypeDeclarationBuilder = (annotation: ASTNode, parentName: string, seen: Set<typeof annotation>) => object;

    type TypeDeclarationBuilders = {[k in string]: TypeDeclarationBuilder};

    type UnionTypeDefinition = {type: 'union' | 'shape'; children: unknown[]};
}
