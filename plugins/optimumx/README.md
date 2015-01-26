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

**Note**: For full cross-browser support either a [responsive images polyfill like respimage or picturefill](https://github.com/aFarkas/respimage) or the [neat Responsive Images as a Service extension (RIaS)](../rias) needs to be used.

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

    if(!window.HTMLPictureElement){
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
    return window.devicePixelRatio > 1 ? devicePixelRatio * 0.9 : 1;
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
window.lazySizesConfig.getOptimumX = function(/*element*/){
    var dpr = window.devicePixelRatio || 1;
    if(dpr > 2.4){
        dpr *= 0.63; // returns 1.9 for 3
    } else if(dpr > 1.9){
        dpr *= 0.8; // returns 1.6 for 2
    } else if(dpr > 1.4){
        dpr *= 0.9; // returns 1.35 for 1.5
    }
    return Math.round(dpr * 100) / 100;
};
```

##Background information

From a perceived performance vs. perceived quality standpoint the best way to deal with High DPI images is to serve higher compressed candidates to clients with high resolution displays.

This is due to the fact, that on higher DPI displays small details can be compressed more aggressively.

For native images support the ``picture`` element can be used to achieve the result:

```html
<picture>
<!--[if IE 9]><video style="display: none;"><![endif]-->
<source
    data-srcset="image-w1600-q60.jpg 1600w,
        image-w1440-q60.jpg 1440w,
        image-w1200-q60.jpg 1200w,
        image-w800-q60.jpg 800w,
        image-w600-q60.jpg 600w,
        image-w400-q60.jpg 400w"
    media="(-webkit-min-device-pixel-ratio: 1.5),
        (min-resolution: 144dpi)"
     />
<!--[if IE 9]></video><![endif]-->
<img
    data-srcset="w1600-q80.jpg 1600w,
        image-w1440-q80.jpg 1440w,
        image-w1200-q80.jpg 1200w,
        image-w800-q80.jpg 800w,
        image-w600-q80.jpg 600w,
        image-w400-q80.jpg 400w"
    data-sizes="auto"
    class="lazyload"
    alt="picture but without artdirection" />
</picture>
```

Or in case you are using the [Responsive Images as a Service extension (RIaS)](../rias):

```html
<script>
document.addEventListener('lazyriasmodifyoptions', function(data){
    data.details.quality = (window.devicePixelRatio || 1) > 1.4 ? 60 : 80;
};
</script>

<img
    data-src="image-w{width}-q{quality}.jpg"
    data-sizes="auto"
    class="lazyload"
    alt="" />
```

Unfortunately these techniques also double the amount of generated image candidates. In case you don't have so much resources the optimumx extension in conjunction with proper image compression is the best thing you can do.

But be aware each image has different characteristics: While some images look great on a HIGH DPI device even with a ``data-optimumx="1.2"`` other will need a much higher density for a good perceived quality.
