import {
  type FlexStyle,
  type ImageStyle,
  type ShadowStyleIOS as RNShadowStyleIOS,
  type TextStyle,
  type TextStyleAndroid as RNTextStyleAndroid,
  type TextStyleIOS as RNTextStyleIOS,
  type TransformsStyle as RNTransformsStyle,
  type ViewStyle,
} from 'react-native';
import type { FindStyleType } from '../tinybase.types';

type MatchStyleKey<T, TStyle = FindStyleType<T>> = Readonly<{
  [Property in keyof TStyle]: Property;
}>;

/**
 * Flex Prop Types
 * @see https://reactnative.dev/docs/flexbox
 * @see https://reactnative.dev/docs/layout-props
 */
const FlexStyleProps: MatchStyleKey<FlexStyle> = {
  alignContent: 'alignContent',
  alignItems: 'alignItems',
  alignSelf: 'alignSelf',
  aspectRatio: 'aspectRatio',
  borderBottomWidth: 'borderBottomWidth',
  borderEndWidth: 'borderEndWidth',
  borderLeftWidth: 'borderLeftWidth',
  borderRightWidth: 'borderRightWidth',
  borderStartWidth: 'borderStartWidth',
  borderTopWidth: 'borderTopWidth',
  borderWidth: 'borderWidth',
  bottom: 'bottom',
  display: 'display',
  end: 'end',
  flex: 'flex',
  flexBasis: 'flexBasis',
  flexDirection: 'flexDirection',
  rowGap: 'rowGap',
  gap: 'gap',
  columnGap: 'columnGap',
  flexGrow: 'flexGrow',
  flexShrink: 'flexShrink',
  flexWrap: 'flexWrap',
  height: 'height',
  justifyContent: 'justifyContent',
  left: 'left',
  margin: 'margin',
  marginBottom: 'marginBottom',
  marginEnd: 'marginEnd',
  marginHorizontal: 'marginHorizontal',
  marginLeft: 'marginLeft',
  marginRight: 'marginRight',
  marginStart: 'marginStart',
  marginTop: 'marginTop',
  marginVertical: 'marginVertical',
  maxHeight: 'maxHeight',
  maxWidth: 'maxWidth',
  minHeight: 'minHeight',
  minWidth: 'minWidth',
  overflow: 'overflow',
  padding: 'padding',
  paddingBottom: 'paddingBottom',
  paddingEnd: 'paddingEnd',
  paddingHorizontal: 'paddingHorizontal',
  paddingLeft: 'paddingLeft',
  paddingRight: 'paddingRight',
  paddingStart: 'paddingStart',
  paddingTop: 'paddingTop',
  paddingVertical: 'paddingVertical',
  position: 'position',
  right: 'right',
  start: 'start',
  top: 'top',
  width: 'width',
  zIndex: 'zIndex',
  direction: 'direction',
};

const ShadowStyleIOS: MatchStyleKey<RNShadowStyleIOS> = {
  shadowColor: 'shadowColor',
  shadowOffset: 'shadowOffset',
  shadowOpacity: 'shadowOpacity',
  shadowRadius: 'shadowRadius',
};

const TransformsStyle: MatchStyleKey<RNTransformsStyle> = {
  transform: 'transform',
  transformMatrix: 'transformMatrix',
  rotation: 'rotation',
  scaleX: 'scaleX',
  scaleY: 'scaleY',
  translateX: 'translateX',
  translateY: 'translateY',
};

/**
 * View style
 * @see https://reactnative.dev/docs/view#style
 */
