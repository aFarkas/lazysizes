#lazysizes scrollintent extension

Normally lazysizes uses a throttled scroll event to check for ``.lazyload`` elements. The scrollintent plugin changes this behavior to only check for ``.lazyload`` resources if either the user scrolling is slow or the user has stopped scrolling.

It is recommended to set the ``expand`` option to a higher value to improve the user experience, if this extension is used.

This extension solves mainly two problems:

- While lazySizes JS function already does work jank-free, decoding and painting images is a performance heavy task, which is mostly noticeable, while the user scrolls.
- If the user scrolls fast from top to bottom, it is not useful to load the assets in the middle (In case this is an important issue to you, you can also set the ``scrollLoadMode`` option to ``0``)
