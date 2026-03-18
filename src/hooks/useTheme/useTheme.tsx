import { DEFAULT_THEME_NAME, useThemeStore } from './theme.store';

// Unnamed — activates immediately as 'default'
export function registerTheme(theme: unknown): void;
// Named — silent registration, does not switch active theme
export function registerTheme(name: string, theme: unknown): void;
export function registerTheme(
  nameOrTheme: string | unknown,
  maybeTheme?: unknown
): void {
  if (typeof nameOrTheme === 'string') {
    useThemeStore.setState((state) => ({
      themes: { ...state.themes, [nameOrTheme]: maybeTheme },
    }));
  } else {
    useThemeStore.setState((state) => ({
      themes: { ...state.themes, [DEFAULT_THEME_NAME]: nameOrTheme },
      activeThemeName: DEFAULT_THEME_NAME,
    }));
  }
}

/**
 * Switch the active theme by name.
 * Returns true on success. Throws if the theme is not registered.
 */
export function setTheme(name: string): boolean {
  const { themes } = useThemeStore.getState();
  if (!themes[name]) {
    const available = Object.keys(themes).join(', ');
    throw new Error(
      `[react-native-small-ui] setTheme: theme "${name}" not found. Available: ${available || '(none)'}`
    );
  }
  useThemeStore.setState({ activeThemeName: name });
  return true;
}

export function getTheme(): unknown {
  const { themes, activeThemeName } = useThemeStore.getState();
  return themes[activeThemeName];
}

export function useThemeName(): string {
  return useThemeStore((state) => state.activeThemeName);
}

export function useTheme(): unknown;
export function useTheme<TSelected>(
  selector: (theme: unknown) => TSelected
): TSelected;
export function useTheme<TSelected = unknown>(
  selector?: (theme: unknown) => TSelected
) {
  return useThemeStore((state) => {
    const theme = state.themes[state.activeThemeName];
    return selector ? selector(theme) : theme;
  });
}
