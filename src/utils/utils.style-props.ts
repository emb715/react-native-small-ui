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
import type { UnwrapStyleProp } from '../smallUI.types';

type MatchStyleKey<T, TStyle = UnwrapStyleProp<T>> = Readonly<{
  [Property in keyof TStyle]: Property;
}>;

/**
 * MAINTENANCE: This object is enforced exhaustive by MatchStyleKey<T>.
 * If TypeScript reports a missing property error here, React Native added
 * a new style prop — add the key. After bumping the react-native devDependency,
 * run `yarn typecheck` to get the exact list of missing keys.
 *
 * Minimum RN version annotations are inline on keys that require new
 * architecture or a specific RN version.
 *
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
  boxSizing: 'boxSizing', // RN 0.83+ (logical shorthand)
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
  inset: 'inset', // RN 0.83+ (logical shorthand)
  insetBlock: 'insetBlock', // RN 0.83+ (logical shorthand)
  insetBlockEnd: 'insetBlockEnd', // RN 0.83+ (logical shorthand)
  insetBlockStart: 'insetBlockStart', // RN 0.83+ (logical shorthand)
  insetInline: 'insetInline', // RN 0.83+ (logical shorthand)
  insetInlineEnd: 'insetInlineEnd', // RN 0.83+ (logical shorthand)
  insetInlineStart: 'insetInlineStart', // RN 0.83+ (logical shorthand)
  justifyContent: 'justifyContent',
  left: 'left',
  margin: 'margin',
  marginBlock: 'marginBlock', // RN 0.83+ (logical shorthand)
  marginBlockEnd: 'marginBlockEnd', // RN 0.83+ (logical shorthand)
  marginBlockStart: 'marginBlockStart', // RN 0.83+ (logical shorthand)
  marginBottom: 'marginBottom',
  marginEnd: 'marginEnd',
  marginHorizontal: 'marginHorizontal',
  marginInline: 'marginInline', // RN 0.83+ (logical shorthand)
  marginInlineEnd: 'marginInlineEnd', // RN 0.83+ (logical shorthand)
  marginInlineStart: 'marginInlineStart', // RN 0.83+ (logical shorthand)
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
  paddingBlock: 'paddingBlock', // RN 0.83+ (logical shorthand)
  paddingBlockEnd: 'paddingBlockEnd', // RN 0.83+ (logical shorthand)
  paddingBlockStart: 'paddingBlockStart', // RN 0.83+ (logical shorthand)
  paddingBottom: 'paddingBottom',
  paddingEnd: 'paddingEnd',
  paddingHorizontal: 'paddingHorizontal',
  paddingInline: 'paddingInline', // RN 0.83+ (logical shorthand)
  paddingInlineEnd: 'paddingInlineEnd', // RN 0.83+ (logical shorthand)
  paddingInlineStart: 'paddingInlineStart', // RN 0.83+ (logical shorthand)
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
 * MAINTENANCE: This object is enforced exhaustive by MatchStyleKey<T>.
 * If TypeScript reports a missing property error here, React Native added
 * a new style prop — add the key. After bumping the react-native devDependency,
 * run `yarn typecheck` to get the exact list of missing keys.
 *
 * Minimum RN version annotations are inline on keys that require new
 * architecture or a specific RN version.
 *
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
  boxShadow: 'boxShadow', // New Architecture only (RN 0.76+)
  cursor: 'cursor',
  elevation: 'elevation',
  experimental_backgroundImage: 'experimental_backgroundImage', // RN 0.80+
  filter: 'filter', // New Architecture only (RN 0.76+)
  isolation: 'isolation', // New Architecture only (RN 0.76+)
  mixBlendMode: 'mixBlendMode', // New Architecture only (RN 0.76+)
  opacity: 'opacity',
  outlineColor: 'outlineColor', // New Architecture only (RN 0.76+)
  outlineOffset: 'outlineOffset', // New Architecture only (RN 0.76+)
  outlineStyle: 'outlineStyle', // New Architecture only (RN 0.76+)
  outlineWidth: 'outlineWidth', // New Architecture only (RN 0.76+)
  pointerEvents: 'pointerEvents',
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
 * MAINTENANCE: This object is enforced exhaustive by MatchStyleKey<T>.
 * If TypeScript reports a missing property error here, React Native added
 * a new style prop — add the key. After bumping the react-native devDependency,
 * run `yarn typecheck` to get the exact list of missing keys.
 *
 * Minimum RN version annotations are inline on keys that require new
 * architecture or a specific RN version.
 *
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
  TextInput: TextStyleProps,
  Pressable: ViewStyleProps,
  TouchableOpacity: ViewStyleProps,
  TouchableHighlight: ViewStyleProps,
  TouchableNativeFeedback: ViewStyleProps,
  TouchableWithoutFeedback: ViewStyleProps,
  ScrollView: ViewStyleProps,
  SafeAreaView: ViewStyleProps,
  Image: ImageStyleProps,
  _default: ViewStyleProps,
} as const;

export type LookUpPropsComponentType = keyof typeof StylePropsLookUp;
