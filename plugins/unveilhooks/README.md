#lazysizes unveilhooks extension

The unveilhooks plugin extends lazysizes to also unveil / lazyload scripts/widgets, background images and video/audio elements:

```html
<!-- Background image example: -->
<div class="lazyload" data-bg="bg-img.jpg">
	<!-- content -->
</div>

<!-- Scripts/Widgets example: -->
<div class="lazyload" data-script="module-name.js">

</div>

<!-- Video example: -->
<video class="lazyload" data-poster="poster.jpg" preload="none">
 	<!-- sources -->
</video>

<!-- require.js example -->
<div class="lazyload" data-require="module-name"></div>
```
 
 

