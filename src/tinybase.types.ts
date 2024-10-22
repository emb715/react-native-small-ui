import { type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';

type Falsy = undefined | null | false;
export type StyleProp<T> = T | Falsy;

export type WebStyles = React.CSSProperties;

export type ExtendStyle<T, TStyle = FindStyleType<T>> = {
  _light?: TStyle;
  _dark?: TStyle;
  _web?: WebStyles;
  _native?: TStyle;
  _ios?: TStyle;
  _android?: TStyle;
};

export type isViewStyle<T> = T extends ViewStyle ? StyleProp<ViewStyle> : never;
export type isTextStyle<T> = T extends TextStyle ? StyleProp<TextStyle> : never;
export type isImageStyle<T> = T extends ImageStyle
  ? StyleProp<ImageStyle>
  : never;

// Find the pure style
export type FindStyleType<T> =
  T extends isViewStyle<T>
    ? T
    : T extends isTextStyle<T>
      ? T
      : T extends isImageStyle<T>
        ? T
        : never;

export type ExtendedProps<TProps extends { style?: unknown }> = FindStyleType<
  TProps['style']
> &
  ExtendStyle<TProps['style']>;

export type ComponentStyle<T extends { style?: unknown }> = ExtendedProps<T>;
