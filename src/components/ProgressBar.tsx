import { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent, Platform, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const DURATION_PROGRESS = 5_000;
const DURATION_INDETERMINATE = 2_000;
const INDETERMINATE_MAX_WIDTH = 0.5;

const isWeb = Platform.OS === "web";

type ProgressBarOptions = {
  progressDuration?: number;
  indeterminateDuration?: number;
};
type ProgressBarProps = {
  progress?: number;
  indeterminate?: boolean;
  visible?: boolean;
  // containerStyle?: ViewStyle;
  // fillStyle?: ViewStyle;
  options?: ProgressBarOptions;
};
export const ProgressBar = ({
  progress = 0,
  indeterminate = false,
  visible = true,
  options = {
    indeterminateDuration: DURATION_INDETERMINATE,
    progressDuration: DURATION_PROGRESS,
  },
}: ProgressBarProps) => {
  const indeterminateDuration =
    options?.indeterminateDuration ?? DURATION_INDETERMINATE;
  const progressDuration = options?.progressDuration ?? DURATION_PROGRESS;

  const [width, setWidth] = useState(0);

  const animatedProgress = useSharedValue(
    indeterminate ? INDETERMINATE_MAX_WIDTH : 0
  );
  const translateX = useSharedValue(0);
  // const isVisible = useDerivedValue(() => visible, [visible]);

  useEffect(() => {
    if (visible) {
      const v = indeterminate ? INDETERMINATE_MAX_WIDTH : progress;
      animatedProgress.value = withTiming(v, {
        duration: progressDuration,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indeterminate, progress, visible, progressDuration]);

  useEffect(() => {
    if (indeterminate && visible) {
      const value = width;
      translateX.value = -value;
      translateX.value = withRepeat(
        withTiming(value, {
          duration: indeterminateDuration,
          easing: Easing.linear,
        }), // Animate to 100 over 1 second
        -1, // Repeat indefinitely
        false // Reverse animation on each repeat
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indeterminate, width, visible, indeterminateDuration]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    const opacity = visible ? 1 : 0;
    return {
      opacity,
    };
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    // Calculate the width based on the animatedProgress value
    const barWidth = animatedProgress.value * 100; // Assuming 100% max width
    return {
      width: `${barWidth}%`,
      transform: [{ translateX: translateX.value }],
    };
  });

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      onLayout={onLayout}
      style={isWeb && styles.webContainer}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: visible }}
      accessibilityValue={
        indeterminate
          ? {}
          : { min: 0, max: 100, now: Math.round(progress * 100) }
      }
    >
      <Animated.View
        style={[styles.progressBarContainer, animatedContainerStyle]}
      >
        <Animated.View style={[styles.progressBarFill, animatedStyle]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    height: 1,
    backgroundColor: "#20212f",
    // borderRadius: 5,
    overflow: "hidden", // Ensures the fill stays within bounds
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#34447B",
    // borderRadius: 5,
  },
  webContainer: {
    width: "100%",
    height: "100%",
  },
});
