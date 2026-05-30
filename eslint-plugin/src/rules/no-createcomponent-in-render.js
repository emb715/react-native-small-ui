'use strict';

/**
 * Rule: no-createcomponent-in-render
 *
 * Detects react-native-small-ui component factory calls made inside a React
 * function component body, hook body, or class render method.
 *
 * Detected patterns (all cause new component identity on every render):
 *
 *   Factory functions (bare calls):
 *     createComponent(...)          — core factory
 *     createComponentGroup(...)     — group factory (returns multiple components)
 *     createThemedComponent(...)    — themed factory
 *
 *   Chained methods (MemberExpression calls):
 *     SomeComponent.extend(...)     — creates a new derived component
 *
 * All of the above create new component type identities when called inside
 * render. React cannot reconcile these — it forces unmount + remount on every
 * parent render, breaking state, refs, animations, and performance.
 *
 * Fix: move all calls to module level (outside any function).
 */

// ---------------------------------------------------------------------------
// Default target sets
// ---------------------------------------------------------------------------

/**
 * Bare function names that are always treated as component factories.
 * Extend via the `additionalFunctionNames` rule option.
 */
const DEFAULT_FACTORY_NAMES = new Set([
  'createComponent',
  'createComponentGroup',
  'createThemedComponent',
]);

/**
 * Method names on a MemberExpression receiver that are treated as component
 * factories when called inside a component/hook/render body.
 * Extend via the `additionalMethodNames` rule option.
 *
 * Note: `extend` is deliberately flagged even on arbitrary receiver objects
 * because calling `.extend()` inside a component body has no valid use case
 * in a react-native-small-ui codebase. False positives can be suppressed
 * with eslint-disable-next-line if genuinely needed.
 */
const DEFAULT_METHOD_NAMES = new Set(['extend']);

// ---------------------------------------------------------------------------
// AST helpers
// ---------------------------------------------------------------------------

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
 * Returns { node, index } or null if at module level.
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
 * Given a function node and its position in the ancestor chain, determine
 * the name the function was assigned to (if any).
 *
 * Handles:
 *   - FunctionDeclaration:          function Foo() {}  →  'Foo'
 *   - Arrow / FunctionExpression assigned to variable:
 *       const Foo = () => {}        →  'Foo'
 *   - Arrow / FunctionExpression via assignment:
 *       Foo = () => {}              →  'Foo'
 *   - Object property / class method:
 *       { render() {} }             →  'render'
 *       class X { render() {} }     →  'render'
 */
function getFunctionName(funcNode, ancestors, funcIndex) {
  // Named function declaration
  if (funcNode.type === 'FunctionDeclaration' && funcNode.id) {
    return funcNode.id.name;
  }

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

  // { render() {} }  or  class MyClass { render() {} }
  if (parent.type === 'Property' || parent.type === 'MethodDefinition') {
    const keyNode = parent.key;
    if (keyNode && keyNode.type === 'Identifier') {
      return keyNode.name;
    }
  }

  return null;
}

/**
 * Returns true when the function is a React component (PascalCase name),
 * a hook (useFoo name), or a class render method.
 *
 * Also walks further up to catch nested functions inside a render method.
 */
