---
title: Colors
---

> Use it from ColorUtils.

`import {ColorUtils} from 'react-native-small-ui'`

#### Utils for colors

**`ColorUtils.getHexAlpha`**

```js
/**
 * @param {string} hexColor #fff or #ffffff
 * @param {number} alpha between 0 and 1
 * @return {string} new hex color with alpha
 */
 function getHexAlpha('#f00', 0.5): '#ff000080'
```

**`ColorUtils.getContrastColor`**

Accepts a color as argument to get the contrast color of it. `#fff` or `#000`

```js
/**
 * @param {string} color
 * @return {string} #fff or #000
 */
 function getContrastColor('#333'): '#fff'
```

**`ColorUtils.getContrastMode`**

Accepts a color as argument to get the corresponding color mode. `light` or `dark`

```js
/**
 * @param {string} color
 * @return {string} light or dark
 */
 function getContrastMode('#333'): 'light'
```