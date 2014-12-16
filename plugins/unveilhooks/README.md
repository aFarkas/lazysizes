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

Note: In case you want to lazyload a background image via a ``class`` you can do so by using the ``addClasses`` option:

```html
<script>
window.lazySizesConfig = {
	addClasses: true
};
</script>

<style>
	.bg-stage.lazyloaded {
		background-image: url(lazyloaded-bg.jpg);
	}
</style>

<div class="bg-stage lazyload">
	<!-- content -->
</div>
```
 

