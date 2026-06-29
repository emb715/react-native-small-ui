import { useWindowDimensions } from 'react-native';
import { _useSmallUIStore } from '../../config.store';
import { defaultBreakPoints } from '../../breakpoints';
import type { BreakPoints } from '../../breakpoints';

// Example:
// const maxWidth = useBreakPointValue({
//   default: '100%',
//   md: 100,
//   lg: 300
// })
// const otherThing = useBreakPointValue({
//   sm: 'small value',
//   md: 'value can be anything',
//   lg: 'large'
// })

const BREAKPOINT_ORDER: Array<keyof BreakPoints> = [
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  'default',
];

type UseBreakPointValueConfig = {
  breakPoints: BreakPoints;
};
type UseBreakPointValueProps<T> = Partial<Record<keyof BreakPoints, T>>;

export const useBreakpointValue = <T,>(
  breakpointValues: UseBreakPointValueProps<T>,
  _config?: UseBreakPointValueConfig
) => {
  const dimensions = useWindowDimensions();
  const storeConfig = _useSmallUIStore((s) => s.config);
  // Resolution order: explicit _config.breakPoints → storeConfig.breakPoints (unless false) → defaultBreakPoints.
  // defaultBreakPoints is always a valid object so this never resolves to a falsy value.
  const breakPoints =
    _config?.breakPoints !== undefined
      ? _config.breakPoints
      : storeConfig?.breakPoints !== false && storeConfig?.breakPoints
        ? storeConfig.breakPoints
        : defaultBreakPoints;

  const matchedKey = BREAKPOINT_ORDER.find((key) => {
    const bp = breakPoints[key];
    return (
      typeof bp === 'number' &&
      key in breakpointValues &&
      dimensions.width >= bp
    );
  });

  return matchedKey !== undefined
    ? breakpointValues[matchedKey]
    : breakpointValues?.default;
};
