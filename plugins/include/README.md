#lazysizes include plugin

**lazysizes** include extension/plugin asynchronously include non crucial content. Due to lazyloading, prioritized queuing and preload after load techniques lazySizes include extension scales much better than similar other solutions.

Typical use cases are:

* conditional lazy loading different content depending on certain conditions (media queries, browser features, user preferences, element queries...)
* deferring heavy to render or uncacheable content (client or server side)
* progressively enhancing the document with new JS enabled content

##Basic usage

Put a ``data-include`` attribute on your ``.lazyload`` element and reference the URL to load:

```html
<aside class="related-articles lazyload" data-include="related-articles.html?contentid=32">
</aside>
```

The ``data-include`` can also consume a list of candidates represented by a URL in combination with an optional parenthesised condition. The lazySizes include extension will then take the first URL, that matches the condition:

```html
<div class="dynamic-content lazyload"
	data-include="large.html (min-width: 800px), small.html">
</div>
```

The condition is either a media query or the name of a configured condition rule. The condition rule can be configured through CSS or through JS via the ``include.conditions`` option.

###Condition configuration through CSS

The Lazysizes include extension checks wether the condition name matches the CSS ``content`` value the of ``:after`` or ``:before`` pseudo elements from the ``html`` element (can be configured).

```html
<style>
html:after {
	display: none;
	content: "small";
}

@media (min-width: 760px){
	content: "medium";
}

@media (min-width: 980px){
	content: "large";
}
</style>

<div class="dynamic-content lazyload"
	data-include="large.html (large), medium.html (medium), small.html">
</div>
```

###Condition configuration through JS

A condition can also be configured through the ``lazySizesConfig.include.conditions`` option map. Each key is either a string representing a media query or a function:

```html
<script>
window.lazySizesConfig = {
	include: {
		conditions: {
			small: '(max-width: 480px)',
			custom: function(element, data){
				return true || false;
			}
		}
	}
};
</script>

<div class="dynamic-content lazyload"
	data-include="small.html (small), custom.html (custom), default.html">
</div>
```

If the last include candidate has a condition, the innerHTML of the initial content is used as default/fallback content.

```html
<div class="dynamic-content lazyload"
	data-include="large.html (min-width: 800px)">
	<!-- initial content + content for (max-width 799px) -->
</div>
```

As soon as the content is changed a ``lazyincluded`` event is fired at the element:

```html
<script>
document.addEventListener('lazyincluded', function(e){
	// e.target has new content
});
</script>

<div class="dynamic-content lazyload" data-include="small.html">
</div>
```

The include feature will always use a download queue to make sure, that multiple includes do not jam the browsers own request queue. In case of many non crucial includes mixed with some crucial includes on one page the ``data-lazyqueue`` attribute can be used to add a queue priority for the include extension:

```html
<li>
	<a href="">Category 1
		(articles:
		<span class="lazyload" data-include="count-service?id=32" data-lazyqueue=""></span>
		)
	</a>
</li>

<li>
	<a href="">Category 2
		(articles:
		<span class="lazyload" data-include="count-service?id=33" data-lazyqueue=""></span>
		)
	</a>
</li>

<li>
	<a href="">Category 3
		(articles:
		<span class="lazyload" data-include="count-service?id=34" data-lazyqueue=""></span>
		)
	</a>
</li>
<!-- more lazyqueued elements -->

<div class="lazyload" data-include="large.html (min-width: 800px), default.html">
	<!-- crucial conditional content -->
</div>
```

###Events

* ``lazyincludeload`` is a cancelable event fired at the element before the request is started. The ``event.details`` object can be used to modify the XHR request.
* ``lazyincludeloaded`` is a cancelable event fired at the element after the request is complete, but before the content is added. The ``event.details.content`` property can be used to modify the content (for example to transform JSON to HTML).
* ``lazyincluded`` is an event fired at the element right after the HTML was injected.

