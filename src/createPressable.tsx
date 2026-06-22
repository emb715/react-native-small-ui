import React, { useState, useCallback } from 'react';
import { Pressable } from 'react-native';

import { createComponent } from './smallUI';
import type { SmallUIComponent } from './smallUI';
import type { PressableConfig, VariantConfig } from './smallUI.types';

type ViewProps = React.ComponentProps<typeof Pressable>;

/**
 * Factory for wrapping Pressable with the full createComponent feature set
 * plus four interactive state styles:
 *
 * _pressed:  while the user is actively pressing (press-in → press-out).
 * _hovered:  on pointer hover (web only — no-op on iOS/Android).
 * _focused:  when the component has keyboard or accessibility focus
 *            (web, tvOS, screen readers — no-op on touch-only devices).
 * _disabled: when props.disabled is true — read from props, no event needed.
 *
 * All createComponent features are supported: _light/_dark, platform props,
 * variants, compoundVariants, defaultVariants, .extend(), .withSlots(),
 * .withVariantContext(), and the ctx factory function.
 *
 * ⚠️ Always call at module scope — never inside a render function.
 *
 * @example
 * const Button = createPressable({
 *   base: {
 *     padding: 12, borderRadius: 8, alignItems: 'center',
 *     _light: { backgroundColor: '#8b59a0' },
 *     _dark:  { backgroundColor: '#a070b8' },
 *   },
 *   _pressed:  { opacity: 0.8 },
 *   _hovered:  { _web: { opacity: 0.92, cursor: 'pointer' } },
 *   _focused:  { _web: { outlineWidth: 2, outlineColor: '#8b59a0', outlineStyle: 'solid' } },
 *   _disabled: { opacity: 0.4 },
 * });
 */
export function createPressable<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  V extends VariantConfig<any> = VariantConfig<ViewProps>,
>(config: PressableConfig<V>): SmallUIComponent<ViewProps, V> {
  const { _pressed, _hovered, _focused, _disabled, ...componentConfig } =
    config;

  const Inner = createComponent(
    Pressable as unknown as React.ComponentType<any>, // any: Pressable style union ≠ { style?: unknown }
    componentConfig as Parameters<typeof createComponent>[1]
  ) as SmallUIComponent<ViewProps, V>;

  // Zero-overhead fast path — no wrapper when no interactive state styles are defined.
  if (!_pressed && !_hovered && !_focused && !_disabled) {
    return Inner;
  }

  const PressableWrapper = (props: React.ComponentProps<typeof Inner>) => {
    const [pressed, setPressed] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);

    // Destructure callbacks so each useCallback dep array references a stable
    // value rather than the whole props object (satisfies react-hooks/exhaustive-deps).
    const { onPressIn, onPressOut, onHoverIn, onHoverOut, onFocus, onBlur } =
      props;

    const handlePressIn = useCallback(
      (e: Parameters<NonNullable<ViewProps['onPressIn']>>[0]) => {
        setPressed(true);
        onPressIn?.(e);
      },
      [onPressIn]
    );

    const handlePressOut = useCallback(
      (e: Parameters<NonNullable<ViewProps['onPressOut']>>[0]) => {
        setPressed(false);
        onPressOut?.(e);
      },
      [onPressOut]
    );

    const handleHoverIn = useCallback(
      (e: Parameters<NonNullable<ViewProps['onHoverIn']>>[0]) => {
        setHovered(true);
        onHoverIn?.(e);
      },
      [onHoverIn]
    );

    const handleHoverOut = useCallback(
      (e: Parameters<NonNullable<ViewProps['onHoverOut']>>[0]) => {
        setHovered(false);
        onHoverOut?.(e);
      },
      [onHoverOut]
    );

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<ViewProps['onFocus']>>[0]) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<ViewProps['onBlur']>>[0]) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur]
    );

    // _disabled reads props.disabled directly — no event subscription needed.
    const isDisabled = Boolean((props as Record<string, unknown>)['disabled']);

    const pressedOverrides =
      pressed && _pressed ? (_pressed as Record<string, unknown>) : {};
    const hoveredOverrides =
      hovered && _hovered ? (_hovered as Record<string, unknown>) : {};
    const focusedOverrides =
      focused && _focused ? (_focused as Record<string, unknown>) : {};
    const disabledOverrides =
      isDisabled && _disabled ? (_disabled as Record<string, unknown>) : {};

    // Resolution order: _pressed → _hovered → _focused → _disabled
    // _disabled wins last — a disabled component should always look disabled
    // regardless of pressed/hovered/focused state.
    const interactiveProps = {
      ...pressedOverrides,
      ...hoveredOverrides,
      ...focusedOverrides,
      ...disabledOverrides,
    };

    return (
      <Inner
        {...(props as any)}
        {...interactiveProps}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
  };

  const wrapper = PressableWrapper as unknown as SmallUIComponent<ViewProps, V>;
  const wrapperRecord = wrapper as unknown as Record<string, unknown>;
  const innerRecord = Inner as unknown as Record<string, unknown>;

  wrapperRecord['extend'] = innerRecord['extend'];
  wrapperRecord['withSlots'] = innerRecord['withSlots'];
  wrapperRecord['withVariantContext'] = innerRecord['withVariantContext'];
  wrapperRecord['__meta'] = innerRecord['__meta'];
  wrapperRecord['__variants'] = innerRecord['__variants'];
  wrapperRecord['__resolveStyles'] = innerRecord['__resolveStyles'];

  return wrapper;
}
