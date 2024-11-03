import { useCallback, useEffect, useState } from 'react';
import { Dimensions, type ScaledSize } from 'react-native';

function isLandscape(w: number, h: number) {
  return w >= h;
}

export function getDefaultOrientation() {
  const dimensions = Dimensions.get('window');
  return getOrientation(dimensions.width, dimensions.height);
}
export function getOrientation(w: number, h: number): Orientation {
  return isLandscape(w, h) ? 'landscape' : 'portrait';
}

export type Orientation = 'landscape' | 'portrait';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState<Orientation>(
    getDefaultOrientation()
  );

  const handleOrientation = useCallback(
    (data: { window: ScaledSize; screen: ScaledSize }) => {
      setOrientation(() =>
        getOrientation(data.screen.width, data.screen.height)
      );
    },
    []
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      handleOrientation
    );
    return () => {
      subscription.remove();
    };
  }, [handleOrientation]);

  return orientation;
};
