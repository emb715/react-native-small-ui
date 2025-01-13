import React, { type ComponentType, useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { create } from 'zustand';

import {
  colorSchemeListener,
  useColorModeValue,
} from './hooks/useColorMode/useColorMode';
import {
  StylePropsLookUp,
  type LookUpPropsComponentType,
} from './utils/utils.style-props';
import type { ComponentStyle, ExtendedProps } from './tinybase.types';

/*****************************
 * EMB Tiny base. Simple UI Lib
 *****************************/

export const _useTinyBaseStore = create<{
  init: boolean;
  config: InitConfig | null;
}>(() => ({
  init: false,
  config: null,
}));

type InitConfig = {
  breakPoints?: BreakPoints | false;
};

export type BreakPoints = {
  'default': number;
  'xs': number;
  'sm': number;
  'md': number;
  'lg': number;
  'xl': number;
  '2xl': number;
};

const defaultBreakPoints = {
  'default': 0, // 100%
  'xs': 480,
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

const defaultConfig = {
  breakPoints: defaultBreakPoints,
};

export function _initTinyBase(config: InitConfig = defaultConfig) {
  try {
    // check init
    if (_useTinyBaseStore.getState().init === true) {
      console.warn('TinyBase already initiated.');
      return;
    }
    // Listener to set color mode
    const appearanceListener = colorSchemeListener();
    // ...
    // After all
    _useTinyBaseStore.setState({ init: true, config });

    return () => {
      appearanceListener.remove();
    };
  } catch (error) {
    console.error('_initTinyBase.error:', error);
    return;
  }
}

export const useTinyBase = ({ config }: { config?: InitConfig } = {}) => {
  const initRef = useRef<boolean>(false);

  useEffect(() => {
    if (initRef.current === false) {
      const unsubscribe = _initTinyBase(config);
      initRef.current = true;
      return () => {
        unsubscribe?.();
      };
    }
    return;
  }, [config]);
};

/**
 * COMPONENT CREATION
 ***********************/

const DEBUG_MODE = false;

export const createComponent =
  <TProps extends { style?: unknown }>(
    Component: ComponentType<TProps>,
    customized?: ComponentStyle<TProps>
  ) =>
  (props: TProps & ExtendedProps<TProps>) => {
    const mergedProps = Object.assign({}, customized, props);

    const resolvedProps = resolvePropByType<TProps>(
      mergedProps,
      Component.displayName as LookUpPropsComponentType
    );
    DEBUG_MODE &&
      console.log(
        'LOG: > resolvedProps:',
        Component.displayName,
        resolvedProps
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
    DEBUG_MODE &&
      console.log(
        'LOG: > generatedStyles:',
        Component.displayName,
        generatedStyles
      );

    // Select by platform
    const platformStyle = Platform.select({
      web: generatedStyles.web,
      native: generatedStyles.native,
      ios: generatedStyles.ios,
      android: generatedStyles.android,
      default: {},
    });
    DEBUG_MODE &&
      console.log(
        'LOG: > platformStyle:',
        Component.displayName,
        platformStyle
      );

    const colorModeStyle = useColorModeValue(
      generatedStyles.light as Record<string, unknown>,
      generatedStyles.dark as Record<string, unknown>
    );

    const mergedStyles = useMemo(
      () => [colorModeStyle, generatedStyles.component, platformStyle],
      [colorModeStyle, generatedStyles.component, platformStyle]
    );

    DEBUG_MODE &&
      console.log('LOG: > mergedStyles:', Component.displayName, mergedStyles);
    return React.createElement(Component, {
      ...(props as TProps), // Pass all the props, it will ignore none valid
      // ...(resolvedProps.props as TProps),
      style: mergedStyles,
    });
  };

export function resolvePropByType<TProps extends object>(
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
