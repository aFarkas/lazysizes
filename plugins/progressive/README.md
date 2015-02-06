#lazysizes progressive extension

By default, [browsers don't render images progressively when switching from one image to another](http://w3facility.org/question/progressive-jpeg-isnt-progressive-when-changing-image-src-dynamically/) (e.g. changing the `src` or adding `srcset`).
When lazysizes detects the image gets visible, this plugin will remove the `src` attribute and insert it as a background image until the image from `srcset` is completely loaded.
So when using the LQIP pattern, the low quality placeholder will stay visible and the high quality will render progressively on top of it.
This looks especially nice for large pictures on slow connections.

##Browser support
All browsers with native `srcset` support. Successfully tested on
- Chrome
- Chrome for Android
- Native Android Browser 4.4

Would work great in Firefox too, but is currently disabled since Firefox shows an annoying broken image icon for a few seconds. Maybe someone comes up with an idea how to fix this...
