# lazysizes include plugin

**lazysizes** include extension/plugin asynchronously include non crucial content, styles or JS modules. Due to lazyloading, prioritized queuing and preload after load techniques lazySizes include extension scales much better than similar other solutions.

Typical use cases are:

* lazy loading different content, styles or JS modules depending on certain conditions (responsive content, responsive behavior, media queries, existence of a DOM element, browser features, user preferences, element queries...)
* deferring heavy to render or uncacheable content (client or server side)
* progressively enhancing the document with new JS enabled content
* splitting or deferred loading of large JS/CSS modules in larger projects
* clean and simple architecture for initialization/loading and/or destroying/unloading of (conditional) JS behaviors
* deferred self-initializing of DOM behaviors

## Basic usage

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

### Condition configuration through CSS

The Lazysizes include extension checks wether the condition name matches the CSS ``content`` value the of ``:after`` or ``:before`` pseudo elements from the ``html`` element (can be configured).

```html
<style>
html:after {
	display: none;
	content: "small";
}

@media (min-width: 760px){
	html:after {
		content: "medium";
	}
}

@media (min-width: 980px){
	html:after {
		content: "large";
	}
}
</style>

<div class="dynamic-content lazyload"
	data-include="large.html (large), medium.html (medium), small.html">
</div>
```

### Condition configuration through JS

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

If the last include candidate has a condition, the ``innerHTML`` of the initial content is used as unconditioned fallback content.

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

### Loading Styles or (AMD) Modules

The include feature can also load CSS, AMD or ES6 modules. To mark an URL as CSS put a ``css:``, to load an AMD module put a ``amd:`` or to load an ES6 module put a ``module:`` identifier in front of the URL:

```html
<div class="dynamic-content lazyload" data-include="css:my-style.css (large)">
</div>

<div class="slider lazyload" data-include="amd:path/slider-module">
</div>
```

Content, Style and AMD includes can also be mixed and used with or without conditions:

```html
<div class="slider lazyload"
	data-include="slider.html amd:path/slider-module css:slider.css (large),
		module:path/mobile-slider, css:mobile-slider.css">
</div>
```

In case content and a behavior include is used together lazySizes will load them in parallel but makes sure to first include the content and then initialize the behavior. 

#### AMD/ES6 module features

While you can write your AMD/ES6 module how you want lazysizes include extension will check wether your module provides the following methods:

* ``yourmodule.lazytransform``: Will be invoked before the content is inserted. Especially to transform the AJAX response. (For example JSON to HTML)
* ``yourmodule.lazyload``: Callback function to initialize the module. Will be invoked after the content was inserted.
* ``yourmodule.lazyunload``: Callback function to destroy your widget. Will be invoked before old content is removed

Each of those methods are optional static methods of a module. Here is a simple example:

```js
define(function(){

	// constructor
	var Slider = function(element,options) {

	};

	Slider.prototype = {
		destroy: function(){}
	};

	// lazysizes include features:

	// called with the DOM element (data.target) and some other useful data (data.detail)
	// useful to initialize with the DOM element
	Slider.lazyload = function(data){
		var	Slider = new Slider(data.target);
		// save instance for destroy / lazyunload
		// data.element._slider = Slider;
	};

	// in case of a conditioned include and
	// the need to destroy the instance (i.e.: unbind global events)
	Slider.lazyunload = function(data){
		// data.target._slider.destroy();
	};

	// gets invoked with the a simplified XHR object (data.detail)
	// and the dom element (data.target)
	Slider.lazytransform = function(data){
		// var json = JSON.parse(data.detail.responseText);
		// data.detail.response = template(json);
	};

	return Slider;
});
```

In case a candidate includes new markup while another candidate only includes an AMD behavior. The initial content will be automatically resetted in case of a condition switch:

```html
<div class="lazyload" data-include="slider.html amd:js/slider (big),
	amd:js/mobileSlider">
    <!-- amd:mobileSlider always works with the initial content and never on the slider.html include -->
</div>
```

