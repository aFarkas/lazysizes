#lazysizes aspectratio extension

This plugin helps to pre-occupy the space needed for an image by calculating the height from the image width or the width from the height (This means the width or height has to be calculable before the image is loaded). This can serve as an alternative to the different CSS intrinsic ratio patterns.

Note: The CSS patterns are recommended, but especially in case of different ratio's for art directed images not so convenient.

##Markup API:

The value of the ``data-aspectratio`` has to be defined as the *width* divided by the *height*  of the image.

Example values for an image with a width of 400 and a height of 200 (all mean the same): ``"400/200"``, ``"4/2"``, ``"2/1"``, ``"2"``

```html
<img
	data-sizes="auto"
    src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    data-aspectratio="2/1"
	data-srcset="http://lorempixel.com/400/200/people/1/ 400w,
    http://lorempixel.com/600/300/people/1/ 600w,
    http://lorempixel.com/800/400/people/1/ 800w" class="lazyload" />

<picture>
	<!--[if IE 9]><video style="display: none;"><![endif]-->
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		data-aspectratio="5/6"
		media="--small" />
	<source
		data-srcset="http://placehold.it/700x300"
		data-aspectratio="700/300"
		media="--medium" />
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff"
		data-aspectratio="14/6"
		media="--large" />
	<source
        data-srcset="http://placehold.it/1800x900/117fe8/fff"
		data-aspectratio="2" />
    <!--[if IE 9]></video><![endif]-->
    <!-- note: the img element always has to have data-apsectratio attribute, even if it is using a dummy/placeholder image -->
    <img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        class="lazyload"
		data-aspectratio=""
        alt="image with artdirection"
        style="width: 100%;" />
</picture>
```

##JS API

In case new elements are added to the DOM the global ``imageRatio.processImages`` method can be used. The method takes either an element representing the container/wrapper of the new elements or a list of image elements:

```js
imageRatio.processImages(document.querySelector('#dynaimc-wrapper');
imageRatio.processImages(document.querySelectorAll('#dynaimc-wrapper img[data-aspectratio]');
```

In case jQuery, ZEPTO, shoestring or another jQuery-like library is used the ``imageRatio`` plugin is added also:

```js
$('.dynamic-wrapper').imageRatio();
$('.dynamic-wrapper img[data-aspectratio]').imageRatio();
```

Note: This plugin can also be used without lazySizes core script.
