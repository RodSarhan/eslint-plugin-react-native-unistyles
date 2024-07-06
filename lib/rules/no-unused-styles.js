/**
 * @fileoverview Detects unused styles
 */

'use strict';

const Components = require('../util/Components');
const styleSheet = require('../util/stylesheet');

const { StyleSheets } = styleSheet;
const { astHelpers } = styleSheet;

const create = Components.detect((context, components) => {
  const styleSheets = new StyleSheets();
  const styleReferences = new Set();

  function reportUnusedStyles(styleSheetsWithUnusedStyles) {
    Object.entries(styleSheetsWithUnusedStyles).forEach(([key, value]) => {
      const unusedStyles = value.properties;
      unusedStyles.forEach((node) => {
        const message = [
          'Unused style detected: ',
          key,
          '.',
          node.key.name,
        ].join('');

        context.report(node, message);
      });
    });
  }

  return {
    VariableDeclaration: function (node) {
      if (astHelpers.isUseStylesHook(node)) {
        const destructuredStyleSheetName = astHelpers.getDestructuredStyleSheetName(node);
        const relatedStyleSheetObjectName = astHelpers.getRelatedStyleSheetObjectName(node);

        styleSheets.add(relatedStyleSheetObjectName, [destructuredStyleSheetName], []);
      }
    },

    MemberExpression: function (node) {
      const styleRef = astHelpers.getPotentialStyleReferenceFromMemberExpression(node);
      if (styleRef) {
        styleReferences.add(styleRef);
      }
    },

    CallExpression: function (node) {
      if (astHelpers.isStyleSheetDeclaration(node, context.settings)) {
        const styleSheetObjectName = astHelpers.getStyleSheetObjectName(node);
        const styles = astHelpers.getStyleDeclarations(node);

        styleSheets.add(styleSheetObjectName, [], styles);
      }
    },

    'Program:exit': function () {
      const list = components.all();
      if (Object.keys(list).length > 0) {
        styleReferences.forEach((reference) => {
          styleSheets.markAsUsed(reference);
        });
        reportUnusedStyles(styleSheets.getUnusedReferences());
      }
    },
  };
});

module.exports = {
  meta: {
    schema: [],
  },
  create,
};
