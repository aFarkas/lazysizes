#lazysizes unveilhooks extension

The unveilhooks plugin extends lazySizes to also unveil / lazyload scripts/widgets, background images, styles and video/audio elements:

```html
<!-- Background image example: -->
<div class="lazyload" data-bg="bg-img.jpg">
	<!-- content -->
</div>

<!-- Scripts/Widgets example: -->
<div class="lazyload" data-script="module-name.js">

</div>

<!-- Styles -->
<div class="lazyload" data-link="my-style.css">

</div>

<!-- Video example: -->
<video class="lazyload" data-poster="poster.jpg" preload="none">
 	<!-- sources -->
</video>

<!-- require.js * example -->
<div class="lazyload" data-require="module-name"></div>


<!-- Styles & script combined -->
<div class="lazyload" data-script="my-script.js" data-link="my-style.css">

</div>
```

Note: In case you want to lazyload a background image via a ``class`` you can do so by using the ``addClasses`` option:

```html
<style>
	.bg-stage.lazyloaded {
		background-image: url(lazyloaded-bg.jpg);
	}
</style>

<div class="bg-stage lazyload">
	<!-- content -->
</div>
```

For support responsive background images see the [bgset extension](../bgset).

For more complex loading of styles and AMD modules please see the [include extension](../include).

Note: To support the require example you need to the requireJs option:

```js
window.lazySizesConfig = window.lazySizesConfig || {};
window.lazySizesConfig.requireJs = function(modules, cb){
	window.require(modules, cb);
};
```
 

