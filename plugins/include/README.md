#lazysizes include plugin

**lazysizes** include extension/plugin asynchronously include non crucial content. Due to lazyloading, prioritized queuing and preload after load techniques lazySizes include extension scales much better that similar other solutions.

Typical use cases are:

* loading different content depending on certain conditions (mediaqueries, browser features, user preferences...)
* defering heavy to render or uncacheable content (client or server side)
* progressively enhancing the document with new content

##Basic usage

Put a ``data-include`` attribute on your ``.lazyload`` element and reference the URL to load:

```html
<aside class="related-articles lazyload" data-include="related-articles.html?contentid=32">
</aside>
```

The ``data-include`` can also consume a list of include candidates represented by a URL in combination with an optional parenthesised condition. The lazySizes include extension will then take the first URL, that matches the condition:

```html
<div class="dynamic-content lazyload"
	data-include="large.html (min-width: 800px), small.html">
</div>
```

If the last include candidate has no condition, the innerHTML of the initial content is used as default/fallback content.

```html
<div class="dynamic-content lazyload"
	data-include="large.html (min-width: 800px)">
	<!-- initial content + content for (max-width 799px) -->
</div>
```

The condition is either a mediaquery or the name of a configured condition rule, which is either a string representing a mediaquery or a function:

```html
<script>
window.lazySizesConfig = {
	include: {
		conditions: {
			small: '(max-width: 480px)',
			custom: function(elem, data){
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

The include feature will always use a download queue to make sure, that multiple includes do not jam the browsers own request queue. In case of many non crucial includes mixed with some crucial includes on one page the ``data-lazyqueue`` attribute can be used to add a queue priority:

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

<div class="lazyload" data-include="large.html (min-width: 800px), default.html">
	<!-- crucial conditional content -->
</div>
```

###Events

* ``lazyincludeload`` is a cancelable event fired at the element before the request is started. The ``event.details`` object can be used to modify the XHR request.
* ``lazyincludeloaded`` is a cancelable event fired at the element after the request was made, but before the content is added. The ``event.details.content`` property can be used to modify the content (for example to transform JSON to HTML).
* ``lazyincluded`` is an event fired at the element right after the HTML was injected.

###Options

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

The include feature works together with all normal lazySizes options (i.e.: ``addClasses``), events and methods. In case ``preloadAfterLoad`` is not set explicitly to ``false`` the include extension will change it to ``true``.
