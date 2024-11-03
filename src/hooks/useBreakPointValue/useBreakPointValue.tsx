import { useWindowDimensions } from 'react-native';
import { _useTinyBaseStore, type BreakPoints } from '../../tinybase';

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

type UseBreakPointValueProps<T> = Partial<Record<keyof BreakPoints, T>>;
export const useBreakPointValue = <T,>(
  breakpointValues: UseBreakPointValueProps<T>
) => {
  const dimensions = useWindowDimensions();
  const { config } = _useTinyBaseStore.getState();
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
