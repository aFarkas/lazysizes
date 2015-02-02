#lazysizes bgset extension

This simple and small plugin allows you to define multiple background images with a width descriptor, similar to how ``img[srcset]`` works as also art directed images using media queries.

The extension will then load the best image size for the current viewport and device. In case the browser does not support responsive images natively either picturefill or respimage has to be used:

```html
<script>
    function loadJS(u){var r=document.getElementsByTagName("script")[0],s=document.createElement("script");s.src=u;r.parentNode.insertBefore(s,r);}

    if(!window.HTMLPictureElement){
        loadJS("http://cdn.jsdelivr.net/g/respimage(respimage.min.js)");
    }
</script>

<!--  your stylesheets -->

<script src="ls.bgset.min.js"></script>
<script src="lazysizes.min.js"></script>

<div class="lazyload" data-bgset="image-200.jpg 200w, image-300.jpg 300w, image-400.jpg 400w" data-sizes="auto">

</div>
```

The bgset also supports art direction through multiple media query sets. To use this feature each set has to be separated using the ``" | "`` signs and the media query has to be added at the end of the set inside of square brackets.

Also the ``customMedia`` option can be used to separate the media queries implementation from the markup.

```html
<script>
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.customMedia = {
    '--small': '(max-width: 480px)',
    '--medium': '(max-width: 700px)'
};
</script>

<div class="lazyload" data-bgset="image-200.jpg [--small] | image-300.jpg [--medium] | image-400.jpg"></div>
```

Of course also resolution switching and art direction can be combined:

```html
<div class="lazyload" data-bgset="image1-200.jpg 200w, image2-400.jpg 400w [(max-width: 480px)] |
    image2-300.jpg 300w, image2-600.jpg 600w [(max-width: 700px)] |
    image-400.jpg 400w, image-800.jpg 800w" data-sizes="auto"></div>
```

Here you find a [small bgset demo](http://jsfiddle.net/trixta/bfqqnosp/embedded/result/).
