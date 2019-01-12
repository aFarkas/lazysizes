# The lazysizes Blur Up/effect plugin plugin

The lazysizes Blur Up plugin ([demo](https://jsfiddle.net/trixta/v0oq0412/embedded/result/)) gives you the possibility to also lazyload the low quality placeholder and enables you to create a blur up/fade over effect.

This way the low quality image placeholder technique is more appealing to the user.

## How to

Simply add a `data-lowsrc` attribute with the loq quality image placeholder image to your `img` and in case of `picture` to your `source` elements.

Lazysizes will then create a new image right after your original image with the following class `ls-blur-up-img`.

The new image (`ls-blur-up-img`) will get the following state classes to enable you to write a custom CSS animation/transition as soon as the image is in view and loaded: `ls-inview`/`ls-original-loaded`.


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

	.ls-blur-up-img,
	.mediabox-img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: block;

		/* only if you want to change the blur-up option from auto to always */
		font-family: "blur-up: always", "object-fit: cover";

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
