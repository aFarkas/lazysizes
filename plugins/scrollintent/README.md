#lazysizes scrollintent extension

**Deprecated: This plugin was partially implemented into the core script.** To make use of this functionality you can modify the ``expand`` and the corresponding ``expFactor`` option:

```js
window.lazySizesConfig = window.lazySizesConfig || {};

window.lazySizesConfig.expFactor = 12; // default was 2
window.lazySizesConfig.expand = 50; // default was 300
```

Normally lazySizes uses a throttled scroll event to check for ``.lazyload`` elements. The scrollintent plugin changes this behavior to only check for ``.lazyload`` resources if either the user scrolling is slow or the user has stopped scrolling.

It is recommended to set the ``expand`` option to a higher value to improve the user experience, if this extension is used.

This extension solves mainly two problems:

- While lazySizes functions already do work jank-free, decoding and painting images is a performance heavy task, which is mostly noticeable, while the user scrolls.
- If the user scrolls fast from top to bottom, it is not useful to load the assets in the middle (In case this is an important issue to you, you can also set the ``scrollLoadMode`` option to ``0``)
