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
StyleSheets.prototype.add = function (styleSheetName, properties) {
  this.styleSheets[styleSheetName] = properties;
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
  const styleSheetName = nameSplit[0];
  const styleSheetProperty = nameSplit[1];

  if (this.styleSheets[styleSheetName]) {
    this.styleSheets[styleSheetName] = this
      .styleSheets[styleSheetName]
      .filter((property) => property.key.name !== styleSheetProperty);
  }
};

/**
 * GetUnusedReferences returns all collected StyleSheets and their
 * unmarked rules.
 */
StyleSheets.prototype.getUnusedReferences = function () {
  return this.styleSheets;
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
  // TODO
  // containsUseStylesCall: function (node) {
  //   return Boolean(
  //     node
  //     && node.type === 'CallExpression'
  //     && node.callee
  //     && node.callee.name === 'useStyles'
  //   );
  // },

  // isStylesVariableDeclaration: function (node) {
  //   return Boolean(
  //     astHelpers.containsUseStylesCall(node)
  //   );
  // },

  getStyleSheetName: function () {
    // if (node && node.parent && node.parent.id) {
    //   return node.parent.id.name;
    // }
    return 'styles';
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
