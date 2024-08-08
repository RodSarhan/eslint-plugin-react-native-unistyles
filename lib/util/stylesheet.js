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
StyleSheets.prototype.add = function (
  styleSheetName,
  occurrences,
  properties
) {
  if (!this.styleSheets[styleSheetName]) {
    this.styleSheets[styleSheetName] = {
      properties,
      occurrences: [...occurrences],
    };
  } else {
    this.styleSheets[styleSheetName].properties = [
      ...this.styleSheets[styleSheetName].properties,
      ...properties,
    ];
    this.styleSheets[styleSheetName].occurrences = [
      ...this.styleSheets[styleSheetName].occurrences,
      ...occurrences,
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
  const parentComponentName = nameSplit[0];
  const styleSheetNameFromStyle = nameSplit[1];
  const styleSheetPropertyFromStyle = nameSplit[2];

  const relatedStyleSheetEntry = Object.entries(this.styleSheets).find(
    (entry) => {
      const sheet = entry[1];
      const sheetOccurrences = sheet.occurrences;
      const matchingOccurence = sheetOccurrences.find(
        (occurrence) => occurrence.componentName === parentComponentName
          && occurrence.nameInComponent === styleSheetNameFromStyle
      );
      return matchingOccurence;
    }
  );

  if (relatedStyleSheetEntry) {
    const relatedStyleSheetkey = relatedStyleSheetEntry[0];
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

  // TODO check if the stylesheet is exported, and add "ignore-exported- sheets" setting
  // isStyleSheetExported: function (node) {
  //   return false;
  // },

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

  getParentComponentName: (node) => {
    if (!node.parent) {
      return undefined;
    }
    if (node.parent && node.parent.type === 'Program') {
      const componentNode = node;
      if (componentNode.type === 'VariableDeclaration') {
        return componentNode.declarations[0].id.name;
      }
      if (componentNode.type === 'FunctionDeclaration') {
        return componentNode.id.name;
      }
      if (componentNode.type === 'ExportNamedDeclaration' || componentNode.type === 'ExportDefaultDeclaration') {
        if (componentNode.declaration.type === 'FunctionDeclaration') {
          return componentNode.declaration.id.name;
        }
        if (componentNode.declaration.type === 'VariableDeclaration') {
          return componentNode.declaration.declarations[0].id.name;
        }
      }
      return undefined;
    }
    return astHelpers.getParentComponentName(node.parent);
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
      const parentComponentName = astHelpers.getParentComponentName(node);
      if (parentComponentName) {
        return [parentComponentName, node.object.name, node.property.name].join('.');
      }
    }
  },

  getStyleDeclarationsChunks: function (node) {
    const getChunks = (properties) => {
      const result = [];
      let chunk = [];
      for (let i = 0; i < properties.length; i += 1) {
        const property = properties[i];
        if (property.type === 'Property') {
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

    if (
      node
      && node.type === 'CallExpression'
      && node.arguments
      && node.arguments[0]
    ) {
      if (node.arguments[0].properties) {
        return getChunks(node.arguments[0].properties);
      }

      if (node.arguments[0].type === 'ArrowFunctionExpression') {
        if (node.arguments[0].body && node.arguments[0].body.properties) {
          return getChunks(node.arguments[0].body.properties);
        }

        if (node.arguments[0].body && node.arguments[0].body.body) {
          const bodies = node.arguments[0].body.body;
          const indexOfReturnStatement = bodies.findIndex(
            (body) => body.type === 'ReturnStatement'
          );
          if (
            indexOfReturnStatement !== -1
            && bodies[indexOfReturnStatement].argument
            && bodies[indexOfReturnStatement].argument.properties
          ) {
            return getChunks(bodies[indexOfReturnStatement].argument.properties);
          }
        }
      }

      if (node.arguments[0].type === 'FunctionExpression' && node.arguments[0].body && node.arguments[0].body.body) {
        const bodies = node.arguments[0].body.body;
        const indexOfReturnStatement = bodies.findIndex(
          (body) => body.type === 'ReturnStatement'
        );
        if (
          indexOfReturnStatement !== -1
          && bodies[indexOfReturnStatement].argument
          && bodies[indexOfReturnStatement].argument.properties
        ) {
          return getChunks(bodies[indexOfReturnStatement].argument.properties);
        }
      }
    }

    return [];
  },

  getPropertiesChunks: function (properties) {
    const result = [];
    let chunk = [];
    for (let i = 0; i < properties.length; i += 1) {
      const property = properties[i];
      if (property.type === 'Property') {
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

  getExpressionIdentifier: function (node) {
    if (node) {
      switch (node.type) {
        case 'Identifier':
          return node.name;
        case 'Literal':
          return node.value;
        case 'TemplateLiteral':
          return node.quasis.reduce(
            (result, quasi, index) => result
              + quasi.value.cooked
              + astHelpers.getExpressionIdentifier(node.expressions[index]),
            ''
          );
        default:
          return '';
      }
    }

    return '';
  },

  getStylePropertyIdentifier: function (node) {
    if (
      node
      && node.key
    ) {
      return astHelpers.getExpressionIdentifier(node.key);
    }
  },

  isEitherShortHand: function (property1, property2) {
    const shorthands = ['margin', 'padding', 'border', 'flex'];
    if (shorthands.includes(property1)) {
      return property2.startsWith(property1);
    } if (shorthands.includes(property2)) {
      return property1.startsWith(property2);
    }
    return false;
  },
};

module.exports.astHelpers = astHelpers;
module.exports.StyleSheets = StyleSheets;