const ViewStyleProps: MatchStyleKey<ViewStyle> = {
  ...FlexStyleProps,
  ...ShadowStyleIOS,
  ...TransformsStyle,
  backfaceVisibility: 'backfaceVisibility',
  backgroundColor: 'backgroundColor',
  borderBlockColor: 'borderBlockColor',
  borderBlockEndColor: 'borderBlockEndColor',
  borderBlockStartColor: 'borderBlockStartColor',
  borderBottomColor: 'borderBottomColor',
  borderBottomEndRadius: 'borderBottomEndRadius',
  borderBottomLeftRadius: 'borderBottomLeftRadius',
  borderBottomRightRadius: 'borderBottomRightRadius',
  borderBottomStartRadius: 'borderBottomStartRadius',
  borderColor: 'borderColor',
  borderCurve: 'borderCurve',
  borderEndColor: 'borderEndColor',
  borderEndEndRadius: 'borderEndEndRadius',
  borderEndStartRadius: 'borderEndStartRadius',
  borderLeftColor: 'borderLeftColor',
  borderRadius: 'borderRadius',
  borderRightColor: 'borderRightColor',
  borderStartColor: 'borderStartColor',
  borderStartEndRadius: 'borderStartEndRadius',
  borderStartStartRadius: 'borderStartStartRadius',
  borderStyle: 'borderStyle',
  borderTopColor: 'borderTopColor',
  borderTopEndRadius: 'borderTopEndRadius',
  borderTopLeftRadius: 'borderTopLeftRadius',
  borderTopRightRadius: 'borderTopRightRadius',
  borderTopStartRadius: 'borderTopStartRadius',
  opacity: 'opacity',
  elevation: 'elevation',
  pointerEvents: 'pointerEvents',
  cursor: 'cursor',
  transformOrigin: 'transformOrigin',
};

const TextStyleAndroid: MatchStyleKey<RNTextStyleAndroid> = {
  ...ViewStyleProps,
  textAlignVertical: 'textAlignVertical',
  verticalAlign: 'verticalAlign',
  includeFontPadding: 'includeFontPadding',
};

const TextStyleIOS: MatchStyleKey<RNTextStyleIOS> = {
  ...ViewStyleProps,
  fontVariant: 'fontVariant',
  textDecorationColor: 'textDecorationColor',
  textDecorationStyle: 'textDecorationStyle',
  writingDirection: 'writingDirection',
};

/**
 * Text style
 * @see https://reactnative.dev/docs/text#style
 */
const TextStyleProps: MatchStyleKey<TextStyle> = {
  ...ViewStyleProps,
  ...TextStyleIOS,
  ...TextStyleAndroid,
  color: 'color',
  fontFamily: 'fontFamily',
  fontSize: 'fontSize',
  fontStyle: 'fontStyle',
  fontWeight: 'fontWeight',
  letterSpacing: 'letterSpacing',
  lineHeight: 'lineHeight',
  textAlign: 'textAlign',
  textDecorationLine: 'textDecorationLine',
  textDecorationStyle: 'textDecorationStyle',
  textDecorationColor: 'textDecorationColor',
  textShadowColor: 'textShadowColor',
  textShadowOffset: 'textShadowOffset',
  textShadowRadius: 'textShadowRadius',
  textTransform: 'textTransform',
  userSelect: 'userSelect',
};

/**
 * Image style
 * @see https://reactnative.dev/docs/image#style
 */
const ImageStyleProps: MatchStyleKey<ImageStyle> = {
  ...FlexStyleProps,
  ...ShadowStyleIOS,
  ...TransformsStyle,
  resizeMode: 'resizeMode',
  backfaceVisibility: 'backfaceVisibility',
  borderBottomLeftRadius: 'borderBottomLeftRadius',
  borderBottomRightRadius: 'borderBottomRightRadius',
  backgroundColor: 'backgroundColor',
  borderColor: 'borderColor',
  borderRadius: 'borderRadius',
  borderTopLeftRadius: 'borderTopLeftRadius',
  overflow: 'overflow',
  overlayColor: 'overlayColor',
  tintColor: 'tintColor',
  opacity: 'opacity',
  objectFit: 'objectFit',
  cursor: 'cursor',
};

// Style Props By Component Name
export const StylePropsLookUp = {
  View: ViewStyleProps,
  Text: TextStyleProps,
  Pressable: ViewStyleProps,
  Image: ImageStyleProps,
  _default: ViewStyleProps,
} as const;

export type LookUpPropsComponentType = keyof typeof StylePropsLookUp;
