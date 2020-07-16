# lazysizes

**lazysizes** is a fast (jank-free), SEO-friendly and self-initializing lazyloader for images (including responsive images ``picture``/``srcset``), iframes, scripts/widgets and much more. It also prioritizes resources by differentiating between crucial in view and near view elements to make perceived performance even faster.

It may become also your number one tool to integrate responsive images. It can automatically calculate the ``sizes`` attribute for your responsive images, it allows you to share media queries for your ``media`` attributes with your CSS, helping to separate layout (CSS) from content/structure (HTML) and it makes integrating responsive images into any environment really simple. It also includes a set of optional plugins to further extend its functionality.

## How to

1. Download the [lazysizes.min.js script](http://afarkas.github.io/lazysizes/lazysizes.min.js) and include **lazysizes** in your webpage. (Or install via npm: ``npm install lazysizes --save`` or bower ``bower install lazysizes --save``)

    ```html
    <script src="lazysizes.min.js" async=""></script>
    ```

    Or:
	```js
	import 'lazysizes';
	// import a plugin
	import 'lazysizes/plugins/parent-fit/ls.parent-fit';

	// Note: Never import/require the *.min.js files from the npm package.
	```

	Note: For more information see [here](#include-early).

2. lazysizes does not need any JS configuration: Add the ``class`` ``"lazyload"`` to your images/iframes in conjunction with a ``data-src`` and/or ``data-srcset`` attribute. Optionally you can also add a ``src`` attribute with a low quality image:

    ```html
    <!-- non-responsive: -->
    <img data-src="image.jpg" class="lazyload" />
    ```

    ```html
    <!-- responsive example with automatic sizes calculation: -->
    <img
        data-sizes="auto"
        data-src="image2.jpg"
        data-srcset="image1.jpg 300w,
        image2.jpg 600w,
        image3.jpg 900w" class="lazyload" />
    ```

    ```html
    <!-- iframe example -->
    <iframe frameborder="0"
    	class="lazyload"
        allowfullscreen=""
        data-src="//www.youtube.com/embed/ZfV-aYdU4uE">
    </iframe>
    ```


## [Demo with code examples](http://afarkas.github.io/lazysizes/#examples)
Can be seen [here](http://afarkas.github.io/lazysizes/#examples)

## Responsive image support (picture and/or srcset)

Lazysizes is built upon the Responsive image standard and extends it with additional functionality. For full cross browser responsive image support you must use either a full polyfill like [picturefill](https://github.com/scottjehl/picturefill) or use the extreme lightweight partial [respimg polyfill plugin](plugins/respimg) or the [responsive image on demand plugin](plugins/rias). Alternatively, you can simply define a fallback src via the ``data-src`` attribute. If you want to learn more about the responsive image syntax read "[The anatomy of responsive images](https://jakearchibald.com/2015/anatomy-of-responsive-images/)".

## What makes lazysizes so awesome:
**lazysizes** is different than other lazy image loaders.

1. **Detects any visibility changes on current and future lazyload elements in any web environment automatically**: The script works as an universal, self-initializing, self-configuring and self-destroying component and detects any changes to the visibility of any current and future image/iframe elements automatically no matter whether it becomes visible through a user scroll, a CSS animation triggered through ``:hover`` or through any kind of JS behavior (carousel, slider, infinite scroll, masonry, isotope/filtering/sorting, AJAX, SPAs...). It also works automatically in conjunction with any kind of JS-/CSS-/Frontend-Framework (jQuery mobile, Bootstrap, Backbone, Angular, React, Ember (see also the [attrchange/re-initialization extension](plugins/attrchange))).
2. **Future-proof**: It directly includes standard responsive image support (``picture`` and ``srcset``)
3. **Separation of concerns**: For responsive image support it adds an automatic ``sizes`` calculation as also alias names for media queries feature. There is also no JS change needed if you add a scrollable container with CSS (overflow: auto) or create a mega menu containing images.
4. **Performance**: It's based on highly efficient, best practice code (runtime **and** network) to work jank-free at 60fps and can be used with hundreds of images/iframes on CSS and JS-heavy pages or webapps.
5. **Extendable**: It provides JS and CSS hooks to extend lazysizes with any kind of lazy loading, lazy instantiation, in view callbacks or effects (see also the [available plugins/snippets](#plugins)).
6. **Intelligent prefetch/Intelligent resource prioritization**: lazysizes prefetches/preloads near the view assets to improve user experience, but only while the browser network is idling (see also ``expand``, ``expFactor`` and ``loadMode`` options). This way in view elements are loaded faster and near of view images are preloaded lazily before they come into view.
7. **Lightweight, but mature solution**: lazysizes has the right balance between a lightweight and a fast, reliable solution
8. **SEO improved**: lazysizes does not hide images/assets from Google. No matter what markup pattern you use. Google doesn't scroll/interact with your website. lazysizes detects, whether the user agent is capable to scroll and if not, reveals all images instantly.

## More about the API
**lazysizes** comes with a simple markup and JS API. Normally you will only need to use the markup API.

### Markup API
Add the ``class`` ``lazyload`` to all ``img`` and ``iframe`` elements, which should be loaded lazy. *Instead* of a ``src`` or ``srcset`` attribute use a ``data-src`` or ``data-srcset`` attribute:

```html
<img data-src="image.jpg" class="lazyload" />
<!-- retina optimized image: -->
<img data-srcset="responsive-image1.jpg 1x, responsive-image2.jpg 2x" class="lazyload" />
```
#### <a name="data-sizes-auto"></a>Automatically setting the `sizes` attribute
**lazysizes** supports setting the ``sizes`` attribute automatically, corresponding to the current size of your image - just set the value of ``data-sizes`` to  ``auto``.

```html
<img
	data-sizes="auto"
	data-srcset="responsive-image1.jpg 300w,
	    responsive-image2.jpg 600w,
	    responsive-image3.jpg 900w"
    class="lazyload" />
```

**<a name="sizes-calculation"></a>Important: How ``sizes`` is calculated**: The automatic sizes calculation uses the display width of the image. This means that the width of the image has to be calculable at least approximately before the image itself is loaded (This means you can not use `width: auto`). Often the following general CSS rule might help: ``img[data-sizes="auto"] { display: block; width: 100%; }`` (see also [specifying image/iframe dimensions with the recommended aspect ratio definition](#specify-dimensions)). If it is below ``40`` (can be configured through the ``minSize`` option), lazysizes traverses up the DOM tree until it finds a parent which is over ``40`` and uses this number.

The width auto-calculated by lazysizes can be modified using the ``lazybeforesizes`` event ([lazybeforesizes documentation](#lazybeforesizes-documentation)). Alternatively, the [parent fit plugin](plugins/parent-fit) can be used for sizing images to fit a parent / container, and is the only solution when an image's height needs to be taken into account when fitting it to its container (This also includes the use of `object-fit`).

The ``data-sizes="auto"`` feature only makes sense if you use the ``data-srcset`` attribute with *width* descriptors which allows the most appropriate image can be selected (It does not make sense if you use the x descriptor or only ``src``.).

## Recommended/possible markup patterns

lazysizes allows you to write an endless variety of different markup patterns. Find your own/best pattern or choose one of the following. (All of the following patterns can be also used for art direction using the ``picture`` element.)

### Simple pattern

Add the class ``lazyload`` and simply omit the ``src`` attribute  or add a data uri as fallback ``src``.

```html

<!--  responsive adaptive example -->

<img
	class="lazyload"
	data-srcset="image.jpg 1x, image2.jpg 2x"
    alt="my image" />
<!--  retina optimized example -->
<img class="lazyload"
	data-srcset="progressive-image.jpg 1x, progressive-image2.jpg 2x"
    alt="my image" />

<!-- or non-responsive: -->
<img
	data-src="image.jpg"
	class="lazyload" />
```

Note: In case you are using either ``srcset``/``data-srcset`` or ``picture``, we recommend to extend this pattern with either a ``data-src`` (see next pattern: "Combine ``data-srcset`` with ``data-src``") or with a suitable ``src`` attribute (see:  "modern pattern" or "LQIP").

### Combine ``data-srcset`` with ``data-src``

In case you want to use responsive images for supporting browsers, but don't want to include a polyfill, simply combine your ``data-srcset`` with a ``data-src`` attribute.

```html
<!-- responsive example: -->
<img
	data-sizes="auto"
    data-src="image3.jpg"
	data-srcset="image3.jpg 600w,
	    image1.jpg 220w,
	    image2.jpg 300w,
	    image3.jpg 600w,
	    image4.jpg 900w"
	class="lazyload" />
```

Note: Due to the fact that the ``data-src`` will also be picked up by "Read-Later" Apps and other tools (for example Pin it button), this pattern also makes sense if you use a polyfill. In case you don't use a polyfill it is recommended that the first image candidate matches the fallback `src`.

### LQIP/blurry image placeholder/Blur up image technique
If you are using the LQIP (Low Quality Image Placeholder) pattern, simply add a low quality image as the ``src``:

```html
<!-- responsive example: -->
<img
	data-sizes="auto"
    src="lqip-src.jpg"
	data-srcset="lqip-src.jpg 220w,
    image2.jpg 300w,
    image3.jpg 600w,
    image4.jpg 900w" class="lazyload" />

<!-- or non-responsive: -->
<img src="lqip-src.jpg" data-src="image.jpg" class="lazyload" />
```

The LQIP technique can be enhanced by combining it with CSS transitions/animation to sharpen/unblur or overfade the LQIP image.

Please also have a look at our [lazysizes Blur Up plugin](https://jsfiddle.net/trixta/v0oq0412/embedded/result/) (recommended).

```html
<style>
	.blur-up {
		-webkit-filter: blur(5px);
		filter: blur(5px);
		transition: filter 400ms, -webkit-filter 400ms;
	}

	.blur-up.lazyloaded {
		-webkit-filter: blur(0);
		filter: blur(0);
	}
</style>

<img src="lqip-src.jpg" data-src="image.jpg" class="lazyload blur-up" />

<!-- ... -->

<style>
	.fade-box .lazyload,
	 .fade-box .lazyloading {
		opacity: 0;
		transition: opacity 400ms;
	}

	.fade-box img.lazyloaded {
		opacity: 1;
	}
</style>

<div class="ratio-box fade-box">
	<img src="lqip-src.jpg" />
	<img data-src="image.jpg" class="lazyload" />
</div>
```


### modern transparent ``srcset`` pattern

Combine a normal ``src`` attribute with a transparent or low quality image as ``srcset`` value and a ``data-srcset`` attribute. This way modern browsers will lazy load without loading the ``src`` attribute and all others will simply fallback to the initial ``src`` attribute (without lazyload). (This nice pattern originated from @ivopetkov.)

```html
<img
    src="image3.jpg"
    srcset="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
	data-srcset="image3.jpg 600w,
		image1.jpg 220w,
	    image2.jpg 300w,
	    image4.jpg 900w"
	data-sizes="auto"
	class="lazyload" />
```

### The noscript pattern

In case disabled JavaScript is a concern you can combine this simple pattern with an image inside a ``noscript`` element.

```html
<style>
	.no-js img.lazyload {
    	display: none;
    }
</style>

<!-- noscript pattern -->
<noscript>
	<img src="image.jpg" />
</noscript>
<img src="transparent.jpg" data-src="image.jpg" class="lazyload" />
```

Note: As an alternative to the noscript pattern also checkout the [noscript extension](plugins/noscript).

### [data-expand] attribute
Normally lazysizes will expand the viewport area to lazy preload images/iframes which might become visible soon. This value can be adjusted using the ``expand`` option.

Additionally, this general option can be overridden with the ``data-expand`` attribute for each element. Different than the general ``expand`` option the ``data-expand`` attribute also accepts negative values (All numbers but ``0`` are accepted!).

This becomes especially handy to add unveiling effects for teasers or other elements:


```html
<style>
.lazyload,
.lazyloading {
	opacity: 0;
}
.lazyloaded {
	opacity: 1;
	transition: opacity 300ms;
}
</style>

<div class="teaser lazyload" data-expand="-20">
    <img data-src="image.jpg" class="lazyload" />
    <h1>Teaser Title</h1>
    <p>...</p>
</div>
```

### CSS API
lazysizes adds the class ``lazyloading`` while the images are loading and the class ``lazyloaded`` as soon as the image is loaded. This can be used to add unveil effects:

```css
/* fade image in after load */
.lazyload,
.lazyloading {
	opacity: 0;
}
.lazyloaded {
	opacity: 1;
	transition: opacity 300ms;
}
```

```css
/* fade image in while loading and show a spinner as background image (good for progressive images) */

.lazyload {
	opacity: 0;
}

.lazyloading {
	opacity: 1;
	transition: opacity 300ms;
	background: #f7f7f7 url(loader.gif) no-repeat center;
}
```

### Broken image symbol

In case you are using an `alt` attribute but do not declare a `src`/`srcset` attribute you will end up with a broken image symbol.

There are two easy ways to deal with it.

Either define a `src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="` or add the following CSS.

```css
img.lazyload:not([src]) {
	visibility: hidden;
}
```


### JS API
**lazysizes** automatically detects new elements with the class ``lazyload`` so you won't need to call or configure anything in most situations.

#### JS API - options

Options can be set by declaring a global configuration option object named ``lazySizesConfig``. This object must be defined before the lazysizes script. A basic example:

```js
window.lazySizesConfig = window.lazySizesConfig || {};

// use .lazy instead of .lazyload
window.lazySizesConfig.lazyClass = 'lazy';

// use data-original instead of data-src
lazySizesConfig.srcAttr = 'data-original';

//page is optimized for fast onload event
lazySizesConfig.loadMode = 1;
```

In case you are using a module bundler it is recommended to change the options directly after importing the `lazysizes` module:

```js
import lazySizes from 'lazysizes';
// other imports ...

lazySizes.cfg.lazyClass = 'lazy';
```

Here the list of options:

* ``lazySizesConfig.lazyClass`` (default: ``"lazyload"``): Marker class for all elements which should be lazy loaded (There can be only one ``class``. In case you need to add some other element, without the defined class, simply add it per JS: ``$('.lazy-others').addClass('lazyload');``)
* ``lazySizesConfig.preloadAfterLoad`` (default: ``false``): Whether lazysizes should load all elements after the window onload event. Note: lazySizes will then still download those not-in-view images inside of a lazy queue, so that other downloads after onload are not blocked.)
* ``lazySizesConfig.preloadClass`` (default: ``"lazypreload"``): Marker class for elements which should be lazy pre-loaded after onload. Those elements will be even preloaded, if the ``preloadAfterLoad`` option is set to ``false``. Note: This *class* can be also dynamically set (``$currentSlide.next().find('.lazyload').addClass('lazypreload');``).
* ``lazySizesConfig.loadingClass`` (default: ``"lazyloading"``): This ``class`` will be added to ``img`` element as soon as image loading starts. Can be used to add unveil effects.
* ``lazySizesConfig.loadedClass`` (default: ``"lazyloaded"``): This ``class`` will be added to any element as soon as the image is loaded or the image comes into view. Can be used to add unveil effects or to apply styles.
* ``lazySizesConfig.expand`` (default: ``370-500``): The ``expand`` option expands the calculated visual viewport area in all directions, so that elements can be loaded before they become visible. The default value is calculated depending on the viewport size of the device. (Note: Reasonable values are between ``300`` and ``1000`` (depending on the ``expFactor`` option.) In case you have a lot of small images or you are using the LQIP pattern you can lower the value, in case you have larger images set it to a higher value. Also note, that lazySizes will dynamically shrink this value to ``0`` if the browser is currently downloading and expand it if the browser network is currently idling and the user not scrolling (by multiplying the ``expand`` option with ``1.5`` (``expFactor``)). This option can also be overridden with the ``[data-expand]`` attribute.
* ``lazySizesConfig.minSize`` (default: ``40``): For ``data-sizes="auto"`` feature. The minimum size of an image that is used to calculate the ``sizes`` attribute. In case it is under ``minSize`` the script traverses up the DOM tree until it finds a parent that is over ``minSize``.
* ``lazySizesConfig.srcAttr`` (default: ``"data-src"``): The attribute, which should be transformed to ``src``.
* ``lazySizesConfig.srcsetAttr`` (default: ``"data-srcset"``): The attribute, which should be transformed to ``srcset``.
* ``lazySizesConfig.sizesAttr`` (default: ``"data-sizes"``): The attribute, which should be transformed to ``sizes``. Makes almost only makes sense with the value ``"auto"``. Otherwise, the ``sizes`` attribute should be used directly.
* ``lazySizesConfig.customMedia`` (default: ``{}``): The ``customMedia`` option object is an alias map for different media queries. It can be used to separate/centralize your multiple specific media queries implementation (layout) from the ``source[media]`` attribute (content/structure) by creating labeled media queries. (See also the [custommedia extension](plugins/custommedia)).
* ``lazySizesConfig.loadHidden`` (default: ``true``): Whether to load `visibility: hidden` elements. Important: lazySizes will load hidden images always delayed. If you want them to be loaded as fast as possible you can use `opacity: 0.001` but never `visibility: hidden` or `opacity: 0`.
* ``lazySizesConfig.ricTimeout`` (default: ``0``): The timeout option used for the `requestIdleCallback`. Reasonable values between: 0, 100 - 1000. (Values below 50 disable the `requestIdleCallback` feature.)
* ``lazySizesConfig.throttleDelay`` (default: ``125``): The timeout option used to throttle all listeners. Reasonable values between: 66 - 200.
```html
<script>
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.customMedia = {
    '--small': '(max-width: 480px)',
    '--medium': '(max-width: 900px)',
    '--large': '(max-width: 1400px)',
};
</script>


<picture>
	<!--[if IE 9]><video style="display: none;><![endif]-->
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
    <!--[if IE 9]></video><![endif]-->
    <img

        data-src="http://placehold.it/1400x600/e8117f/fff"
        class="lazyload"
        alt="image with artdirection" />
</picture>
```
* ``lazySizesConfig.expFactor`` (default: ``1.5``): The ``expFactor`` is used to calculate the "preload expand", by multiplying the normal ``expand`` with the ``expFactor`` which is used to preload assets while the browser is idling (no important network traffic and no scrolling). (Reasonable values are between ``1.5`` and ``4`` depending on the ``expand`` option).
* ``lazySizesConfig.hFac`` (default: ``0.8``): The ``hFac`` (horizontal factor) modifies the horizontal expand by multiplying the ``expand`` value with the ``hFac`` value. Use case: In case of carousels there is often the wish to make the horizontal expand narrower than the normal vertical expand option. Reasonable values are between 0.4 - 1. In the unlikely case of a horizontal scrolling website also 1 - 1.5.
* ``lazySizesConfig.loadMode`` (default: ``2``): The ``loadMode`` can be used to constrain the allowed loading mode. Possible values are 0 = don't load anything, 1 = only load visible elements, 2 = load also very near view elements (``expand`` option) and 3 = load also not so near view elements (``expand`` * ``expFactor`` option). This value is automatically set to ``3`` after onload. Change this value to ``1`` if you (also) optimize for the onload event or change it to ``3`` if your onload event is already heavily delayed.
* ``lazySizesConfig.init`` (default: ``true``): By default lazysizes initializes itself, to load in view assets as soon as possible. In the unlikely case you need to setup/configure something with a later script you can set this option to ``false`` and call ``lazySizes.init();`` later explicitly.

#### JS API - events
**lazysizes** provides three events to modify or extend the behavior of **lazysizes**.

* ``lazybeforeunveil``: This event will be fired on each lazyload element right before of the "unveil" transformation. This event can be used to extend the unveil functionality. In case the event is ``defaultPrevented`` the default transformation action will be prevented (see also the [ls.unveilhooks.js plugin](plugins/unveilhooks/ls.unveilhooks.js)):
```js
//add simple support for background images:
document.addEventListener('lazybeforeunveil', function(e){
    var bg = e.target.getAttribute('data-bg');
    if(bg){
        e.target.style.backgroundImage = 'url(' + bg + ')';
    }
});
//or add AJAX loading
//<div class="lazyload" data-ajax="my-url.html"></div>

$(document).on('lazybeforeunveil', function(){
	var ajax = $(e.target).data('ajax');
    if(ajax){
        $(e.target).load(ajax);
    }
});
```

The ``lazybeforeunveil`` can also be used for lazy initialization and due to the fact that lazysizes also detects new elements in the DOM automatically also for auto- and self-initialization of UI widgets:

```html
<script>
document.addEventListener('lazybeforeunveil', function(e){
    $(e.target)
        .filter('.slider')
        .slider({
            sliderOption: true
        })
    ;
});

document.addEventListener('lazybeforeunveil', function(e){
    $(e.target)
        .filter('.chart')
        .chart({
            animate: true
        })
    ;
});
</script>

<div class="slider lazyload lazypreload"></div>

<div class="chart lazyload" data-expand="-10"></div>
```
* <a id="lazyloaded-documentation"></a>`lazyloaded`: After the image is fully loaded lazysizes dispatches a `lazyloaded` event. While this often duplicates the native `load` event it is often more convenient to use.

* <a id="lazybeforesizes-documentation"></a>``lazybeforesizes``: This event will be fired on each element with the ``data-sizes="auto"`` attribute right before the calculated ``sizes`` attribute will be set. The ``event.detail.width`` property is set to the calculated width of the element and can be changed to any number. In case the event is ``defaultPrevented`` the ``sizes`` attribute won't be set. See also the [parent-fit extension](plugins/parent-fit).
```js
$(document).on('lazybeforesizes', function(e){
    //use width of parent node instead of the image width itself
    e.detail.width = $(e.target).parents(':not(picture)').innerWidth() || e.detail.width;
});
```

#### JS API - methods
##### ``lazySizes.loader.unveil(DOMNode)``

In case a developer wants to show an image even if it is not inside the viewport the ``lazySizes.loader.unveil(DOMNode)`` can be called:

```js
lazySizes.loader.unveil(imgElem);
```

Note: As a more lazy alternative the ``lazypreload`` class can be set: ``$(imgElem).addClass('lazypreload');``.

##### ``lazySizes.autoSizer.checkElems()``

In case one or more image elements with the attribute ``data-sizes="auto"`` have changed in size ``lazySizes.autoSizer.updateElems`` can be called (For example to implement element queries):

```js
lazySizes.autoSizer.checkElems();
```

##### ``lazySizes.loader.checkElems()``

Tests whether new elements has came into view. Normally this method only needs to be called, if ``lazySizesConfig.loadMode`` was set to ``0``.

##### ``lazySizes.init()``

LazySizes initializes itself automatically. In case you set ``lazySizesConfig.init`` to ``false`` you need to explicitly call ``lazySizes.init()``. Note: You can speed up initial loading of in view images if you call `lazySizesConfig.init()` explicitly after lazysizes and all plugins are loaded.

```html
<script>
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.init = false;
</script>

<script src="lazysizes.js"></script>
<script src="other-script.js"></script>
<script>
lazySizes.init();
</script>
```

## Browser Support
**lazysizes** supports all browsers, that support [``document.getElementsByClassName``](http://caniuse.com/#feat=getelementsbyclassname) (== all browsers but not IE8-). In case you need to support IE8, see also the [noscript extension](plugins/noscript/README.md#ie8) (or use a modified noscript pattern or the LQIP pattern).

## Contributing
Fixes, PRs and issues are always welcome, make sure to create a new branch from the **master** (not the gh-pages branch), validate against JSHint and test in all browsers. In case of an API/documentation change make sure to also document it here in the readme.md.
### Build
Run `npx grunt` to validate JSHint and uglify/minify all files.
### Tests
Run `npx serverino -p 3333` and navigate to [http://localhost:3333/tests/](http://localhost:3333/tests/)

## <a name="plugins"></a>Available plugins in this repo
It is recommended to concat all plugins together with lazySizes. In case you don't concat it is recommended to include the plugin scripts *before* the lazySizes main script.

### [respimg polyfill plugin](plugins/respimg)

The respimg polyfill plugin is an extremely lightweight alternate polyfill for the most important subsets of responsive images (srcset and picture).

### [OPTIMUMX plugin](plugins/optimumx)
The ``srcset`` attribute with the *w* descriptor and ``sizes`` attribute automatically also includes high DPI images. But each image has a different optimal pixel density, which might be lower (for example 1.5x) than the pixel density of your device (2x or 3x). This information is unknown to the browser and therefore can't be optimized for. The [lazySizes optimumx extension](plugins/optimumx) gives you more control to trade between perceived quality vs. perceived performance.

### [parent-fit extension](plugins/parent-fit)
The [parent fit plugin](plugins/parent-fit) extends the ``data-sizes="auto"`` feature to also calculate the right ``sizes`` for ``object-fit: contain|cover`` image elements and other **height** ( and width) constrained image elements in general.

### [object-fit polyfill extension](plugins/object-fit)
The [object fit polyfill plugin](plugins/object-fit) polyfills the `object-fit` and the `object-position` property in non supporting browsers.

### [blur up / effect plugin](plugins/blur-up)
The [blur up / effect plugin](plugins/blur-up) allows you to create [great over fade / blur up effects](https://jsfiddle.net/trixta/v0oq0412/embedded/result/) with low quality image placeholder, which improves the user experience and perceived performance in case you are using a low quality image approach.

### [attrchange / re-initialization extension](plugins/attrchange)  (strongly recommended if you use React, Angular etc.)
In case you are changing the ``data-src``/``data-srcset`` attributes of already transformed lazyload elements, you must normally also re-add the ``lazyload`` class to the element.

This [attrchange / re-initialization extension](plugins/attrchange) automatically detects changes to your ``data-*`` attributes and adds the class for you.

### [artdirect plugin](plugins/artdirect)
The [artdirect plugin](plugins/artdirect) allows you to fully control art direction via CSS.


### Other [plugins/extensions](plugins)

There are also other plugins/extension in the [plugins folder](plugins). As always you are open to create new ones for your project.

## <a name="specify-dimensions"></a>Tip: Specifying image dimensions (minimizing reflows and avoiding page jumps)
To minimize reflows, content jumping or unpredictable behavior with some other JS widgets (isotope, masonry, some sliders/carousels...) the width **and** the height of an image should be calculable by the browser before the image source itself is loaded:

```html
<img

    style="width: 350px; height: 150px;"
	data-srcset="http://placehold.it/350x150 1x,
    http://placehold.it/700x300 2x"
    data-src="http://placehold.it/350x150"
    class="lazyload" />
```

For flexible responsive images the [CSS intrinsic ratio scaling technique](http://www.mademyday.de/css-height-equals-width-with-pure-css.html) should be used:

```html
<style>
.ratio-container {
    position: relative;
}
.ratio-container:after {
    content: '';
    display: block;
    height: 0;
    width: 100%;
    /* 16:9 = 56.25% = calc(9 / 16 * 100%) */
    padding-bottom: 42.86%;
}
.ratio-container > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: block;
}
</style>

<div class="ratio-container">
    <img

        data-sizes="auto"
        data-srcset="http://placehold.it/175x75 175w,
        http://placehold.it/350x150 350w,
        http://placehold.it/700x300 700w,
        http://placehold.it/1400x600 1400w"
        data-src="http://placehold.it/700x300"
        class="lazyload" />
</div>
```

In case you want to dynamically calculate your intrinsic ratios for many different formats you can vary the pattern to something like this:

```html
<style>
.ratio-box {
	position: relative;
	height: 0;
	display: block;
	width: 100%;
	/* padding-bottom is calculated and rendered in to HTML */
}

.ratio-box img,
.ratio-box iframe,
.ratio-box video {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: block;
}
</style>

<div class="ratio-box" style="padding-bottom: 42.85% /* calc(75 / 175 * 100%)*/;">
    <img

        data-sizes="auto"
        data-srcset="http://placehold.it/175x75 175w,
        http://placehold.it/350x150 350w,
        http://placehold.it/700x300 700w,
        http://placehold.it/1400x600 1400w"
        data-src="http://placehold.it/700x300"
        class="lazyload" />
</div>
```

In case the exact ratio of your image is unknown you can also vary the intrinsic ratio like this:

```html
<style>
.ratio-container {
    position: relative;
}
.ratio-container:after {
    content: '';
    display: block;
    height: 0;
    width: 100%;
    /* 16:9 = 56.25% = calc(9 / 16 * 100%) */
    padding-bottom: 56.25%;
    content: "";
}
.ratio-container > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/* unknown ration variation */
.unknown-ratio-container > * {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
}
</style>

<div class="ratio-container unknown-ratio-container">
    <img

        data-src="http://placehold.it/350x150"
        class="lazyload" />
</div>
```

or at least add a ``min-height`` (and ``min-width``) to minimize content jumps:

```css
.lazyload,
.lazyloading {
	min-height: 200px;
}
```

**Note**:

* If you use the "unknown intrinsic ratio pattern" and the width of the loaded image will not (approximately) match the width of its container, the ``data-sizes="auto"`` feature will not be effective when used on its own. In this situation, the most appropriate size for the image to fit in the available space can be calculated automatically using the [parent fit plugin](plugins/parent-fit).

### Updating layout of JS widgets
In case you can't specify the image dimensions using CSS or one of the above suggested methods and your JS widgets have problems to calculate the right dimensions. You can use the following pattern to update your JS widgets (sliders/masonry):

```js
$('.my-widget').each(function(){
    var $module = $(this);
    var update = function(){
        $module.myWidget('updateLayout');
    };

    // Note: Instead of waiting for all images until we initialize the widget
    // we use event capturing to update the widget's layout progressively.
    this.addEventListener('load', update, true);

    $module.myWidget();
});
```

For this update pattern you may want to combine this at least with the ``min-height`` pattern explained above.

## <a id="include-early"></a>Tip: Where/How to include lazySizes
While lazy loading is a great feature, it is important for users that crucial in view images are loaded as fast as possible. (Most users start to interact with a page after in view images are loaded.)

In case you normally combine all your scripts into one large script and add this to the bottom of your page, it can be better for perceived performance to generate two or sometimes more script packages: One small package, which includes all scripts which have heavy influence on the content or the UI and another larger one which includes the normal behavior of the page.

This smaller script, which should include lazySizes (and all its plugins), should then be placed **before** any other blocking elements (i.e.: script(s)) at the end of the body or after any blocking elements (i.e.: scripts, stylesheets) in the head to load the crucial content as fast possible. (Note: It might make also sense to call `lazySizes.init();` explicitly right after lazySizes and all its plugins are added.)

## Why lazysizes
In the past, I often struggled using lazy image loaders, because the "main check function" is called repeatedly and with a high frequency. Which makes it hard to fulfill two purposes runtime and memory efficiency. And looking into the source code of most so called lazy loaders often also unveils lazy developers...

But in a world of responsive retina optimized images on the one hand and JS widgets like carousels or tabs (a lot of initially hidden images) on the other hand lazy loading images becomes more and more important, so I created this project.

**lazysizes** is different:

Due to the fact, that it is designed to be invoked with a high frequency and therefore works highly efficient, it was possible to hook into all kinds of events as a mutationobserver meaning this lazyloader works as a simple drop in solution - you simply write/render your markup and no matter whether the ``.lazyload`` element was added by AJAX or revealed by a JS or CSS animation it will be picked up by **lazysizes**.

```html
<!-- responsive example: -->
<img
	data-sizes="auto"

	data-srcset="image2.jpg 300w,
    image3.jpg 600w,
    image4.jpg 900w"
    data-src="image3.jpg"
    class="lazyload" />

<!-- or non-responsive: -->
<img
    data-src="image.jpg"
    class="lazyload" />
```
