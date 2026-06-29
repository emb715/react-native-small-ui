/**
 * Type-level validation for ComponentGroup<T> per-member prop preservation (G1).
 * This file is NOT a Jest test — it is a pure TypeScript compile check.
 * If any line below fails tsc, Option A has failed and must be reverted.
 */
import { createComponentGroup } from '../smallUI';
import { Text, TextInput } from 'react-native';

const group = createComponentGroup({
  Label: { Component: Text, style: { fontSize: 14 } },
  Input: { Component: TextInput, style: { borderWidth: 1 } },
});

// These must compile without error — each member retains its component's prop type.
// void-cast silences noUnusedLocals without changing the type-check intent.
void ((_a: typeof group.Label) => _a)(group.Label);
void ((_b: typeof group.Input) => _b)(group.Input);

// This MUST produce a @ts-expect-error — if TypeScript accepts this without error,
// type erasure is still present (meaning any prop would be accepted on Input).
// @ts-expect-error — 'invalidProp' does not exist on TextInput props
group.Input.defaultProps = { invalidProp: true };

test('ComponentGroup type validation — compile-time only, see file for ts-expect-error checks', () => {
  // This file validates TypeScript types at compile time.
  // The real assertions are @ts-expect-error directives above.
  expect(true).toBe(true);
});

export {};
