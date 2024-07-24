import { merge } from 'lodash';
import React, { type ComponentType, useEffect, useMemo, useRef } from 'react';
import {
  Appearance,
  type ImageStyle,
  Platform,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { create } from 'zustand';

import { setColorMode, useColorModeValue } from './hooks/useColorMode';
import { registerTheme, useTheme, type ThemeConfig } from './hooks/useTheme';
import {
  StylePropsLookUp,
  type LookUpPropsComponentType,
} from './utils/utils.style-props';

/*****************************
 * EMB Tiny base. Simple UI Lib
 *****************************/

const useTinyBaseStore = create(() => ({
  init: false,
}));

function initTinyBase(themeConfig?: ThemeConfig) {
  // check init
  if (useTinyBaseStore.getState().init === true) {
    console.warn('TinyBase already initiated.');
    return;
  }
  // set theme
  themeConfig && registerTheme(themeConfig);
  // set color mode
  Appearance.addChangeListener((colorMode) => {
    setColorMode(colorMode.colorScheme);
  });
  // ...
  // After all
  useTinyBaseStore.setState({ init: true });
}

export const useTinyBase = ({
  themeConfig,
}: { themeConfig?: ThemeConfig } = {}) => {
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (initRef.current === false) {
      initTinyBase(themeConfig);
      initRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export const TinyBaseProvider = ({
  children,
  themeConfig,
}: React.PropsWithChildren<{ themeConfig?: ThemeConfig }>) => {
  useTinyBase({ themeConfig });

  return <>{children}</>;
};

/**
 * COMPONENT CREATION
 ***********************/

type Falsy = undefined | null | false;
type StyleProp<T> = T | Falsy;

type WebStyles = React.CSSProperties;

type ExtendStyle<T, TStyle = FindStyleType<T>> = {
  _light?: TStyle;
  _dark?: TStyle;
  _web?: WebStyles;
  _native?: TStyle;
  _ios?: TStyle;
  _android?: TStyle;
};

type isViewStyle<T> = T extends ViewStyle ? StyleProp<ViewStyle> : never;
type isTextStyle<T> = T extends TextStyle ? StyleProp<TextStyle> : never;
type isImageStyle<T> = T extends ImageStyle ? StyleProp<ImageStyle> : never;

// Find the pure style
export type FindStyleType<T> =
  T extends isViewStyle<T>
    ? T
    : T extends isTextStyle<T>
      ? T
      : T extends isImageStyle<T>
        ? T
        : never;

interface CallbackThemed<TReturn> {
  (theme: ReturnType<typeof useTheme>): TReturn;
}

type ExtendedProps<TProps extends { style?: unknown }> = FindStyleType<
  TProps['style']
> &
  ExtendStyle<TProps['style']>;

export type CustomStyle<T extends { style?: unknown }> = ExtendedProps<T>;

export const createComponent =
  <TProps extends { style?: unknown }>(
    Component: ComponentType<TProps>,
    customized?: CustomStyle<TProps> | CallbackThemed<CustomStyle<TProps>>
  ) =>
  (props: TProps & ExtendedProps<TProps>): React.ReactNode => {
    const theme = useTheme();

    const _customStyles = useMemo(
      () => getCustomizedStyle(theme, customized),
      [theme]
    );

    const mergedProps = merge(_customStyles, props);

    const resolvedProps = useMemo(
      () =>
        resolvePropByType<TProps>(
          mergedProps,
          Component.displayName as LookUpPropsComponentType
        ),
      [mergedProps]
    );

    const generatedStyles = useMemo(
      () =>
        createStyle({
          styleProp: resolvedProps.styleProp,
          atomicStyles: resolvedProps.atomic,
          light: resolvedProps.customProps?._light,
          dark: resolvedProps.customProps?._dark,
          web: resolvedProps.customProps?._web,
          native: resolvedProps.customProps?._native,
          ios: resolvedProps.customProps?._ios,
          android: resolvedProps.customProps?._android,
        }),
      [resolvedProps.styleProp, resolvedProps.customProps, resolvedProps.atomic]
    );

    // Select by platform
    const platformStyle = Platform.select({
      web: generatedStyles.web,
      native: generatedStyles.native,
      ios: generatedStyles.ios,
      android: generatedStyles.android,
      default: {},
    });

    const colorModeStyle = useColorModeValue(
      generatedStyles.light as Record<string, unknown>,
      generatedStyles.dark as Record<string, unknown>
    );

    const mergedStyles = useMemo(
      () => [generatedStyles.component, platformStyle, colorModeStyle],
      [colorModeStyle, generatedStyles.component, platformStyle]
    );

    return React.createElement(Component, {
      ...(props as TProps), // Pass all the props, it will ignore none valid
      // ...(resolvedProps.props as TProps),
      style: mergedStyles,
    });
  };

function getCustomizedStyle<TProps extends { style?: unknown }>(
  theme: ReturnType<typeof useTheme>,
  customized?: CustomStyle<TProps> | CallbackThemed<CustomStyle<TProps>>
): CustomStyle<TProps> {
  if (!customized) {
    return {} as CustomStyle<TProps>;
  }
  if (typeof customized === 'function') {
    return customized(theme) as CustomStyle<TProps>;
  }
  return customized as CustomStyle<TProps>;
}

function resolvePropByType<TProps extends object>(
  props: TProps,
  componentType?: LookUpPropsComponentType
) {
  const LookUpProps = componentType
    ? StylePropsLookUp[componentType]
    : StylePropsLookUp._default;

  const atomic = {} as Record<keyof typeof LookUpProps | string, unknown>;
  let styleProp = {} as Record<string, unknown>;
  // const originalProps = {} as Partial<TProps>;
  const customProps = {} as Record<keyof typeof CustomStyleProps, object>;

  Object.entries(props).forEach(([propKey, propValue]) => {
    if (propKey === 'style') {
      styleProp = propValue;
      return;
    }
    // Custom keys for styling
    if (propKey in CustomStyleProps) {
      customProps[propKey as keyof typeof CustomStyleProps] = propValue;
      return;
    }
    // Find style props
    if (LookUpProps) {
      if (propKey in LookUpProps) {
        atomic[propKey as keyof typeof LookUpProps] = propValue;
        return;
      }
    }
    // originalProps[propKey as keyof TProps] = propValue;
  });

  return {
    // props: originalProps,
    styleProp,
    atomic,
    customProps,
  };
}

const CustomStyleProps = {
  _light: '_light',
  _dark: '_dark',
  _web: '_web',
  _native: '_native',
  _ios: '_ios',
  _android: '_android',
} as const;

type CreateStyleParams = {
  styleProp?: object;
  atomicStyles?: object;
  light?: object;
  dark?: object;
  web?: object;
  native?: object;
  ios?: object;
  android?: object;
};
function createStyle({
  styleProp = {},
  atomicStyles = {},
  light = {},
  dark = {},
  web = {},
  native = {},
  ios = {},
  android = {},
}: CreateStyleParams) {
  return StyleSheet.create({
    component: StyleSheet.flatten([atomicStyles, styleProp]),
    light,
    dark,
    web,
    native,
    ios,
    android,
  });
}
