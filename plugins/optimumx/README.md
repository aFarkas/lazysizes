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

The optimumx extension needs to parse the srcset attribute. This is normally handled by the respimage polyfill. In case you don't want to include a full polyfill for all browsers you can include this [excellent srcset parser](https://github.com/baloneysandwiches/parse-srcset).

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