In case both candidates has an amd module but not a content include the markup won't be resetted automatically. But the unloading module can request this behavior inside of it's unload method or the to initialized module can request this inside the ``lazytransform`` method using the ``resetHTML`` propety:

```js
Slider.lazyunload = function(data){
    // data.element._slider.destroy();
    data.resetHTML = true;
};

//or

NewSlider.lazytransform = function(data){
    // data.element._slider.destroy();
    data.resetHTML = true;
};
```

In case the content doesn't contain any mutable states, that need to be transferred to the new behavior (i.e. input fields etc.), this option makes it extremley simple to cleanup the HTML for the next module.

The data object is shared between the ``lazyunload``, ``lazytransform`` and ``lazyload`` so that a possible state can be transferred.

#### Loading multiple styles and modules

Multiple styles or AMD modules for one candidate can be configured by separating them with ``|,|`` signs:


```html
<div class="slider lazyload"
	data-include="amd:path/uiModule|,|path/slider-module css:slider-core.css|,|slider.css (large),
		amd:path/mobile-slider, css:slider-core.css|,|mobile-slider.css">
</div>
```

### Scalability and queue priority

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

### Events

* ``lazyincludeload`` is a cancelable event fired at the element before the request is started. The ``event.detail`` object can be used to modify the XHR request.
* ``lazyincludeloaded`` is a cancelable event fired at the element after the request is complete, but before the content is added. The ``event.detail.content`` property can be used to modify the content (for example to transform JSON to HTML).
* ``lazyincluded`` is an event fired at the element right after the HTML was injected.

### Options
All include options are configurable through the ``lazySizesConfig.include`` option object:

#### ``contentElement`` (default: ``"html"``):

The selector of the element, which should be used to check for the CSS content value:


```js
window.lazySizesConfig = {
	include: {
		contentElement: '#mediaqueries' // 'html'
	}
};
```

#### ``conditions`` option (default: ``{}``):
The conditions option can be used to create new custom conditions.

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

#### ``map`` option (default: ``{}``):

The ``map`` option allows to map the value of the ``data-include`` attribute to another string. This does not only work for the hole value, but also for parsed parts.

```html
<script>
window.lazySizesConfig = {
	addClasses: true, // good to add loading styles
	include: {
		map: {
			slider: 'slider.html amd:path/slider (large)',
			amdSlider: 'jquery|,|path/ui-slick'
		}
	}
};
</script>

<div class="lazyload" data-include="slider"></div>

<div class="lazyload" data-include="amd:amdSlider"></div>
```

This option becomes useful to separate content from behavior.

The include feature works together with all normal lazySizes options (i.e.: ``addClasses`` for load indicators), events and methods.

## Reacting to user interaction

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
<div class="dynamic-content lazyload" data-include="include.html amd:module (min-width: 800px)">
	<button type="button" class="load-include" data-setinclude="include.html amd:module">load content</button>
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
			// and activate/refresh lazySizes by re-adding lazyload class
			.addClass('lazyload')
	;
});
</script>
```

## Sharing States between two modules


```html
<nav class="lazyload" data-include="amd:js/nav (big),
	amd:js/mobileNav">
    <!-- content  -->
</nav>
```

```js
define(function(){

	// constructor
	var Nav = function(element,options) {

	};

	Nav.prototype = {
		
	};

	Nav.lazyunload = function(data){
    	//Reset HTML for mobileNav
	    data.resetHTML = true;
        //share the value of the input field with mobileNav
		data.shareState = {
        	searchValue: $('input.search', data.target).val();
        };
	};
    
	Nav.lazyload = function(data){
    	//check wether mobileNav has shared some data
		if(data.shareState){
	        $('input.search', data.target).val(data.shareState.searchValue || '');
        }
	};

	return Nav;
});
```

Note: For amd require JS or SystemJS to work the `requireJs` and/or the `systemJs` option has to be provided:


```js
window.lazySizesConfig = window.lazySizesConfig || {};

window.lazySizesConfig.requireJs = function(modules, cb){
	window.require(modules, cb);
};

window.lazySizesConfig.systemJs = function(module, cb){
	window.System.import(module).then(cb);
};
```
