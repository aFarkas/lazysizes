#lazysizes optimumx plugin

**lazysizes** optimumx plugin helps you to limit/constrain the maximum resolution in case the **w descriptor** is used. Simply add the attribute ``data-optimumx="1.6"`` to constrain the max resolution to 1.6.

It gives you therefore more control to trade perceived quality against perceived performance on HD retina devices, than the HTML responsive image standard gives you.

This plugin depends on the ``data-sizes="auto"`` feature of **lazysizes**.

```html
<img
    data-srcset="http://placehold.it/300x150 300w,
    	http://placehold.it/700x300 700w,
    	http://placehold.it/1400x600 1400w,
    	http://placehold.it/2800x1200 2800w"
     data-sizes="auto"
     data-optimumx="1.5"
     class="lazyload"
     src="http://placehold.it/300x150"
     alt="flexible image" />
```

A **simple [demo can be seen here](http://afarkas.github.io/lazysizes/optimumx/)**. This extension also supports art-directed responsive images using the ``picture`` element.

##Usage

```html
<!-- concat the following scripts into one and add them to your HTML -->
<script src="lazysizes.min.js"></script>
<script src="ls.optimumx.js"></script>

<!-- then use it -->
<img
    data-srcset="http://placehold.it/300x150 300w,
    	http://placehold.it/700x300 700w,
    	http://placehold.it/1400x600 1400w,
    	http://placehold.it/2800x1200 2800w"
     data-sizes="auto"
     data-optimumx="1.5"
     class="lazyload"
     src="http://placehold.it/300x150"
     alt="flexible image" />
```

In case you want to use a CDN you can use the combohandler service provided by jsDelivr:

```html
<script src="http://cdn.jsdelivr.net/g/lazysizes(lazysizes.min.js+plugins/optimumx/ls.optimumx.min.js)" async=""></script>
```

**Note**: For full cross-browser support either a [responsive images polyfill like respimage or picturefill](https://github.com/aFarkas/respimage) or the [neat Responsive Images as a Service extension (RIaS)](../rias) or the [extreme lightweight alternate mini respimg polyfill extension](../respimg) needs to be used.

```html
<!--  RIaS example: -->
<script src="http://cdn.jsdelivr.net/g/lazysizes(lazysizes.min.js+plugins/optimumx/ls.optimumx.min.js+plugins/rias/ls.rias.min.js)" async=""></script>

<img
    data-src="http://wit.wurfl.io/w_{width}/http://wurfl.io/assets/sunsetbeach.jpg"
	data-sizes="auto"
	data-optimumx="1.5"
	class="lazyload"
	alt="" />
```

```html
<!--  respimage example: -->
<script>
    function loadJS(u){var r=document.getElementsByTagName("script")[0],s=document.createElement("script");s.src=u;r.parentNode.insertBefore(s,r);}

    if(!window.HTMLPictureElement || !('sizes' in document.createElement('img'))){
        loadJS("http://cdn.jsdelivr.net/g/respimage(respimage.min.js)");
    }
</script>

<!--  your stylesheets -->

<script src="http://cdn.jsdelivr.net/g/lazysizes(lazysizes.min.js+plugins/optimumx/ls.optimumx.min.js)" async=""></script>
```

###The ``getOptimumX`` option callback

Normally the image specific optimal pixel density should be added as a floating point number using the ``data-optimumx`` attribute. Additionally it is also possible to add the ``"auto"`` keyword as a value of the ``data-optimumx`` attribute. In that case the ``getOptimumX`` option callback is invoked with the element as the first argument.

```html
<script>
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.getOptimumX = function(element){
    return window.devicePixelRatio > 1.6 ? devicePixelRatio * 0.9 : 1;
};
</script>

<img
    data-srcset="http://placehold.it/300x150 300w,
    	http://placehold.it/700x300 700w,
    	http://placehold.it/1400x600 1400w,
    	http://placehold.it/2800x1200 2800w"
     data-sizes="auto"
     data-optimumx="auto"
     class="lazyload"
     src="http://placehold.it/300x150"
     alt="flexible image" />
```

The predefined (ugly) ``getOptimumX`` callback looks like this:

```js
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.config.getOptimumX = function(/*element*/){
    var dpr = window.devicePixelRatio || 1;
    if(dpr > 2.5){
        dpr *= 0.6; // returns 1.8 for 3
    } else if(dpr > 1.9){
        dpr *= 0.8; // returns 1.6 for 2
    } else {
        dpr -= 0.01;
    }
    return Math.min(Math.round(dpr * 100) / 100, 2);
};
```

##<a name="compressive-picture-pattern"></a>Background information: Compressive picture pattern

From a perceived performance vs. perceived quality standpoint the best way to deal with High DPI images is to serve higher compressed candidates to clients with high resolution displays.

This is due to the fact, that on higher DPI displays small details can be compressed more aggressively.

For native images support the ``picture`` element can be used to achieve the result:

```html
<picture>
<!--[if IE 9]><video style="display: none;"><![endif]-->
	<source
	    data-srcset="image-w1600-q50.jpg 1600w,
	        image-w1440-q50.jpg 1440w,
	        image-w1200-q50.jpg 1200w,
	        image-w800-q50.jpg 800w,
	        image-w600-q50.jpg 600w"
	    media="(-webkit-min-device-pixel-ratio: 1.9),
	        (min-resolution: 1.9dppx)" />
	<source
    	data-srcset="image-w1440-q80.jpg 1440w,
                image-w1200-q80.jpg 1200w,
                image-w800-q80.jpg 800w,
                image-w600-q80.jpg 600w,
                image-w400-q80.jpg 400w" />
<!--[if IE 9]></video><![endif]-->
<img
    src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    data-sizes="auto"
    class="lazyload"
    alt="picture but without artdirection" />
</picture>
```

Or in case you are using the [Responsive Images as a Service extension (RIaS)](../rias):

```html
<script>
document.addEventListener('lazyriasmodifyoptions', function(data){
    data.detail.quality = (window.devicePixelRatio || 1) > 1.9 ?
        50 :
        80;
});
</script>

<img
    data-src="image-w{width}-q{quality}.jpg"
    data-sizes="auto"
    class="lazyload"
    alt="" />
```

Unfortunately these techniques also double or even triple (think 1x: 65-85q, 2x: 30-50q, 3x/4x 15-40q) the amount of generated image candidates. In case you don't have so much resources the optimumx extension in conjunction with proper image compression is the best thing you can do.

But be aware each image has different characteristics: While some images look great on a HIGH DPI device even with a ``data-optimumx="1.2"`` other will need a much higher density for a good perceived quality.

##<a name="lying-sizes"></a>Background information: Lying sizes attribute

There is also another much more lightweight way to get a similar effect. Instead of parsing and constraining the ``srcset`` to meet the ``data-optimumx`` constraint, there is also the possibility to modify the ``sizes`` attribute instead.

A ``data-optimumx`` implementation with the ``lazybeforesizes`` event could then look something like this:

```html
<script>
document.addEventListener('lazybeforesizes', function(e){
    var maxx = parseFloat(e.target.getAttribute('data-optimumx') || '', 10);
    var dpr = (window.devicePixelRatio || 1);
    if(maxx && maxx < (window.devicePixelRatio || 1)){
        e.detail.width = e.detail.width * (maxx / dpr);
    }
});
</script>

<img class="lazyload" data-sizes="auto" data-optimumx="1.5" data-srcset="..." />
```

Compared to the size of this plugin this is a very neat, simple and lightweight technique.

But this technique should be used with caution because the browsers algorithm is tricked and operates with wrong values, which can result in unpredictable and bad results.

In case the ``sizes`` attribute is faked to a lower value and the browser already wants to select a lower candidate, (because the device has a low or metered bandwidth) the browser might choose an unfeasible image candidate instead.

In case the ``sizes`` attribute is faked to a higher value and the browser already wants to select a higher candidate, (because the user has zoomed into this particular image) the browser might be tricked to download a much heavier image candidate than the device actually needs.

But still this technique can be sometimes used to tell the browser **small** lies.
