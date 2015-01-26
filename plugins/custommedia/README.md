#lazysizes custommedia extension

lazySizes custommedia extension allows you to sync you breakpoints between your CSS and the ``customMedia`` option of lazySizes.

```css
html:after {
	display: none;
	content: '--small: (max-width: 500px) | --medium: (max-width: 1100px) | --large: (min-width: 1100px)';
}
```

```html
<picture>
	<!--[if IE 9]><audio><![endif]-->
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		media="--small" />
	<source
		data-srcset="http://placehold.it/700x300"
		media="--medium" />
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff"
		media="--large" />
	<!--[if IE 9]></audio><![endif]-->
	<img
		src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
		class="lazyload"
		data-srcset="http://placehold.it/1800x900/117fe8/fff"
		alt="image with artdirection" />
</picture>
```


