'use strict';

const { RuleTester } = require('eslint');
const rule = require('../src/rules/no-createcomponent-in-render');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
});

ruleTester.run('no-createcomponent-in-render', rule, {
  // =========================================================================
  // VALID — must NOT trigger the rule
  // =========================================================================
  valid: [
    // ── Module-level patterns (all correct) ──────────────────────────────────

    {
      name: 'createComponent at module level — canonical correct pattern',
      code: `
        import { createComponent } from 'react-native-small-ui';
        import { View } from 'react-native';

        const Box = createComponent(View, { padding: 16 });

        function MyComponent() {
          return <Box />;
        }
      `,
    },

    {
      name: 'createComponentGroup at module level',
      code: `
        const { Label, Input } = createComponentGroup({
          Label: { Component: Text, style: { fontSize: 14 } },
          Input: { Component: TextInput, style: { borderWidth: 1 } },
        });

        function MyForm() {
          return <Label>Name</Label>;
        }
      `,
    },

    {
      name: '.extend() at module level',
      code: `
        const Base = createComponent(View, { padding: 8 });
        const Card = Base.extend({ borderRadius: 8 });

        function MyComponent() {
          return <Card />;
        }
      `,
    },

    {
      name: 'multiple factories and .extend() all at module level',
      code: `
        const Box = createComponent(View, { padding: 8 });
        const Card = Box.extend({ borderRadius: 4 });
        const { Row, Col } = createComponentGroup({
          Row: { Component: View, style: { flexDirection: 'row' } },
          Col: { Component: View, style: { flexDirection: 'column' } },
        });
      `,
    },

    // ── Non-component functions (lowercase names) ────────────────────────────

    {
      name: 'createComponent inside a regular lowercase function — allowed',
      code: `
        function buildComponents() {
          const Box = createComponent(View, { padding: 16 });
          return Box;
        }
      `,
    },

    {
      name: '.extend() inside a regular lowercase function — allowed',
      code: `
        function buildExtended(Base) {
          return Base.extend({ margin: 8 });
        }
      `,
    },

    {
      name: 'createComponentGroup inside a lowercase factory function — allowed',
      code: `
        function makeFormComponents(theme) {
          return createComponentGroup({
            Input: { Component: TextInput, style: { borderColor: theme.border } },
          });
        }
      `,
    },

    // ── Object methods / Arrow functions assigned to lowercase ────────────────

    {
      name: 'inside an object method NOT named render — allowed',
      code: `
        const api = {
          setup() {
            return createComponent(View, { padding: 8 });
          },
        };
      `,
    },

    {
      name: 'arrow function assigned to lowercase variable — allowed',
      code: `
        const factory = () => createComponent(View, { padding: 8 });
      `,
    },

    {
      name: '.extend() on arrow function assigned to lowercase — allowed',
      code: `
        const makeCard = (Base) => Base.extend({ borderRadius: 4 });
      `,
    },

    // ── IIFE ──────────────────────────────────────────────────────────────────

    {
      name: 'inside IIFE at module level — allowed',
      code: `
        const Box = (() => createComponent(View, {}))();
      `,
    },

    // ── Unrelated calls (must not be flagged) ────────────────────────────────

    {
      name: 'member expression with unrelated method name — ignored',
      code: `
        function MyComponent() {
          const x = SomeLib.buildComponent(View, { padding: 16 });
          return null;
        }
      `,
    },

    {
      name: '.extend() on an unrelated method name not in additionalMethodNames — ignored',
      // 'pipe' is not in the default or additional method name sets
      code: `
        function MyComponent() {
          const x = someObservable.pipe(map(v => v));
          return null;
        }
      `,
    },

    // ── Anonymous arrows inside hooks (documented limitation) ─────────────────

    {
      name: 'createComponent inside anonymous arrow inside useCallback — not detected',
      // Nearest enclosing named function of the call is the anonymous arrow
      // assigned to lowercase 'handler' → not flagged (documented limitation).
      code: `
        function MyComponent() {
          const handler = React.useCallback(() => {
            const Box = createComponent(View, { padding: 8 });
            return Box;
          }, []);
          return null;
        }
      `,
    },

    {
      name: '.extend() inside anonymous arrow inside useCallback — not detected',
      code: `
        function MyComponent() {
          const get = React.useCallback(() => {
            return Base.extend({ margin: 4 });
          }, []);
          return null;
        }
      `,
    },

    // ── additionalFunctionNames option ────────────────────────────────────────

    {
      name: 'custom factory name not in additionalFunctionNames — ignored',
      code: `
        function MyComponent() {
          const Box = myFactory(View, { padding: 8 });
          return null;
        }
      `,
      options: [{ additionalFunctionNames: ['otherFactory'] }],
    },

    // ── additionalMethodNames option ──────────────────────────────────────────

    {
      name: 'custom method name not in additionalMethodNames — ignored',
      code: `
        function MyComponent() {
          const x = Base.customExtend({ margin: 8 });
          return null;
        }
      `,
      options: [{ additionalMethodNames: ['withBase'] }],
    },
  ],

  // =========================================================================
  // INVALID — must trigger the rule
  // =========================================================================
  invalid: [
    // ── createComponent ───────────────────────────────────────────────────────

    {
      name: 'createComponent inside named function component',
      code: `
        function MyComponent() {
          const Box = createComponent(View, { padding: 16 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createComponent inside arrow function component (PascalCase)',
      code: `
        const MyComponent = () => {
          const Box = createComponent(View, { padding: 16 });
          return null;
        };
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createComponent inside function component that renders JSX',
      code: `
        const Card = (props) => {
          const Inner = createComponent(View, { borderRadius: 8 });
          return <Inner {...props} />;
        };
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createComponent inside a custom hook',
      code: `
        function useMyHook() {
          const Box = createComponent(View, { padding: 8 });
          return Box;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'hook' },
        },
      ],
    },

    {
      name: 'createComponent inside class render method',
      code: `
        class MyClass extends React.Component {
          render() {
            const Box = createComponent(View, { padding: 8 });
            return <Box />;
          }
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'render method' },
        },
      ],
    },

    {
      name: 'createComponent — multiple calls in one component, each reported',
      code: `
        function MyComponent() {
          const Box = createComponent(View, { padding: 8 });
          const Card = createComponent(View, { borderRadius: 4 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createComponent via named function expression assigned to PascalCase',
      code: `
        const Button = function ButtonInner() {
          const Wrapper = createComponent(View, { padding: 8 });
          return null;
        };
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'SmallUI.createComponent(...) member expression inside component',
      code: `
        function MyComponent() {
          const Box = SmallUI.createComponent(View, { padding: 8 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'export default function component with createComponent inside',
      code: `
        export default function Screen() {
          const Row = createComponent(View, { flexDirection: 'row' });
          return <Row />;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    // ── createComponentGroup ──────────────────────────────────────────────────

    {
      name: 'createComponentGroup inside a function component',
      code: `
        function MyForm() {
          const { Label, Input } = createComponentGroup({
            Label: { Component: Text, style: { fontSize: 14 } },
            Input: { Component: TextInput, style: { borderWidth: 1 } },
          });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponentGroup', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createComponentGroup inside a hook',
      code: `
        function useFormComponents() {
          const group = createComponentGroup({
            Field: { Component: View, style: { marginBottom: 8 } },
          });
          return group;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponentGroup', kind: 'hook' },
        },
      ],
    },

    {
      name: 'createComponentGroup inside class render method',
      code: `
        class MyScreen extends React.Component {
          render() {
            const { Row } = createComponentGroup({
              Row: { Component: View, style: { flexDirection: 'row' } },
            });
            return <Row />;
          }
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponentGroup', kind: 'render method' },
        },
      ],
    },

    // ── .extend() ─────────────────────────────────────────────────────────────

    {
      name: '.extend() inside a function component',
      code: `
        const Base = createComponent(View, { padding: 8 });

        function MyComponent() {
          const Card = Base.extend({ borderRadius: 8 });
          return null;
        }
      `,
      errors: [
        { messageId: 'noExtendInRender', data: { kind: 'function component' } },
      ],
    },

    {
      name: '.extend() inside an arrow function component',
      code: `
        const Base = createComponent(View, { padding: 8 });

        const MyComponent = () => {
          const Card = Base.extend({ margin: 4 });
          return null;
        };
      `,
      errors: [
        { messageId: 'noExtendInRender', data: { kind: 'function component' } },
      ],
    },

    {
      name: '.extend() inside a hook',
      code: `
        const Base = createComponent(View, { padding: 8 });

        function useCard() {
          return Base.extend({ borderRadius: 4 });
        }
      `,
      errors: [{ messageId: 'noExtendInRender', data: { kind: 'hook' } }],
    },

    {
      name: '.extend() inside class render method',
      code: `
        const Base = createComponent(View, { padding: 8 });

        class MyClass extends React.Component {
          render() {
            const Card = Base.extend({ borderRadius: 8 });
            return <Card />;
          }
        }
      `,
      errors: [
        { messageId: 'noExtendInRender', data: { kind: 'render method' } },
      ],
    },

    {
      name: '.extend() chained on inline createComponent inside component — both reported',
      code: `
        function MyComponent() {
          const Card = createComponent(View, { padding: 8 }).extend({ borderRadius: 4 });
          return null;
        }
      `,
      // ESLint visits CallExpression nodes outer-first:
      //   1. The outer .extend(...) call → noExtendInRender
      //   2. The inner createComponent(...) (receiver of .extend) → noFactoryInRender
      errors: [
        { messageId: 'noExtendInRender', data: { kind: 'function component' } },
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    // ── Mixed: multiple factory types in one component ────────────────────────

    {
      name: 'createComponent + createComponentGroup + .extend() all inside one component',
      code: `
        const Base = createComponent(View, { margin: 4 });

        function MyScreen() {
          const Box = createComponent(View, { padding: 8 });
          const { Row } = createComponentGroup({ Row: { Component: View } });
          const Card = Base.extend({ borderRadius: 8 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponentGroup', kind: 'function component' },
        },
        { messageId: 'noExtendInRender', data: { kind: 'function component' } },
      ],
    },

    // ── additionalFunctionNames option ────────────────────────────────────────

    {
      name: 'aliased factory name via additionalFunctionNames inside component',
      code: `
        function MyComponent() {
          const Box = myFactory(View, { padding: 8 });
          return null;
        }
      `,
      options: [{ additionalFunctionNames: ['myFactory'] }],
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'myFactory', kind: 'function component' },
        },
      ],
    },

    // ── additionalMethodNames option ──────────────────────────────────────────

    {
      name: 'custom method name via additionalMethodNames inside component',
      code: `
        function MyComponent() {
          const Card = Base.customExtend({ margin: 8 });
          return null;
        }
      `,
      options: [{ additionalMethodNames: ['customExtend'] }],
      errors: [
        {
          messageId: 'noMethodInRender',
          data: { method: 'customExtend', kind: 'function component' },
        },
      ],
    },

    {
      name: 'custom method name via additionalMethodNames inside a hook',
      code: `
        function useWidget() {
          return Base.withBase({ padding: 4 });
        }
      `,
      options: [{ additionalMethodNames: ['withBase'] }],
      errors: [
        {
          messageId: 'noMethodInRender',
          data: { method: 'withBase', kind: 'hook' },
        },
      ],
    },
  ],
});

// ===========================================================================
// Branch coverage for specific lines in no-createcomponent-in-render.js
//
// Line 118: getFunctionName → return keyNode.name for Property/MethodDefinition
//   Fires when the enclosing function is assigned as an object property or class
//   method whose key is an Identifier.
//
// Line 155: isReactComponentOrHookOrRender → return true
//   Fires when a nested arrow/function inside a class render method calls a factory.
//   The walk-up finds a MethodDefinition ancestor whose key.name === 'render'.
// ===========================================================================

const gapTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
});

gapTester.run('no-createcomponent-in-render — gap 9', rule, {
  valid: [
    // ── Line 118: object property with non-component, non-hook, non-render name ─
    {
      name: 'object property with non-flagged name — Property key path exercises line 118',
      // getFunctionName: parent.type === 'Property', keyNode.type === 'Identifier'
      // → return keyNode.name → 'build'
      // isReactComponentOrHookOrRender: 'build' is not PascalCase, not hook, not 'render' → false → allowed
      code: `
        const config = {
          build() {
            return createComponent(View, { padding: 8 });
          },
        };
      `,
    },
  ],

  invalid: [
    // ── Line 118: getFunctionName returns name from Property/MethodDefinition key ──
    {
      name: 'object property render() method — line 118 (Property key → "render")',
      // getFunctionName: parent.type === 'Property', keyNode.type === 'Identifier'
      // → return keyNode.name → 'render'
      // isReactComponentOrHookOrRender: name === 'render' → true
      code: `
        const myRenderer = {
          render() {
            const Box = createComponent(View, { padding: 8 });
            return Box;
          },
        };
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'render method' },
        },
      ],
    },

    {
      name: 'class MethodDefinition render() method — line 118 (MethodDefinition key → "render")',
      // getFunctionName: parent.type === 'MethodDefinition', keyNode → 'render'
      // isReactComponentOrHookOrRender: name === 'render' → true
      // (Existing test already covers the class path but this confirms line 118 via MethodDefinition)
      code: `
        class MyRenderer {
          render() {
            const Box = createComponent(View, { padding: 8 });
            return Box;
          }
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'render method' },
        },
      ],
    },

    // ── Line 155: walk-up finds MethodDefinition ancestor with key.name === 'render' ─
    {
      name: 'nested arrow function inside class render method — line 155 walk-up',
      // The nearest enclosing function of createComponent() is an anonymous arrow.
      // getFunctionName returns null for that arrow (parent is CallExpression argument, not
      // a VariableDeclarator/AssignmentExpression/Property/MethodDefinition with Identifier key).
      // isReactComponentOrHookOrRender: name is null → no name match alone.
      // Walk-up (line 148-157): finds MethodDefinition ancestor with key.name === 'render'
      // → return true (line 155). This is the only path that hits line 155.
      // getKindLabel: name is null → falls through to default → 'function component'
      code: `
        class MyScreen extends React.Component {
          render() {
            const items = [1, 2].map(() => {
              const Row = createComponent(View, { flexDirection: 'row' });
              return Row;
            });
            return null;
          }
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'nested named function inside class render method — line 155 walk-up',
      // The nearest enclosing function is a named function 'helper' (lowercase).
      // getFunctionName returns 'helper' — not PascalCase, not hook, not 'render'.
      // isReactComponentOrHookOrRender: name='helper' fails all name checks.
      // Walk-up then finds MethodDefinition ancestor key.name === 'render' → line 155 fires.
      // getKindLabel: name='helper' is not a hook or 'render' → falls through → 'function component'
      code: `
        class MyPage extends React.Component {
          render() {
            function helper() {
              const Card = createComponent(View, { borderRadius: 8 });
              return Card;
            }
            return helper();
          }
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },
  ],
});

// ===========================================================================
// getFunctionName → AssignmentExpression left Identifier
//
// Fires when the function is assigned via an assignment expression:
//   MyComponent = () => { ... }
// Parent node is AssignmentExpression; parent.left.type === 'Identifier';
// → return parent.left.name ('MyComponent').
// isReactComponentOrHookOrRender: 'MyComponent' is PascalCase → true → flagged.
// ===========================================================================

const gap10Tester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: { jsx: true },
    sourceType: 'module',
  },
});

gap10Tester.run('no-createcomponent-in-render — gap 10', rule, {
  valid: [
    {
      name: 'assignment expression with lowercase name — not a component, allowed',
      // parent.type === 'AssignmentExpression', parent.left.name === 'myComponent'
      // getFunctionName returns 'myComponent' — lowercase, not PascalCase → not flagged.
      code: `myComponent = () => { const B = createComponent(View, {}); return null; };`,
    },
  ],

  invalid: [
    {
      name: 'assignment expression with PascalCase name — line 118 (AssignmentExpression left Identifier)',
      // getFunctionName: parent.type === 'AssignmentExpression',
      //   parent.left.type === 'Identifier' → return parent.left.name → 'MyComponent'
      // isReactComponentOrHookOrRender: isComponentName('MyComponent') → true → flagged.
      code: `MyComponent = () => { const B = createComponent(View, {}); return null; };`,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createComponent', kind: 'function component' },
        },
      ],
    },
  ],
});

// If RuleTester passes without throwing, all tests passed.
console.log('✅ no-createcomponent-in-render: all rule tests passed');
