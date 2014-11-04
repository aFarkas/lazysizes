#lazysizes maxdpr plugin

**lazysizes** maxdpr plugin helps you to limit/constrain the maximum resolution in case the **w descriptor** is used by adding the attribute ``data-maxdpr="1.6"``.

It gives you therefore more control to trade perceived quality against perceived performance on HD retina devices, than the HTML responsive image standard gives you.

This plugin depends on the ``data-sizes="auto"`` feature of **lazysizes** and the [respimage polyfill](https://github.com/aFarkas/respimage).

```html
<img
    data-srcset="http://placehold.it/300x150 300w,
    	http://placehold.it/700x300 700w,
    	http://placehold.it/1400x600 1400w,
    	http://placehold.it/2800x1200 2800w"
     data-sizes="auto"
     data-maxdpr="1.5"
     class="lazyload"
     src="http://placehold.it/300x150"
     alt="flexible image" />
```

A simple [demo can be seen here](http://afarkas.github.io/lazysizes/maxdpr/). 