###Options
All include options are configurable through the ``lazySizesConfig.include`` option object:

####``contentElement`` (default: ``"html"``):

The selector of the element, which should be used to check for the CSS content value:


```js
window.lazySizesConfig = {
	include: {
		contentElement: '#mediaqueries' // 'html'
	}
};
```

####``conditions`` map (default: ``{}``):
The include extension adds the conditions map option:

```js
window.lazySizesConfig = {
	addClasses: true, // good to add loading styles
	include: {
		conditions: {
			small: '(max-width: 480px)',
			custom: function(elem, data){
				return true || false;
			}
		}
	}
};
```

The include feature works together with all normal lazySizes options (i.e.: ``addClasses`` for load indicators), events and methods. In case ``preloadAfterLoad`` is not set explicitly to ``false`` the include extension will automatically change it to ``true``.

##Advanced examples

###Reacting to user interaction

Of course it is also possible to react to a user interaction.

```html
<!-- markup has data-include, but no lazyload class -->
<div class="dynamic-content" data-include="include.html">
	<button type="button" class="load-include">load content</button>
</div>


<script>
$(document).on('click', '.load-include', function(){
	$(this)
		//set button to disabled
		.prop('disabled', true)
			//get parent include area
			.closest('[data-include]')
			// and activate lazySizes by adding lazyload class
			.addClass('lazyload')
	;
});
</script>
```

It's also possible to change the ``data-include`` value and reevaluate it:

```html
<div class="dynamic-content lazyload" data-include="include.html (min-width: 800px)">
	<button type="button" class="load-include" data-setinclude="include.html">load content</button>
</div>


<script>
$(document).on('click', '.load-include', function(){
	$(this)
		//set button to disabled
		.prop('disabled', true)
			//get parent include area
			.closest('[data-include]')
			//change data-include value
			.attr('data-include', $.attr(this, 'data-setinclude'))
			// and activate/refresh lazySizes by adding lazyload class
			.addClass('lazyload')
	;
});
</script>
```

###Loading in conjunction with CSS/JS

For bigger modules with a lot of CSS rules and/or JS, it makes absolutely sense to combine the include extension with the [unveilhooks extension](../unveilhooks) to load also JS or CSS dynamically.

```html
<div class="widget lazyload" data-include="widget.html" data-script="widget.js" data-link="widget">

</div>
```

All resources are loaded async and lazysizes does not ensure any special order. In case your lazyloaded JavaScript needs an explicit initialization on certain lazyloaded DOM elements the following pattern can be used:

```js
// JS is loaded dynamically and needs to initialized on all lazyincluded elements:
(function($){/* datepicker code */ $.fn.datepickers = function(){};})(jQuery);
//initialization code:
(function($){
	function init(context){
		$('input.datepicker', context).datepickers();
	}

	$(function(){
		//first init inside the hole document
		init(document);
		//init always inside new lazyincluded element
		$(document).on('lazyincluded', function(e){
			init(e.target);
		});
	});
})(jQuery);
```

In case you are using conditioned includes and your JS widget also needs an explicit destroy call you can use the following pattern:

```js
// JS is loaded dynamically and needs to initialized/destroyed on all lazyincluded elements:
(function($){/* datepicker code */ $.fn.datepickers = function(){};})(jQuery);
//initialization code:
(function($){
	function init(context){
		$('input.datepicker', context).datepickers();
	}

	function destroy(context){
		$('input.datepicker', context).datepickers('destroy');
	}

	$(function(){
		//first init inside the hole document
		init(document);
		//init always inside new lazyincluded element
		$(document).on('lazyincluded', function(e){
			init(e.target);
		});

		$(document).on('lazyincludeloaded', function(e){
			destroy(e.target);
		});
	});
})(jQuery);
```

Note in case of jQuery UI/jQuery mobile widgets the lazysizes include script already ensures destroying those widgets.

