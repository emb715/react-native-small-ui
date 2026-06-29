/**
 * Breakpoint type and default values.
 * Extracted here so both smallUI.tsx (core) and useBreakPointValue (utils)
 * can import without creating a cross-entry-point dependency.
 */

export type BreakPoints = {
  'default': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
};

export const defaultBreakPoints: BreakPoints = {
  'default': 0,
  'xs': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};
