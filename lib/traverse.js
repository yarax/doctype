var grabComments = require('./comments');

var functinable = ['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression'];

/**
 * Traverses the current scope and collects declarations
 * @param {Object} node
 * @param {Object} scope <scope>
 * @returns {Object} scope
 */
function traverseScope(node, scope) {
  scope = grabComments(node, scope);

  if (functinable.indexOf(node.type) !== -1) {
    scope.functionNode = node.body;
  }

  if (node.type === 'MemberExpression' && node.property) {
    if (node.computed) {
      scope.props.push({computed: true, name: node.property.name});
    } else {
      scope.props.push(node.property.name);
    }
  }
  if (node.parent) {
    return traverseScope(node.parent, scope);
  }
  return scope;
}

module.exports = traverseScope;