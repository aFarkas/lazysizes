#lazysizes
**lazysizes** is a fast (jankfree) lazyloader for images (including responsive images), iframes and scripts/widgets without any dependency.

##Features

* supports standard conform **responsive images** (``srcset`` and ``picture``)
* loads ``iframes`` and ``script``
* Optional **automatic ``sizes`` attribute calculation**  for your repsonsive images (simply add ``data-sizes="auto"``). respimg was never so easy.
* **easy to use** / no configuration required:
	* no configuration required for scrollable areas (overflow: auto/scroll)
	* no configuration or callback invocation required for any kind of JS widgets (tabs, carousels, accordions, dialogs) or any JS behaviors (i.e.: infinite scroll/AJAX)
* performance and memory optimized
* **absolutley jankfree** (decoding an image or parsing an iframe might create a jank, but the script itself will never ever, even if you had thounds of images to lazy load on one page)
* uses the [**low quality image placeholder**](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) pattern, if an image already has a valid source
* JS off syntax possible
* lightweight only 2kb

##Download and Embed

Simply download the [lazysizes.min.js](lazysizes.min.js) and include it in your webpage:

```html
<script src="lazysizes.min.js" async=""></script>
```

##[Demo with code examples](http://afarkas.github.io/lazysizes/#examples)
can be seen [here](http://afarkas.github.io/lazysizes/#examples).

##API
**lazysizes** comes with a simple markup and JS API:

###Markup API
Simply add the ``class`` ``lazyload`` to all ``img`` and ``iframe`` elements, which should be loaded lazy. Instead of a ``src`` or ``srcset`` attribute, use a ``data-src`` or ``data-srcset`` attribute:

```html
<img data-src="image.jpg" class="lazyload" />
<!-- responsive image: -->
<img data-srcset="responsive-image1.jpg 1x, responsive-image2.jpg 2x" class="lazyload" />
```

**lazysizes** supports setting the ``sizes`` attribute automatically corresponding to the current size of your image. To add support for this add the value ``auto`` to the ``data-sizes`` attribute:

```html
<img
	data-sizes="auto"
	data-srcset="responsive-image1.jpg 300w,
    responsive-image2.jpg 600w,
    responsive-image3.jpg 900w" class="lazyload" />
```

**Important: How ``sizes`` is calculated**: The automatic sizes calculation takes the width of the image and the width of its parent element and uses the largest number of those two calculated numbers. It's therefore important, that all images are contained in a wrapper that isn't much bigger than the image should shown. Otherwise a wrong (too big) sizes attribute will be calculated.

For JS off support simply use a ``span`` or ``div`` element as a wrapper for a ``noscript`` element:

```html
<span
	data-sizes="auto"
	data-srcset="responsive-image1.jpg 300w,
    responsive-image2.jpg 600w,
    responsive-image3.jpg 900w" class="lazyload">
    <noscript>
    	<img src="responsive-image2.jpg" />
    </noscript>
</span>
```

##recommended markup: LQIP
We recommend to use the LQIP pattern: Simply add a low quality image as the ``src``:

```html
<!-- responsive example: -->
<img
	data-sizes="auto"
    src="lqip-src.jpg"
	data-srcset="lqip-src.jpg 100w,
    image2.jpg 300w,
    image3.jpg 600w,
    image4.jpg 900w" class="lazyload" />
    
<!-- or non-responsive: -->
<img src="lqip-src.jpg" data-src="image.jpg" class="lazyload" />
```

###JS API
**lazysizes** automatically detects new elements with the class ``lazyload`` so you won't need to call anything in most situations.


####``lazySizes.unveilLazy(DOMNode)``

In case a developer wants to show an image even if it is not inside the viewport the ``lazySizes.unveilLazy(DOMNode)`` can be called:

```js
lazySizes.unveilLazy(imgElem);
```

####``lazySizes.updateAllSizes()``

In case one or more image elements with the attribute ``data-sizes="auto"`` have changed in size ``lazySizes.updateAllSizes`` can be called (For example to implement element queries):

```js
lazySizes.updateAllSizes();
```

##Browser Support
**lazysizes** supports the following browsers: IE9+, Firefox 21+, Chrome 27+, Safari 6.1+, iOS Safari 7.0+, Android 4.1+

##About responsive image support
For full cross browser responsive image support a polyfill like [respimage](https://github.com/aFarkas/respimage) or [picturefill](https://github.com/scottjehl/picturefill) has to be used.

##Why lazySizes
In the past I often struggeled using lazy image loaders, because the "main check function" is called repeatedly and with a high frequency. Which makes it hard to fullfill two purposes runtime perfromance and memory allocation.
But in a world of responsive (especially retina optimized) images on the one hand and JS widgets like carousels or tabs on the other hand lazy loading images becomes more and more important. And therefore I created this project. And in fact **lazySizes** is different.

Due to the fact, that it is designed to be invoked with a high frequency, it was possible to hook into all kind of events and therefore this lazyloader wroks as a simple drop in solution, you simply write/render your markup and no matter wether it was added by ajax or revealed by a JS or CSS animation it will be picked up by **layzSizes**.

```html
<!-- responsive example: -->
<img
	data-sizes="auto"
    src="lqip-src.jpg"
	data-srcset="lqip-src.jpg 100w,
    image2.jpg 300w,
    image3.jpg 600w,
    image4.jpg 900w" class="lazyload" />
    
<!-- or non-responsive: -->
<img src="lqip-src.jpg" data-src="image.jpg" class="lazyload" />
```
