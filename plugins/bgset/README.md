#lazysizes bgset extension

This simple and small plugin allows you to define multiple background images with a width descriptor, similar to how ``img.srcset`` works.

The extension will then load the best image size for the current viewport and device. In case the browser does not support responsive images natively either picturefill or respimage has to be used:

```html
<script src="lazysizes.min.js"></script>
<script src="ls.bgset.min.js"></script>
<script src="respimage.min.js"></script>

<div class="lazyload" data-bgset="image-200.jpg 200w, image-300.jpg 300w, image-400.jpg 400w">

</div>
```