function isReactComponentOrHookOrRender(funcNode, ancestors, funcIndex) {
  const name = getFunctionName(funcNode, ancestors, funcIndex);

  if (name) {
    if (isComponentName(name)) return true;
    if (isHookName(name)) return true;
    if (name === 'render') return true;
  }

  // Walk further up to catch nested functions inside a class render method.
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

/**
 * Determine the human-readable "kind" label for the enclosing function,
 * used in error messages.
 */
function getKindLabel(funcNode, ancestors, funcIndex) {
  const name = getFunctionName(funcNode, ancestors, funcIndex);
  if (!name) return 'function component';
  if (isHookName(name)) return 'hook';
  if (name === 'render') return 'render method';
  return 'function component';
}

// ---------------------------------------------------------------------------
// Rule definition
// ---------------------------------------------------------------------------

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow react-native-small-ui component factory calls (createComponent, ' +
        'createComponentGroup, createThemedComponent, .extend()) inside React ' +
        'component bodies, hooks, or render methods. These calls create new component ' +
        'identities on every render, forcing React to unmount/remount instead of update, ' +
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
           * Additional bare function names to treat as component factories.
           * Useful if you aliased createComponent or createComponentGroup.
           * @example ["createStyledComponent", "myFactory"]
           */
          additionalFunctionNames: {
            type: 'array',
            items: { type: 'string' },
            uniqueItems: true,
            default: [],
          },
          /**
           * Additional method names (on a MemberExpression receiver) to treat
           * as component factories. Defaults cover `.extend()`.
           * @example ["customExtend", "withBase"]
           */
          additionalMethodNames: {
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
      noFactoryInRender:
        '{{callee}}() must be called at module level, not inside a {{kind}} body. ' +
        'Each call creates a new component identity — React cannot reconcile it ' +
        'and forces unmount/remount on every render, breaking state, refs, ' +
        'animations, and performance. Move this call to module level. ' +
        'See: https://github.com/emb715/react-native-small-ui#critical-createcomponent-performance-pattern',
      noExtendInRender:
        '.extend() must be called at module level, not inside a {{kind}} body. ' +
        'Each call creates a new derived component identity — React cannot reconcile ' +
        'it and forces unmount/remount on every render. Move this call to module level. ' +
        'See: https://github.com/emb715/react-native-small-ui#critical-createcomponent-performance-pattern',
      noMethodInRender:
        '.{{method}}() must be called at module level, not inside a {{kind}} body. ' +
        'Each call creates a new component identity — React cannot reconcile it ' +
        'and forces unmount/remount on every render. Move this call to module level. ' +
        'See: https://github.com/emb715/react-native-small-ui#critical-createcomponent-performance-pattern',
      suggestionFactory:
        'Move {{callee}}() call to module level (outside this function).',
      suggestionMethod:
        'Move .{{method}}() call to module level (outside this function).',
    },
  },

  create(context) {
    const options = context.options[0] || {};

    // Build effective target sets by merging defaults with user-configured extras.
    const factoryNames = new Set([
      ...DEFAULT_FACTORY_NAMES,
      ...(options.additionalFunctionNames || []),
    ]);
    const methodNames = new Set([
      ...DEFAULT_METHOD_NAMES,
      ...(options.additionalMethodNames || []),
    ]);

    /**
     * Shared check: given a CallExpression node, determine whether it's
     * a flagged call inside a component/hook/render body and report if so.
     *
     * @param {object} callNode  - The CallExpression AST node
     * @param {string|null} detectedName - The bare function name (factory path)
     * @param {string|null} detectedMethod - The method name (chained path)
     */
    function checkCall(callNode, detectedName, detectedMethod) {
      // Use sourceCode.getAncestors() (ESLint v9+) with fallback to the
      // deprecated context.getAncestors() for ESLint v7/v8 compatibility.
      const sourceCode = context.getSourceCode?.() ?? context;
      const ancestors = (sourceCode.getAncestors ?? context.getAncestors).call(
        sourceCode,
        callNode
      );

      const result = findNearestFunction(ancestors);
      if (!result) return; // Module level — fine

      const { node: funcNode, index: funcIndex } = result;
      if (!isReactComponentOrHookOrRender(funcNode, ancestors, funcIndex))
        return;

      const kind = getKindLabel(funcNode, ancestors, funcIndex);

      if (detectedName) {
        // Factory function path: createComponent(...), createComponentGroup(...), etc.
        context.report({
          node: callNode,
          messageId: 'noFactoryInRender',
          data: { callee: detectedName, kind },
          suggest: [
            {
              messageId: 'suggestionFactory',
              data: { callee: detectedName },
              fix(fixer) {
                return fixer.insertTextBefore(
                  callNode,
                  `/* TODO: move ${detectedName}() to module level */ `
                );
              },
            },
          ],
        });
      } else if (detectedMethod === 'extend') {
        // .extend() gets its own focused message (most common chained method).
        context.report({
          node: callNode,
          messageId: 'noExtendInRender',
          data: { kind },
          suggest: [
            {
              messageId: 'suggestionMethod',
              data: { method: 'extend' },
              fix(fixer) {
                return fixer.insertTextBefore(
                  callNode,
                  '/* TODO: move .extend() to module level */ '
                );
              },
            },
          ],
        });
      } else {
        // Other flagged method names (via additionalMethodNames).
        context.report({
          node: callNode,
          messageId: 'noMethodInRender',
          data: { method: detectedMethod, kind },
          suggest: [
            {
              messageId: 'suggestionMethod',
              data: { method: detectedMethod },
              fix(fixer) {
                return fixer.insertTextBefore(
                  callNode,
                  `/* TODO: move .${detectedMethod}() to module level */ `
                );
              },
            },
          ],
        });
      }
    }

    return {
      CallExpression(node) {
        const callee = node.callee;

        // ── Path 1: Bare identifier call — createComponent(...), etc.
        if (callee.type === 'Identifier') {
          if (factoryNames.has(callee.name)) {
            checkCall(node, callee.name, null);
          }
          return;
        }

        // ── Path 2: MemberExpression call — foo.extend(...), SmallUI.createComponent(...), etc.
        if (
          callee.type === 'MemberExpression' &&
          !callee.computed && // skip foo[bar]() patterns
          callee.property.type === 'Identifier'
        ) {
          const methodName = callee.property.name;

          // Check if the method is a factory name (SmallUI.createComponent, etc.)
          if (factoryNames.has(methodName)) {
            checkCall(node, methodName, null);
            return;
          }

          // Check if the method is a flagged chained method (.extend(), etc.)
          if (methodNames.has(methodName)) {
            checkCall(node, null, methodName);
          }
        }
      },
    };
  },
};
