# lazysizes native loading extension

This extension automatically transforms `img.lazyload`/`iframe.lazyload` elements in browsers that support native lazy loading.

## Usage

Simply include the plugin:

```js
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/native-loading/ls.native-loading';
```

And use normal lazySizes markup in combination with the `loading` attribute:

```html
<img
	loading="lazy"
	data-sizes="auto"
	data-srcset="http://placehold.it/175x75 175w,
	http://placehold.it/350x150 350w,
	http://placehold.it/700x300 700w,
	http://placehold.it/1400x600 1400w"
	data-src="http://placehold.it/700x300"
	class="lazyload" />
```

## `nativeLoading` Options

Options are changed at the `lazySizes.cfg.nativeLoading` options object:

```js
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/native-loading/ls.native-loading';

lazySizes.cfg.nativeLoading = {
	setLoadingAttribute: true,
	disableListeners: {
		scroll: true
	},
};
```

### `setLoadingAttribute` `boolean` option

By setting `setLoadingAttribute` to `true`. LazySizes will automatically set the `loading="lazy"` attribute for you. `

This way all `img`/`iframe` elements will natively lazyloaded without any changes to your normal lazySizes markup.

### `disableListeners` `boolean`/`eventMap`

Due to the fact that you can use lazySizes for many things. Native lazy loading does not remove any event listeners automatically.

By setting `disableListeners` to `true` all events listeners are removed. Often it makes sense to only remove specific events like the scroll event for example.

The possible full event map looks like this:

```html
{
	focus: true,
	mouseover: true,
	click: true,
	load: true,
	transitionend: true,
	animationend: true,
	scroll: true,
	resize: true,
}
```
