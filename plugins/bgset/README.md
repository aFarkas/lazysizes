#lazysizes bgset extension

This simple and small plugin allows you to define multiple background images with a width descriptor, similar to how ``img[srcset]`` works.

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

<div class="lazyload" data-bgset="image-200.jpg 200w, image-300.jpg 300w, image-400.jpg 400w">

</div>
```

Here you find a [small bgset demo](http://jsfiddle.net/trixta/bfqqnosp/embedded/result/).
