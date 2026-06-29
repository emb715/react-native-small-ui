# Responsive design

## useBreakpointValue

Returns the value defined for the largest matching breakpoint.

```tsx
import { useBreakpointValue } from 'react-native-small-ui/utils';

const padding  = useBreakpointValue({ default: 8, sm: 12, md: 16, lg: 24 });
const columns  = useBreakpointValue({ default: 1, md: 2, lg: 3 });
const fontSize = useBreakpointValue({ default: 14, lg: 16 });
```

Default breakpoints (px, min-width, largest match wins):

| Key | Min width |
|---|---|
| `2xl` | 1536 |
| `xl` | 1280 |
| `lg` | 1024 |
| `md` | 768 |
| `sm` | 640 |
| `xs` | 480 |
| `default` | 0 (always matches) |

### Custom breakpoints

```tsx
import { configure } from 'react-native-small-ui';

configure({ breakPoints: { default: 0, xs: 480, sm: 600, md: 900, lg: 1200, xl: 1440, '2xl': 1920 } });
```

## useMediaQuery

Accepts a CSS media query string, returns a boolean.

```tsx
import { useMediaQuery } from 'react-native-small-ui/utils';

const isWide     = useMediaQuery('(min-width: 768px)');
const isLandscape = useMediaQuery('(orientation: landscape)');
const isNarrow   = useMediaQuery('(max-width: 599px)');
```

Supported features: `min-width` · `max-width` · `min-height` · `max-height` · `min-device-width` · `max-device-width` · `min-device-height` · `max-device-height` · `orientation`

Units: `px` · `rem` · `em` (rem/em converted at 16px base)

Operators: comma = OR · `and` = AND · `not` prefix inverts the query

## useOrientation

```tsx
import { useOrientation } from 'react-native-small-ui/utils';

const orientation = useOrientation(); // 'portrait' | 'landscape'
```

## configure — custom platforms

Register custom platform predicates. Each key becomes a `_<key>` style prop.

```tsx
import { configure, createComponent } from 'react-native-small-ui';
import { Dimensions } from 'react-native';

configure({
  platforms: {
    tablet: () => Dimensions.get('window').width >= 768,
  },
});

const Card = createComponent(View, {
  padding: 12,
  _tablet: { padding: 24, maxWidth: 600 },
});
```
