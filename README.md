#lazysizes
**lazysizes** is a fast (jankfree) lazyloader for images (including responsive images), iframes and scripts/widgets without any dependency.

##Download and Embed

Simply download the [lazysizes.min.js](lazysizes.min.js) and include it in your webpage:

```html
<script src="lazysizes.min.js"></script>
```

##[Demo with code examples](http://afarkas.github.io/lazysizes/#examples)
can be seen [here](http://afarkas.github.io/lazysizes/#examples).

##API
lazysizes comes with a simple markup and JS API:

###Markup API
Simply add the ``class`` ``lazyload`` to all ``img`` and ``iframe`` elements, which should be loaded lazy. Instead of a ``src`` or ``srcset`` attribute, use a ``data-src`` or ``data-srcset`` attribute:

```html
<img data-src="image.jpg" class="lazyload" />
<!-- responsive image: -->
<img data-srcset="responsive-image1.jpg 1x, responsive-image2.jpg 2x" class="lazyload" />
```

As a nice bonus lazysizes supports setting the ``sizes`` attribute automatically corresponding to the current size of your image. To add support for this add the value ``auto`` to the ``data-sizes`` attribute:

```html
<img
	data-sizes="auto"
	data-srcset="responsive-image1.jpg 300w, 
    responsive-image2.jpg 600w,
    responsive-image3.jpg 900w" class="lazyload" />
```

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

###JS API
**lazysizes** automatically detects new elements with the class ``lazyload`` so you wont need to call anything.

####``lazySizes.updateAllLazy``
In case a lazyload image was hidden and then shown via JS the method ``lazySizes.updateAllLazy`` can be called:

```js
lazySizes.updateAllLazy();
````

####``lazySizes.unveilLazy(DOMNode)```

In case a developer wants to show an image even if it is not inside the viewport the ``lazySizes.unveilLazy(DOMNode)`` can be called:

```js
lazySizes.unveilLazy(imgElem);
```

####``lazySizes.updateAllSizes()```

In case one or more image elements with the attribute ``data-sizes`` have changed in size ``lazySizes.updateAllSizes`` can be called (For example to implement element queries):

```js
lazySizes.updateAllSizes();
```

##Browser Support
**lazysizes** is supported by [all browsers which support ``getElementsByClassName``](http://caniuse.com/#feat=getelementsbyclassname). (No IE8 support.)

##About responsive image support
For full cross browser responsive image support a polyfill like [respimage](https://github.com/aFarkas/respimage) or [picturefill](https://github.com/scottjehl/picturefill) has to be used.
