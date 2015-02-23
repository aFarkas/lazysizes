#lazysizes respimg polyfill extension

While [picturefill](https://github.com/scottjehl/picturefill) and [respimage](https://github.com/aFarkas/respimage) are full functional responsive images polyfills, the lazySizes respimg polyfill extension is only a partial polyfill, which supports only the most important subset of the native responsive images standard and only in conjunction with the lazySizes core script.

As a result it is an extreme fast and lightweight plugin.

##constrained Markup support

This plugin supports both art directed responsive images using the ``picture`` element as also resolution switching based on ``srcset`` using the width descriptor (and of course the combination of both).

###What is *not* supported:

- The use of explicit density descriptors (x descriptor) are not supported (This should not be a problem, because all use cases of the density descriptor can always also be substituted with a width descriptor).
- If the ``sizes`` attribute is used either the ``data-sizes="auto"`` feature has to be used or the ``sizes`` value consists of just one source size value with the CSS *px* unit.
- If picture is used the ``img`` element should not have a ``srcset``/``data-srcset`` attribute, instead the last ``source`` element should/can be used without a ``media`` and ``type`` attribute.
- The use of the ``source[type]`` attribute is not automatically supported, but can be manually added by overriding the ``lazySizesConfig.supportsType`` option callback function.
- The use of the ``source[media]`` is supported for all browsers, which [do support ``matchMedia``](http://caniuse.com/#search=matchMedia). To add full support for IE9 and other legacy browsers a [``window.matchMedia`` polyfill](https://github.com/paulirish/matchMedia.js/) or ``Modernizr.mq`` (Modernizr Media Queries) can be used.


###What is *fully* supported

Aside from above mentioned constraints everything else is fully supported. Here are some practical examples of fully supported responsive images:

```html
<!-- use of width descriptor + data-sizes="auto" -->
<img
    data-sizes="auto"
    data-srcset="image1.jpg 300w,
    image2.jpg 600w,
    image3.jpg 900w" class="lazyload" />

<!-- picture with one implicit density descriptor per srcset -->
<picture>
	<!--[if IE 9]><audio><![endif]-->
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		media="--small" />
	<source
		data-srcset="http://placehold.it/700x300"
		media="--medium" />
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff"
		media="--large" />
	<source
    	    data-srcset="http://placehold.it/1800x900/117fe8/fff" />
    <!--[if IE 9]></audio><![endif]-->
    <img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        class="lazyload"
        alt="image with artdirection" />
</picture>

<!-- picture with explicit w descriptors and data-sizes="auto" -->
<picture>
	<!--[if IE 9]><audio><![endif]-->
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff 500w,
		    http://placehold.it/750x900/11e87f/fff 750w"
		media="--small" />
	<source
		data-srcset="http://placehold.it/700x300 700w,
			http://placehold.it/1050x450 1050w"
		media="--medium" />
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff 1400w,
			http://placehold.it/2100x900/e8117f/fff 2100w"
		media="--large" />
	<source
	    data-srcset="http://placehold.it/1800x900/117fe8/fff 1800w,
	    	http://placehold.it/2700x1350/117fe8/fff 2700w" />
	<!--[if IE 9]></audio><![endif]-->
	<img
		src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
		class="lazyload"
		data-sizes="auto"
		alt="image with artdirection" />
</picture>

<!-- use of width descriptors + simple sizes value with px unit -->
<img
    data-srcset="image1.jpg 300w,
    image3.jpg 600w"
    sizes="300px"
    class="lazyload" />
```
