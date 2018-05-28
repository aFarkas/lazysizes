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

		font-family: "blur-up: always";

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
			src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
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
