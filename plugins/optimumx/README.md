#lazysizes optimumx plugin

**lazysizes** optimumx plugin helps you to limit/constrain the maximum resolution in case the **w descriptor** is used. Simply add the attribute ``data-optimumx="1.6"`` to constrain the max resolution to 1.6.

It gives you therefore more control to trade perceived quality against perceived performance on HD retina devices, than the HTML responsive image standard gives you.

This plugin depends on the ``data-sizes="auto"`` feature of **lazysizes** and the [respimage polyfill](https://github.com/aFarkas/respimage).

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

A **simple [demo can be seen here](http://afarkas.github.io/lazysizes/optimumx/)**. 

##Usage

```html
<!-- concat the following scripts into one and add them to your HTML -->
<script src="lazysizes.min.js"></script>
<script src="ls.optimumx.js"></script>
<script src="respimage.min.js"></script>

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
<script src="http://cdn.jsdelivr.net/g/respimage(respimage.min.js),lazysizes(lazysizes.min.js+plugins/optimumx/ls.optimumx.min.js)" async=""></script>
```

The optimumx extension needs to parse the ``srcset`` attribute. This is normally handled by the [respimage polyfill](https://github.com/aFarkas/respimage). In case you don't want to include a full polyfill for all browsers or you want to use picturefill as a polyfill you can include this [excellent srcset parser](https://github.com/baloneysandwiches/parse-srcset).

```html
<!-- polyfill responsive images: https://github.com/aFarkas/respimage -->
<script>
    function loadJS(u){var r=document.getElementsByTagName("script")[0],s=document.createElement("script");s.src=u;r.parentNode.insertBefore(s,r);}

    if(!window.HTMLPictureElement){
        document.createElement('picture');
        loadJS("respimage.min.js");
    }
</script>

<!--  your stylesheets -->

<script src="lazysizes.min.js"></script>
<script src="ls.optimumx.js"></script>
<script src="parse-srcset.js"></script>
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

The predefined ugly ``getOptimumX`` callback looks like this:

```js
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.getOptimumX = function(/*element*/){
    var dpr = window.devicePixelRatio;
    if(dpr > 2.5){
        dpr *= 0.7; // returns 2.1 for 3
    } else if(dpr > 1.9){
        dpr *= 0.8; // returns 1.6 for 2
    } else if(dpr > 1.4){
        dpr *= 0.9; // returns 1.35 for 1.5
    } else {
        dpr *= 0.99; // returns 0.99 for 1 or 1.24 for 1.3
    }
    return Math.round(dpr * 100) / 100;
};
```

Due to the fact, that picturefill 2.x and some browsers with an infantile native respimg implementation doesn't include any smart source selection algorithms this plugin can be used to include one.
