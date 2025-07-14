import { useWindowDimensions } from 'react-native';
import { _useSmallUIStore, type BreakPoints } from '../../smallUI';

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

type UseBreakPointValueConfig = {
  breakPoints: BreakPoints;
};
type UseBreakPointValueProps<T> = Partial<Record<keyof BreakPoints, T>>;
export const useBreakPointValue = <T,>(
  breakpointValues: UseBreakPointValueProps<T>,
  _config?: UseBreakPointValueConfig
) => {
  const dimensions = useWindowDimensions();
  const store = _useSmallUIStore.getState();
  const config = _config || store?.config;
  if (!config || !config.breakPoints) {
    throw 'useBreakPointValue: theme.breakpoints not defined';
  }

  const matchBreakpoint = Object.entries(config.breakPoints).findLast(
    ([key, breakpoint]) => {
      if (
        typeof breakpoint === 'number' &&
        Object.keys(breakpointValues).includes(key)
      ) {
        return dimensions.width >= breakpoint;
      }
      return false;
    }
  );

  if (matchBreakpoint) {
    const [matchedKey] = matchBreakpoint;
    return breakpointValues[matchedKey as keyof BreakPoints];
  }
  return breakpointValues?.default;
};
