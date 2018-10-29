# lazysizes artdirect extension

The artdirect extension allows you to fully control art direction through your CSS. This is accomplished by two techniques which you can use separately or combined. The extension hooks into the `data-sizes="auto"` feature.

The first feature is by tagging and the second feature uses the information of the displayed aspect ratio of the `img` elements and the physical aspect ratio of your images.

## Enabling artdirect extension for a ``picture > img``

You can either enable the artdirect extension for all images using JavaScript:

```js
import lazySizes from 'lazysizes';
import 'lazysizes/plugins/ls.artdirect';

lazySizes.cfg.autoArtDirect = true;
```

Or for a specific `img` element using CSS:

```css
picture > img.is-autoartdirect {
	font-family: "artdirect";
}
```

## Tagging `source` elements and controlling it via CSS

You can use a whitespace separated list of tags on the `source` elements `data-tag` attribute as also a whitespace separated list of tags inside of the CSS `font-family`:

```html
<style>
	picture > img.is-autoartdirect {
    	font-family: "artdirect: tag-default";
    }
    
    @media (max-width: 960px) {
    	picture > img.is-autoartdirect {
        	font-family: "artdirect: tag-small";
        }
    }
</style>

<picture>
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		data-tag="tag-default" />
	<source
		data-srcset="http://placehold.it/700x300"
		data-tag="tag-small" />
    <img

        data-src="http://placehold.it/500x600/11e87f/fff"
        class="lazyload"
        data-sizes="auto"
        alt="image with artdirection" />
</picture>
```

## Providing aspect ratio information of physical images

By providing a specific height and width (no `auto` values) through CSS and providing the physical aspect ratio of the images through either a `data-aspectratio` attribute or through `w` and `h` descriptors the plugin can choose the best image source.

```html
<style>
	picture > img.is-autoartdirect {
		display: block;
		height: 200px;
		max-height: 60vh;
		width: 100%;
		object-fit: cover;
    	font-family: "artdirect", "object-fit: cover";
    }
    
    
</style>

<picture>
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		data-aspectratio="0.834"
	/>
	<source
		data-srcset="http://placehold.it/700x300"
		data-aspectratio="2.34"
	 />
    <img

        data-src="http://placehold.it/500x600/11e87f/fff"
        class="lazyload"
        data-sizes="auto"
        alt="image with artdirection" />
</picture>
```

The aspect ratio feature can be perfectly combined with the tagging feature.

```html
<style>
	picture > img.is-autoartdirect {
		display: block;
		height: 200px;
		max-height: 60vh;
		width: 100%;
		object-fit: cover;
    	font-family: "artdirect", "object-fit: cover";
    }
    
    @media (max-width: 1100px) {
    	font-family: "artdirect: tag-foo tag-baz", "object-fit: cover";
    }
</style>

<picture>
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		data-aspectratio="0.834"
		data-tag="tag-foo"
	/>
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff 1400w 600h"
		data-aspectratio="0.834"
	/>
	<source
		data-srcset="http://placehold.it/700x300"
		data-aspectratio="2.34"
		data-tag="tag-baz tag-foobar"
	 />
    <img

        data-src="http://placehold.it/500x600/11e87f/fff"
        class="lazyload"
        data-sizes="auto"
        alt="image with artdirection" />
</picture>
```

 
