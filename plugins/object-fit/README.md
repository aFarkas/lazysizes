# lazySizes object fit extension

This extension polyfills `object-fit`: `cover` and `contain` properties as also the `object-position` in non supporting browsers. Here you find a [simple demo](https://jsfiddle.net/trixta/x2p17f31/).

## Usage

### Include JS files:
Include lazysizes and lazysizes object fit and optionally lazysizes [parent-fit](../parent-fit) and lazysizes respimg plugin. Lazysizes object-fit and respimg plugin are only needed in browser that don't support object fit or responsive images. Lazysizes parent-fit is recommended if you use object fit responsive images in combination with `data-sizes="auto"`.

```html
<!-- polyfill for object-fit (only needed in browsers that don't support object-fit) -->
<script src="../plugins/object-fit/ls.object-fit.min.js"></script>
<!-- required: -->
<script src="../lazysizes.min.js" async=""></script>

<!-- only for data-sizes="auto" in combination with object-fit CSS property (native or polyfill) -->
<script src="../plugins/parent-fit/ls.parent-fit.min.js"></script>
<!-- respimg polyfill (only needed in browser that don't support respimg) -->
<script src="../plugins/respimg/ls.respimg.min.js"></script>
```

```js
// never try to import *.min.js files 
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/parent-fit/ls.parent-fit';

// polyfills
import 'lazysizes/plugins/respimg/ls.respimg';

if (!('object-fit' in document.createElement('a').style)) {
	require('lazysizes/plugins/object-fit/ls.object-fit');
}
```

### Add markup
The object-fit plugin is not a full polyfill.

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

### CSS

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
	transition: 400ms transform;

	object-fit: contain;
	font-family: "object-fit: contain";
}

.imagecontainer-img:hover {
	transform: scale(1.1);
}
```
