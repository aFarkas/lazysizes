# The lazysizes Blur Up/effect plugin plugin

The lazysizes Blur Up plugin ([demo](https://jsfiddle.net/trixta/v0oq0412/embedded/result/)) gives you the possibility to also lazyload the low quality placeholder and enables you to create a blur up/fade over effect.

This way the low quality image placeholder technique is more appealing to the user.

```js
// never try to import *.min.js files 
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/blur-up/ls.blur-up';
```

## How to

Simply add a `data-lowsrc` attribute with the low quality image placeholder image to your `img` and in case of `picture` to your `source` elements.

Lazysizes will then create a new image right after your original image with the following class `ls-blur-up-img`.

The new image (`.ls-blur-up-img`) will get the following state classes to enable you to write a custom CSS animation/transition as soon as the image is in view and loaded: `ls-inview`/`ls-original-loaded`, while your original `img` gets the class `.ls-blur-up-is-loading` until the `.ls-blur-up-img` is loaded. 


```html
<style>
	.wrapper {
		width: 80%;
		min-width: 320px;
		max-width: 900px;
	}

	.mediabox {
		position: relative;
		display: block;
		height: 0;
		width: 100%;
		padding-bottom: 66.6667%;
	}
	
	.mediabox-img.ls-blur-up-is-loading,
	.mediabox-img.lazyload:not([src]) {
		visibility: hidden;
	}

	.ls-blur-up-img,
	.mediabox-img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;

		/* only if you want to change the blur-up option from always to auto or want to use blur up effect without a lowsrc image. */
		font-family: "blur-up: auto", "object-fit: cover";

		object-fit: cover;
	}

	.ls-blur-up-img {
		filter: blur(10px);
		opacity: 1;
		transition: opacity 1000ms, filter 1500ms;
	}

	.ls-blur-up-img.ls-inview.ls-original-loaded {
		opacity: 0;
		filter: blur(5px);
	}
</style>
<div class="wrapper">
	<div class="mediabox">
		<img
			class="mediabox-img lazyload"
			data-srcset="https://picsum.photos/400/600?image=1074 600w 400h,
				https://picsum.photos/800/1200?image=1074 1200w"
			data-lowsrc="https://picsum.photos/200/300?image=1074"
			data-sizes="auto"
		/>
	</div>
</div>

<script src="../plugins/object-fit/ls.object-fit.js"></script>
<script src="../plugins/parent-fit/ls.parent-fit.js"></script>
<script src="../plugins/blur-up/ls.blur-up.js"></script>
<script src="../lazysizes.js"></script>
```


### Blur-up options

#### BlurUp Mode

The effect mode has two possible value: `"always"` (default: The effect is generated always) and `"auto"` (The effect is only used with non cached images).

The blur up mode can be configured using JS or CSS:

```js
import lazysizes from 'lazysizes';
import 'lazysizes/plugins/blur-up/ls.blur-up';

lazysizes.cfg.blurupMode = 'auto';
``` 

```css
.mediabox-img {
	font-family: "blur-up: auto", "object-fit: cover";
}
```
