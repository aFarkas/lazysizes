# lazysizes bgset extension - responsive background images

This simple and small plugin allows you to define multiple background images with a width descriptor, similar to how ``img[srcset]`` works as also art directed images using media queries, similar to how ``picture`` works.

The extension will then load the best image size for the current viewport and device. In case the browser does not support responsive images natively either picturefill or the [respimg polyfill plugin](../respimg) has to be used:

Note: This plugin is deprecated in most cases. Check wether the object-fit CSS property in combination with the [object-fit polyfill](../object-fit) is better for your needs.

```html
<script>
    function loadJS(u){var r=document.getElementsByTagName("script")[0],s=document.createElement("script");s.src=u;r.parentNode.insertBefore(s,r);}

    if(!window.HTMLPictureElement || !('sizes' in document.createElement('img'))){
        loadJS("ls.respimg.min.js");
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
<!-- or without customMedia options: -->
<div class="lazyload" data-bgset="image-200.jpg [(max-width: 480px)] | image-300.jpg [(max-width: 700px)] | image-400.jpg"></div>
<!-- or with type attribute: -->
<div class="lazyload" data-bgset="logo.svg [type: image/svg+xml] | logo.png"></div>
```

Of course also resolution switching and art direction can be combined:

```html
<div class="lazyload" data-bgset="image1-200.jpg 200w, image2-400.jpg 400w [(max-width: 480px)] |
    image2-300.jpg 300w, image2-600.jpg 600w [(max-width: 700px)] |
    image-400.jpg 400w, image-800.jpg 800w" data-sizes="auto"></div>
```

Here you find a [small bgset demo](http://jsfiddle.net/trixta/bfqqnosp/embedded/result/).

**Note: In case you use this plugin with ``background-size: cover|contain`` and the ``data-sizes="auto"`` feature, we recommend to also use the [parent-fit extension](../parent-fit/) to calculate the right ``sizes`` attribute for you. See also the following [demo](http://jsfiddle.net/trixta/w96o9xm5/). In these cases the [object-fit polyfill plugin](../object-fit) should be a better option than bgset.**
