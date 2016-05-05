#lazySizes object fit extension

This extension polyfills `object-fit`: `cover` and `contain` properties as also the `object-position` in non supporting browsers and is built on top of the [parent-fit plugin](../parent-fit).

##Usage

###Include JS files:
Include lazysizes, lazysizes parent-fit, lazysizes object fit and optionally lazysizes respimg plugin. Lazysizes object-fit and respimg plugin are only needed in browser that don't support object fit or responsive images.

```html
<script src="../plugins/parent-fit/ls.parent-fit.min.js"></script>
<script src="../plugins/object-fit/ls.object-fit.min.js"></script>
<script src="../plugins/respimg/ls.respimg.min.js"></script>
<script src="../lazysizes.min.js" async=""></script>
```

###Add markup
The object-fit plugin is not a full polyfill.

It requires you to write an additional container, that has the same dimensions as your image. In non supporting browser this container is used to display a background image.

```html
<div class="imagecontainer">
	<img class="imagecontainer-img lazyload"
		 data-srcset="https://placehold.it/800x400 800w 400h,
		 	https://placehold.it/1200x600 1200w"
		 data-sizes="auto" >
	/>
</div>

<div class="imagecontainer">
	<img class="imagecontainer-img lazyload"
		 data-srcset="https://placehold.it/500x700 500w 700h,
		 	https://placehold.it/643x900 643w"
		 data-sizes="auto" >
	/>
</div>
```

###CSS

To init the plugin on an image simply use the `font-family` property directly on your image.

```css
.imagecontainer {
	position: relative;
	border: 3px solid #ccc;
}

.imagecontainer:before {
	display: block;
	width: 100%;
	content: "";
	padding-bottom: 100%;
	height: 0;
}

.imagecontainer-img {
	position: absolute;
	display: block;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;

	object-fit: contain;
	font-family: "object-fit: contain";
}
```
