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
  // -------------------------------------------------------------------------
  // VALID — must NOT trigger the rule
  // -------------------------------------------------------------------------
  valid: [
    // Module-level call — the canonical correct pattern
    {
      name: 'module-level createComponent call',
      code: `
        import { createComponent } from 'react-native-small-ui';
        import { View } from 'react-native';

        const Box = createComponent(View, { padding: 16 });

        function MyComponent() {
          return <Box />;
        }
      `,
    },

    // Module-level in a non-component file (utility file)
    {
      name: 'module-level call with no component present',
      code: `
        const Box = createComponent(View, { padding: 16 });
        const Card = createComponent(View, { borderRadius: 8 });
      `,
    },

    // createComponent in a non-component function (lowercase name)
    {
      name: 'inside a regular (non-component) function — allowed',
      code: `
        function buildComponents() {
          const Box = createComponent(View, { padding: 16 });
          return Box;
        }
      `,
    },

    // createComponent inside an object method that is NOT render
    {
      name: 'inside an object method named setup — allowed',
      code: `
        const api = {
          setup() {
            return createComponent(View, { padding: 8 });
          },
        };
      `,
    },

    // Arrow function assigned to lowercase — not a component
    {
      name: 'arrow function assigned to lowercase variable — allowed',
      code: `
        const factory = () => {
          return createComponent(View, { padding: 8 });
        };
      `,
    },

    // Nested inside another module-level IIFE (not a component)
    {
      name: 'inside IIFE at module level — allowed',
      code: `
        const Box = (() => createComponent(View, {}))();
      `,
    },

    // Different call name — not createComponent
    {
      name: 'unrelated function call named createSomethingElse — ignored',
      code: `
        function MyComponent() {
          const x = createSomethingElse(View, { padding: 16 });
          return null;
        }
      `,
    },

    // createComponent via member expression on unrelated object
    {
      name: 'member expression not named createComponent — ignored',
      code: `
        function MyComponent() {
          const x = SomeLib.buildComponent(View, { padding: 16 });
          return null;
        }
      `,
    },

    // createComponent inside useCallback (anonymous arrow) inside a component —
    // nearest enclosing named function of the createComponent call is the
    // anonymous arrow (assigned to lowercase 'handler'), not MyComponent.
    // Rule does NOT fire — this is documented behaviour (use module level).
    {
      name: 'createComponent inside anonymous arrow inside useCallback — not detected',
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

    // additionalFunctionNames option — name not in list, inside component
    {
      name: 'custom name not in additionalFunctionNames — ignored',
      code: `
        function MyComponent() {
          const Box = styledView(View, { padding: 8 });
          return null;
        }
      `,
      options: [{ additionalFunctionNames: ['createStyledView'] }],
    },
  ],

  // -------------------------------------------------------------------------
  // INVALID — must trigger the rule
  // -------------------------------------------------------------------------
  invalid: [
    // Inside a named function component
    {
      name: 'inside named function component',
      code: `
        function MyComponent() {
          const Box = createComponent(View, { padding: 16 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // Inside an arrow function component assigned to uppercase
    {
      name: 'inside arrow function assigned to PascalCase — component',
      code: `
        const MyComponent = () => {
          const Box = createComponent(View, { padding: 16 });
          return null;
        };
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // Inside an arrow function component using JSX with forwardRef pattern
    {
      name: 'inside function component with props/ref pattern',
      code: `
        const Card = (props) => {
          const Inner = createComponent(View, { borderRadius: 8 });
          return <Inner {...props} />;
        };
      `,
      // 'Card' starts uppercase → detected as component
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // Inside a hook
    {
      name: 'inside a custom hook',
      code: `
        function useMyHook() {
          const Box = createComponent(View, { padding: 8 });
          return Box;
        }
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'hook' },
        },
      ],
    },

    // Inside a class render method
    {
      name: 'inside class component render method',
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
          messageId: 'noCreateComponentInRender',
          data: { kind: 'render method' },
        },
      ],
    },

    // Multiple calls inside one component — each is reported
    {
      name: 'multiple createComponent calls inside one component',
      code: `
        function MyComponent() {
          const Box = createComponent(View, { padding: 8 });
          const Card = createComponent(View, { borderRadius: 4 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // Inside a named function expression (not arrow) assigned to uppercase
    {
      name: 'named function expression assigned to PascalCase variable',
      code: `
        const Button = function ButtonInner() {
          const Wrapper = createComponent(View, { padding: 8 });
          return null;
        };
      `,
      // 'ButtonInner' starts uppercase → detected as component
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // additionalFunctionNames option
    {
      name: 'aliased createComponent via additionalFunctionNames option',
      code: `
        function MyComponent() {
          const Box = styledView(View, { padding: 8 });
          return null;
        }
      `,
      options: [{ additionalFunctionNames: ['styledView'] }],
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // MemberExpression call: SmallUI.createComponent(...)
    {
      name: 'member expression call SmallUI.createComponent inside component',
      code: `
        function MyComponent() {
          const Box = SmallUI.createComponent(View, { padding: 8 });
          return null;
        }
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },

    // Arrow function component — createComponent at top of body
    {
      name: 'export default arrow function component',
      code: `
        export default function Screen() {
          const Row = createComponent(View, { flexDirection: 'row' });
          return <Row />;
        }
      `,
      errors: [
        {
          messageId: 'noCreateComponentInRender',
          data: { kind: 'function component' },
        },
      ],
    },
  ],
});

// If RuleTester passes without throwing, all tests passed.
console.log('✅ no-createcomponent-in-render: all rule tests passed');
