// Badge text colors — _light and _dark values keyed by intent.
// Used by any component that renders text inside a Badge.

export type BadgeIntent = 'info' | 'success' | 'warning' | 'destructive';

function assertNever(x: never): never {
  throw new Error(`Unhandled BadgeIntent: ${String(x)}`);
}

export function getBadgeTextColor(intent: BadgeIntent): {
  light: string;
  dark: string;
} {
  switch (intent) {
    case 'info':
      return { light: '#1a6fa8', dark: '#7ec8e3' };
    case 'success':
      return { light: '#2a6b2a', dark: '#7ec87e' };
    case 'warning':
      return { light: '#7a5a00', dark: '#f5c842' };
    case 'destructive':
      return { light: '#b00020', dark: '#ff8a9a' };
    default:
      return assertNever(intent);
  }
}
