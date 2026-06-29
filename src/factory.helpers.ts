/**
 * Internal helpers for createComponent's render pipeline.
 *
 * resolvePropByType routes props into style buckets.
 * createStyleSheet builds a StyleSheet from those buckets.
 *
 * Not exported from any public entry point.
 */

import { StyleSheet } from 'react-native';
import {
  StylePropsLookUp,
  type LookUpPropsComponentType,
} from './utils/utils.style-props';

export function resolvePropByType<TProps extends object>(
  props: TProps,
  componentType?: LookUpPropsComponentType
) {
  const LookUpProps =
    componentType && componentType in StylePropsLookUp
      ? StylePropsLookUp[componentType]
      : StylePropsLookUp._default;

  const atomic = {} as Record<keyof typeof LookUpProps | string, unknown>;
  let styleProp = {} as Record<string, unknown>;
  const customProps = {} as Record<string, object>;

  const exclusionList = ['children'];
  Object.entries(props).forEach(([propKey, propValue]) => {
    if (exclusionList.includes(propKey)) return;
    if (propKey === 'style') {
      styleProp = propValue;
      return;
    }
    if (propKey.startsWith('_')) {
      customProps[propKey] = propValue;
      return;
    }
    if (LookUpProps && propKey in LookUpProps) {
      atomic[propKey as keyof typeof LookUpProps] = propValue;
    }
  });

  return { styleProp, atomic, customProps };
}

export type CreateStyleParams = {
  styleProp?: object;
  atomicStyles?: object;
  light?: object;
  dark?: object;
  web?: object;
  native?: object;
  ios?: object;
  android?: object;
};

export function createStyleSheet({
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
