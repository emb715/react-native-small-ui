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
      name: 'createThemedComponent at module level',
      code: `
        const ThemedBox = createThemedComponent(View, (theme) => ({
          _light: { backgroundColor: theme.colors.light.background },
        }));

        function MyScreen() {
          return <ThemedBox />;
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
        const ThemedCard = createThemedComponent(View, (t) => ({ padding: t.space }));
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

    {
      name: 'createThemedComponent inside a lowercase utility function — allowed',
      code: `
        function withTheme(Component) {
          return createThemedComponent(Component, (t) => ({ color: t.text }));
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

    // ── createThemedComponent ─────────────────────────────────────────────────

    {
      name: 'createThemedComponent inside a function component',
      code: `
        function MyScreen() {
          const ThemedBox = createThemedComponent(View, (theme) => ({
            backgroundColor: theme.colors.background,
          }));
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createThemedComponent', kind: 'function component' },
        },
      ],
    },

    {
      name: 'createThemedComponent inside a hook',
      code: `
        function useThemedCard() {
          return createThemedComponent(View, (t) => ({ padding: t.space[4] }));
        }
      `,
      errors: [
        {
          messageId: 'noFactoryInRender',
          data: { callee: 'createThemedComponent', kind: 'hook' },
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

// If RuleTester passes without throwing, all tests passed.
console.log('✅ no-createcomponent-in-render: all rule tests passed');
