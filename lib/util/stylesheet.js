'use strict';

/**
 * StyleSheets represents the StyleSheets found in the source code.
 * @constructor
 */
function StyleSheets() {
  this.styleSheets = {};
}

/**
 * Add adds a StyleSheet to our StyleSheets collections.
 *
 * @param {string} styleSheetName - The name of the StyleSheet.
 * @param {object} properties - The collection of rules in the styleSheet.
 */
StyleSheets.prototype.add = function (styleSheetName, namesInComponents, properties) {
  if (!this.styleSheets[styleSheetName]) {
    this.styleSheets[styleSheetName] = { properties, namesInComponents: [...namesInComponents] };
  } else {
    this.styleSheets[styleSheetName].properties = [
      ...this.styleSheets[styleSheetName].properties,
      ...properties,
    ];
    this.styleSheets[styleSheetName].namesInComponents = [
      ...this.styleSheets[styleSheetName].namesInComponents,
      ...namesInComponents,
    ];
  }
};

/**
 * MarkAsUsed marks a rule as used in our source code by removing it from the
 * specified StyleSheet rules.
 *
 * @param {string} fullyQualifiedName - The fully qualified name of the rule.
 * for example 'styles.text'
 */
StyleSheets.prototype.markAsUsed = function (fullyQualifiedName) {
  const nameSplit = fullyQualifiedName.split('.');
  const styleSheetNameFromStyle = nameSplit[0];
  const styleSheetPropertyFromStyle = nameSplit[1];

  const [relatedStyleSheetkey] = Object.entries(this.styleSheets)
    .find((entry) => entry[1].namesInComponents
      && entry[1].namesInComponents.includes(styleSheetNameFromStyle));

  if (relatedStyleSheetkey) {
    const newProperties = this.styleSheets[relatedStyleSheetkey].properties.filter(
      (property) => property.key.name !== styleSheetPropertyFromStyle
    );
    this.styleSheets[relatedStyleSheetkey].properties = newProperties;
  }
};

/**
 * GetUnusedReferences returns all collected StyleSheets and their
 * unmarked rules.
 */
StyleSheets.prototype.getUnusedReferences = function () {
  const unusedReferences = {};
  Object.entries(this.styleSheets).forEach(([key, value]) => {
    if (value.properties.length > 0) {
      unusedReferences[key] = value;
    }
  });

  return unusedReferences;
};

// let currentContent;
// const getSourceCode = (node) => currentContent
//   .getSourceCode(node)
//   .getText(node);

// const getSomethingFromSettings =
// (settings) => settings['react-native-unistyles/something-setting'];

const astHelpers = {

  containsCreateStyleSheetCall: function (node) {
    return Boolean(
      node
      && node.type === 'CallExpression'
      && node.callee
      && node.callee.name === 'createStyleSheet'
    );
  },

  isStyleSheetDeclaration: function (node) {
    return Boolean(
      astHelpers.containsCreateStyleSheetCall(node)
    );
  },

  isUseStylesHook: function (node) {
    return Boolean(
      node
      && node.type === 'VariableDeclaration'
      && node.declarations
      && node.declarations[0]
      && node.declarations[0].init
      && node.declarations[0].init.callee
      && node.declarations[0].init.callee.name === 'useStyles'
    );
  },

  getDestructuredStyleSheetName: function (node) {
    if (
      node
      && node.declarations
      && node.declarations[0]
      && node.declarations[0].id
      && node.declarations[0].id.type === 'ObjectPattern'
    ) {
      const destructuringObject = node.declarations[0].id;
      const stylesObject = destructuringObject.properties.find((property) => property.key.name === 'styles');
      if (stylesObject && stylesObject.value.name) {
        return stylesObject.value.name;
      }
    }
  },

  getRelatedStyleSheetObjectName: function (node) {
    if (
      node
      && node.declarations
      && node.declarations[0]
      && node.declarations[0].init
      && node.declarations[0].init
      && node.declarations[0].init.arguments
      && node.declarations[0].init.arguments[0]
      && node.declarations[0].init.arguments[0].name
    ) {
      return node.declarations[0].init.arguments[0].name;
    }
  },

  getStyleSheetObjectName: function (node) {
    if (node && node.parent && node.parent.id) {
      return node.parent.id.name;
    }
  },

  getStyleDeclarations: function (node) {
    if (
      node
      && node.type === 'CallExpression'
      && node.arguments
      && node.arguments[0]
      && node.arguments[0].properties
    ) {
      return node.arguments[0].properties.filter((property) => property.type === 'Property');
    }

    if (
      node
      && node.type === 'CallExpression'
      && node.arguments
      && node.arguments[0]
      && node.arguments[0].type === 'ArrowFunctionExpression'
      && node.arguments[0].body
      && node.arguments[0].body.properties
    ) {
      return node.arguments[0].body.properties.filter((property) => property.type === 'Property');
    }

    if (
      node
      && node.type === 'CallExpression'
      && node.arguments
      && node.arguments[0]
      && node.arguments[0].type === 'ArrowFunctionExpression'
      && node.arguments[0].body
      && node.arguments[0].body.body
    ) {
      const bodies = node.arguments[0].body.body;
      const indexOfReturnStatement = bodies.findIndex((body) => body.type === 'ReturnStatement');
      if (
        indexOfReturnStatement !== -1
        && bodies[indexOfReturnStatement].argument
        && bodies[indexOfReturnStatement].argument.properties
      ) {
        return bodies[indexOfReturnStatement].argument.properties.filter((property) => property.type === 'Property');
      }
    }

    if (
      node
      && node.type === 'CallExpression'
      && node.arguments
      && node.arguments[0]
      && node.arguments[0].type === 'FunctionExpression'
      && node.arguments[0].body
      && node.arguments[0].body.body
    ) {
      const bodies = node.arguments[0].body.body;
      const indexOfReturnStatement = bodies.findIndex((body) => body.type === 'ReturnStatement');
      if (
        indexOfReturnStatement !== -1
        && bodies[indexOfReturnStatement].argument
        && bodies[indexOfReturnStatement].argument.properties
      ) {
        return bodies[indexOfReturnStatement].argument.properties.filter((property) => property.type === 'Property');
      }
    }

    return [];
  },

  getPotentialStyleReferenceFromMemberExpression: function (node) {
    if (
      node
      && node.object
      && node.object.type === 'Identifier'
      && node.object.name
      && node.property
      && node.property.type === 'Identifier'
      && node.property.name
      && node.parent.type !== 'MemberExpression'
    ) {
      return [node.object.name, node.property.name].join('.');
    }
  },
};

module.exports.astHelpers = astHelpers;
module.exports.StyleSheets = StyleSheets;
