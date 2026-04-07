'use strict';

/**
 * Rule: no-createcomponent-in-render
 *
 * Detects `createComponent(...)` calls made inside a React function component
 * body, hook body, or class render method.
 *
 * Creating components inside a render cycle causes:
 *   - New component identity on every render → React forces unmount/remount
 *   - Loss of state, refs, and animations
 *   - Severe performance degradation
 *
 * Fix: move the createComponent call to module level (outside any function).
 */

/** Names that, when a function is named with them, signal a React component. */
function isComponentName(name) {
  if (!name) return false;
  return /^[A-Z]/.test(name);
}

/** Hook names start with `use` followed by an uppercase letter. */
function isHookName(name) {
  if (!name) return false;
  return /^use[A-Z]/.test(name);
}

/**
 * Walk up the ancestor chain to find the nearest enclosing function node.
 * Returns null if no enclosing function exists (i.e. call is at module level).
 */
function findNearestFunction(ancestors) {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      return { node, index: i };
    }
  }
  return null;
}

/**
 * Given a function node and its ancestors, determine the name the function
 * was assigned to (if any).
 *
 * Handles:
 *   - FunctionDeclaration: name is node.id.name
 *   - FunctionExpression / ArrowFunctionExpression assigned to variable:
 *       const Foo = () => { ... }  →  'Foo'
 *   - FunctionExpression as object method or class method:
 *       render() { ... }  →  'render'
 */
function getFunctionName(funcNode, ancestors, funcIndex) {
  // Named function declaration
  if (funcNode.type === 'FunctionDeclaration' && funcNode.id) {
    return funcNode.id.name;
  }

  // Look at the parent to determine the assigned name
  const parent = ancestors[funcIndex - 1];
  if (!parent) return null;

  // const Foo = () => {} or const Foo = function() {}
  if (parent.type === 'VariableDeclarator' && parent.id) {
    return parent.id.name || null;
  }

  // Foo = () => {} (assignment expression)
  if (
    parent.type === 'AssignmentExpression' &&
    parent.left &&
    parent.left.type === 'Identifier'
  ) {
    return parent.left.name;
  }

  // Property or method: { render() {} } or class render() {}
  if (parent.type === 'Property' || parent.type === 'MethodDefinition') {
    const keyNode = parent.key;
    if (keyNode && keyNode.type === 'Identifier') {
      return keyNode.name;
    }
  }

  return null;
}

/**
 * Returns true when the function is a React component (uppercase name),
 * a hook (useFoo name), or a class render method.
 */
function isReactComponentOrHookOrRender(funcNode, ancestors, funcIndex) {
  const name = getFunctionName(funcNode, ancestors, funcIndex);

  if (name) {
    if (isComponentName(name)) return true;
    if (isHookName(name)) return true;
    if (name === 'render') return true;
  }

  // Check if any outer class method is named render (for nested functions
  // inside render). Walk further up.
  for (let i = funcIndex - 1; i >= 0; i--) {
    const ancestor = ancestors[i];
    if (
      ancestor.type === 'MethodDefinition' &&
      ancestor.key &&
      ancestor.key.name === 'render'
    ) {
      return true;
    }
  }

  return false;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow createComponent() calls inside React component bodies, hooks, or render methods. ' +
        'Creating components inside the render cycle forces unmount/remount on every render, ' +
        'breaking state, refs, animations, and performance.',
      recommended: true,
      url: 'https://github.com/emb715/react-native-small-ui#critical-createcomponent-performance-pattern',
    },
    fixable: null, // Cannot auto-fix — requires moving code to module level
    hasSuggestions: true,
    schema: [
      {
        type: 'object',
        properties: {
          /**
           * Additional function names to treat as createComponent calls.
           * Useful if the developer aliased createComponent.
           * @example ["createStyledComponent", "styledView"]
           */
          additionalFunctionNames: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      noCreateComponentInRender:
        'createComponent() must be called at module level, not inside a {{kind}} body. ' +
        'Creating components inside render causes new component identity on every render, ' +
        'forcing React to unmount and remount instead of update. ' +
        'Move this call to module level. ' +
        'See: https://github.com/emb715/react-native-small-ui#critical-createcomponent-performance-pattern',
      suggestion:
        'Move createComponent() call to module level (outside this function).',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const additionalNames = options.additionalFunctionNames || [];
    const targetNames = new Set(['createComponent', ...additionalNames]);

    return {
      CallExpression(node) {
        // Check if this is a createComponent() call
        const callee = node.callee;
        let calleeName = null;

        if (callee.type === 'Identifier') {
          calleeName = callee.name;
        } else if (
          callee.type === 'MemberExpression' &&
          callee.property.type === 'Identifier'
        ) {
          // Handles SmallUI.createComponent(...) patterns
          calleeName = callee.property.name;
        }

        if (!calleeName || !targetNames.has(calleeName)) return;

        // Walk ancestors to find nearest enclosing function.
        // Use sourceCode.getAncestors() (ESLint v9+) with fallback to the
        // deprecated context.getAncestors() for ESLint v7/v8 compatibility.
        const sourceCode = context.getSourceCode?.() ?? context;
        const ancestors = (
          sourceCode.getAncestors ?? context.getAncestors
        ).call(sourceCode, node);
        const result = findNearestFunction(ancestors);

        if (!result) return; // At module level — fine

        const { node: funcNode, index: funcIndex } = result;

        if (isReactComponentOrHookOrRender(funcNode, ancestors, funcIndex)) {
          const functionName = getFunctionName(funcNode, ancestors, funcIndex);
          let kind = 'function component';
          if (functionName) {
            if (isHookName(functionName)) kind = 'hook';
            else if (functionName === 'render') kind = 'render method';
            else if (isComponentName(functionName)) kind = 'function component';
          }

          context.report({
            node,
            messageId: 'noCreateComponentInRender',
            data: { kind },
            suggest: [
              {
                messageId: 'suggestion',
                fix(fixer) {
                  // We can't automatically move the code, but we can add a
                  // TODO comment directly before the offending call to guide
                  // the developer.
                  return fixer.insertTextBefore(
                    node,
                    '/* TODO: move createComponent() to module level */ '
                  );
                },
              },
            ],
          });
        }
      },
    };
  },
};
