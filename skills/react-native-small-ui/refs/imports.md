# Import reference

## `react-native-small-ui` (core)

| Export | Kind | Description |
|---|---|---|
| `createComponent` | function | Wrap any RN component with style props |
| `createThemedComponent` | function | Like createComponent, receives active theme |
| `createComponentGroup` | function | Named group of components sharing reactive context |
| `configure` | function | Set custom breakpoints, platforms, color modes |
| `cs` | function | Style merge utility (falsy-safe, last-write-wins) |
| `getStatusBarStyle` | function | `'light-content'` or `'dark-content'` from a background color |
| `getResolvedStyles` | function | Pure style resolver — no render needed (testing/tooling) |
| `SmallUIComponent` | type | Type of any createComponent output |
| `ComponentStyle` | type | Style arg accepted by createComponent |
| `ComponentConfig` | type | Variant config shape |
| `VariantConfig` | type | Single variant definition |
| `VariantProps` | type | Inferred variant prop types |
| `CompoundVariant` | type | Compound variant entry |
| `PlatformRegistry` | type | `configure({ platforms })` shape |
| `ColorModeRegistry` | type | `configure({ colorModes })` shape |

## `react-native-small-ui/colormode`

| Export | Kind | Description |
|---|---|---|
| `useColorMode` | hook | `{ colorMode: 'light'\|'dark', isDark: boolean }` |
| `useColorModeValue` | hook | Returns light or dark value based on current mode |
| `setColorScheme` | function | Set `'light'` or `'dark'` programmatically |
| `toggleColorScheme` | function | Flip between light and dark |
| `setCustomColorMode` | function | Activate a registered custom mode by name (or `null` to clear) |
| `clearCustomColorMode` | function | Deactivate custom mode |
| `useCustomColorMode` | hook | `{ activeMode: string \| null }` |

## `react-native-small-ui/utils`

| Export | Kind | Description |
|---|---|---|
| `useBreakPointValue` | hook | Returns value for largest matching breakpoint |
| `useMediaQuery` | hook | CSS media query string → boolean |
| `useOrientation` | hook | `'portrait'` or `'landscape'` |

## `react-native-small-ui/theme`

| Export | Kind | Description |
|---|---|---|
| `registerTheme` | function | Register default or named theme slot |
| `setTheme` | function | Switch active theme by name |
| `useTheme` | hook | Active theme as `unknown` — cast to your type |
| `getTheme` | function | Active theme outside React |
| `useThemeName` | hook | Name of the active theme slot |
| `generateSpaceUnits` | function | Generate a spacing scale from a base unit |
| `ColorUtils` | object | `getHexAlpha`, `getContrastColor`, `getContrastMode` |

## `react-native-small-ui/presets`

| Export | Keys |
|---|---|
| `elevation` | `none` `xs` `sm` `md` `lg` `xl` |
| `shadow` | `none` `soft` `default` `pronounced` `inset` |
| `inset` | `none` `safe` `safeHorizontal` `modal` |
| `text` | `fixed` `crisp` `accessible` |
| `layout` | `fill` `center` `row` `rowBetween` `column` `absoluteFill` |
| `border` | `hairline` `thin` `medium` `thick` `pill` |

## `react-native-small-ui/testing` (test env only)

| Export | Description |
|---|---|
| `renderWithSmallUI` | Wraps RNTL render with SmallUI store overrides |
| `assertStyles` | Pure style resolver — assert styles without rendering |
