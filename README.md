#lazysizes
**lazysizes** is a fast (jankfree) lazyloader for images (including responsive images), iframes and scripts/widgets without any dependency. It may become also your number one tool to integrate responsive images. Due to the fact that it can also automatically calculate the ``sizes`` attribute for your responsive images, it helps to seperate layout (CSS) from content/structure (HTML) and makes integrating responsive images into any enviroment simply simple.

##How to

1. Download the [lazysizes.min.js script](lazysizes.min.js) and include **lazysizes** in your webpage.

    ```html
    <script src="lazysizes.min.js" async=""></script>
    ```

2. lazysizes does not need any JS configuration: Add the ``class`` ``"lazyload"`` to your images/iframes/widgets in conjunction with a ``data-src`` or ``data-srcset`` attribute:

    ```html
    <!-- non-responsive: -->
    <img src="low-quality-src.jpg" data-src="normal-quality-src.jpg" class="lazyload" />
    ```
    ```html
    <!-- responsive example with automatic sizes calculation: -->
    <img
        data-sizes="auto"
        src="lqip-src.jpg"
        data-srcset="lqip-src.jpg 100w,
        image2.jpg 300w,
        image3.jpg 600w,
        image4.jpg 900w" class="lazyload" />

    ```

##What makes lazysizes so awsome:
**lazysizes** is different to other lazy image loaders.

1. **Works without any configuration**: The script detects any changes to the visibility of an image/iframe automatically no matter wether it becomes visible through a user scroll, an CSS animation triggered through ``:hover`` or through any kind of JS behavior (carousel, infinite scroll, AJAX)...
2. **Futureproof**: It directly includes standard respsonsive image support (``picture`` and ``srcset``)
3. **Seperation of concerns**: For responsive image support it adds an automatic ``sizes`` calculation feature.
4. **Performance**: It's based on high efficient code (runtime **and** memory) to work jankfree at 60fps.
5. Works together with [**low quality image placeholders**](http://www.guypo.com/feo/introducing-lqip-low-quality-image-placeholders/) pattern 

##[Demo with code examples](http://afarkas.github.io/lazysizes/#examples)
can be seen [here](http://afarkas.github.io/lazysizes/#examples).

##About responsive image support
For full cross browser responsive image support a polyfill like [respimage (recommended)](https://github.com/aFarkas/respimage) or [picturefill](https://github.com/scottjehl/picturefill) has to be used.

##More about the API
**lazysizes** comes with a simple markup and JS API. Normally you will only need to use the markup API.

###Markup API
Add the ``class`` ``lazyload`` to all ``img`` and ``iframe`` elements, which should be loaded lazy. Instead of a ``src`` or ``srcset`` attribute, use a ``data-src`` or ``data-srcset`` attribute:

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

**Important: How ``sizes`` is calculated**: The automatic sizes calculation takes the width of the image and the width of its parent element and uses the largest number of those two calculated numbers. It's therefore important, that all images with a ``data-sizes="auto"`` attribute are constrained in width by it's parent element. Otherwise a wrong (too big) ``sizes`` attribute will be calculated.

##recommended markup: LQIP
We recommend to use the LQIP pattern (low quality image placeholder): Simply add a low quality image as the ``src``:

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

The recommended LQUIP pattern has the following advantages. The lquip-src is not hidden from the preload parser and loads very fast, which leads to an extreme fast first impression and in case of legacy browsers/devices as a good enough fallback (IE8 and Android 2 devices as also JS disabled).

###JS API 
**lazysizes** automatically detects new elements with the class ``lazyload`` so you won't need to call or configure anything in most situations.

####JS API - options
Options can be set by declaring a global configuration option object named ``lazySizesConfig``. This object should be defined before the including lazySizes script or at least in the same script file. Here a basic example:

```js
window.lazySizesConfig = {
    lazyClass: 'postbone', // use .postbone instead of .lazyload
    preloadAfterLoad: true // preload all lazy elements in a download queue
};
```

Here the list of options:

* ``lazySizesConfig.lazyClass`` (default: ``"lazyload"``): Marker class for all elements which should be lazy loaded (There can be only one ``class``. In case you need to add some other element, without the defined class, simply add it per JS: ``$('.lazy-others').addClass('lazyload');``)
* ``lazySizesConfig.preloadAfterLoad`` (default: ``false``): Wether lazysizes should load all elements after the window onload event. (Note: lazysizes will then load all elements using a queue. Only two parallel elements are loaded at the same time. This makes sure that other postboned downloads are also loaded.). Recommendation: On non-mobile devices this should be ``true``.
* ``lazySizesConfig.beforeUnveil`` (default: ``undefined``): A callback function, which will be invoked for each lazyload element right before of the "unveil" transformation. Gets the ``element`` as first argument passed. In case the callback function returns ``false``, the default transformation action will be prevented.
* ``lazySizesConfig.beforeSizes`` (default: ``undefined``): A callback function, which will be invoked for each element with the ``data-sizes="auto"`` attribute right before the calculated ``sizes`` attribute will be set. Gets the ``element`` and the calculated width for the sizes attribute passed. In case the callback function returns a number this number will be set, in case it returns ``false`` the ``sizes`` attribute won't be changed.
* ``lazySizesConfig.onlyLargerSizes`` (default: ``true``): In case a responsive image had the ``data-sizes="auto"`` attribute and the computed new size decreases, lazysizes won't normally change the ``sizes`` attribute to a lower value.
* ``lazySizesConfig.srcAttr`` (default: ``"data-src"``): The attribute, which should be transformed to ``src``.
* ``lazySizesConfig.srcset`` (default: ``"data-srcset"``): The attribute, which should be transformed to ``srcset``.
* ``lazySizesConfig.sizesAttr`` (default: ``"data-sizes"``): The attribute, which should be transformed to ``sizes``.



####JS API - methods
#####``lazySizes.unveilLazy(DOMNode)``

In case a developer wants to show an image even if it is not inside the viewport the ``lazySizes.unveilLazy(DOMNode)`` can be called:

```js
lazySizes.unveilLazy(imgElem);
```

#####``lazySizes.updateAllSizes()``

In case one or more image elements with the attribute ``data-sizes="auto"`` have changed in size ``lazySizes.updateAllSizes`` can be called (For example to implement element queries):

```js
lazySizes.updateAllSizes();
```

##Browser Support
**lazysizes** supports the following browsers: IE9+, Firefox 21+, Chrome 27+, Safari 6.1+, iOS Safari 7.0+, Android 4.1+

##Why lazySizes
In the past I often struggeled using lazy image loaders, because the "main check function" is called repeatedly and with a high frequency. Which makes it hard to fullfill two purposes runtime and memory efficiency. And looking into the source code of most so called lazy loaders often also unveils lazy developers...

But in a world of responsive retina optimized images on the one hand and JS widgets like carousels or tabs (a lot of initially hidden images) on the other hand lazy loading images becomes more and more important. And therefore I created this project. And in fact **lazySizes** is different.

Due to the fact, that it is designed to be invoked with a high frequency and therefore works highly efficient, it was possible to hook into all kind of events as also add a mutationobserver and therefore this lazyloader works as a simple drop in solution, you simply write/render your markup and no matter wether it was added by AJAX or revealed by a JS or CSS animation it will be picked up by **layzSizes**.

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
