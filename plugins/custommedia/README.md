# lazysizes custommedia extension

lazySizes custommedia extension allows you to automatically sync and manage your breakpoints between your CSS and the ``media`` attributes of your ``"picture > source"`` elements using the ``customMedia`` option of lazySizes.

## Configuration via CSS

The following CSS...

```css
html:after {
	display: none;
	content: '--small: (max-width: 500px) | --medium: (max-width: 1100px) | --large: (max-width: 1500px)';
}
```

... allows you to write the following markup:

```html
<picture>
	<!--[if IE 9]><video style="display: none;"><![endif]-->
	<source
		data-srcset="http://placehold.it/500x600/11e87f/fff"
		media="--small" />
	<source
		data-srcset="http://placehold.it/700x300"
		media="--medium" />
	<source
		data-srcset="http://placehold.it/1400x600/e8117f/fff"
		media="--large" />
	<!--[if IE 9]></video><![endif]-->
	<img
		src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
		class="lazyload"
		data-srcset="http://placehold.it/1800x900/117fe8/fff"
		alt="image with artdirection" />
</picture>
```

The parsed custom media query object can be accessed through the ``lazySizesConfig.customMedia`` option object:

```js
window.lazySizesConfig.customMedia; // returns:

/*
{
	'--small': '(max-width: 500px)',
    '--medium': (min-width: 1100px)',
    '--large': '(max-width: 1100px)'
}
*/
```

```scss
/*
 Simple Sass mixin to share a map of breakpoints between CSS and JS
 Usage:
 $breakpoints: (
   --small: (max-width: 480px),
   --medium: (max-width: 1024px),
   --large: (min-width: 1280px)
 );

 html:after {
 	@include shareBreakpoints($breakpoints);
 }
*/
@mixin shareBreakpoints($map , $cssprop: content){
  $description: '';

  @each $property, $value in $map
   {
    @if $description !=  '' {
      $description: $description + ' | ';
    }
    $description: $description + $property +': '+ inspect($value);
  }

  display: none;
  #{$cssprop}:  $description;
}
```


