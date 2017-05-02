# lazysizes progressive extension

This plugin optimizes perceived performance by adding better support for rendering progressive JPGs/PNGs in conjunction with the LQIP pattern.

## Demo
- [Watch video](http://www.webpagetest.org/video/view.php?id=150207_0d904cee5186ebf124d4e3014aa5df39895618f0)
- Or try yourself: [lazysizes + progressive plugin](http://codepen.io/jschroeter/full/NPwXNv) vs. [lazysizes](http://codepen.io/jschroeter/full/MYOrjB)

## How it works

By default, [browsers don't render images progressively when switching from one image to another](http://w3facility.org/question/progressive-jpeg-isnt-progressive-when-changing-image-src-dynamically/) (e.g. changing the `src` or adding `srcset`).
When lazysizes detects the image gets visible, this plugin will remove the `src` attribute and insert it as a background image until the image from `srcset` is completely loaded.
So when using the LQIP pattern, the low quality placeholder will stay visible and the high quality image will render progressively on top of it.
This looks especially nice for large images on slow connections.

## Requirements
- Use [LQIP pattern](https://github.com/aFarkas/lazysizes#lqip)
- Make sure your JPGs/PNGs are saved with the progressive/interlaced option: [Online Progressive JPEG checker](http://highloadtools.com/progressivejpeg)

## Browser support
All browsers with native `srcset` support. Successfully tested on
- Chrome
- Chrome for Android
- Native Android Browser 4.4

Actually it works great in Firefox too, but currently Firefox shows an annoying broken image icon for a few seconds after removing the `src` attribute. To prevent that, the plugin is disabled for browsers without native `srcset` support. Hopefully this issue will be gone when Firefox gets native `srcset` support.
