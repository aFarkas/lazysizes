#lazysizes effect plugin

The **lazysizes** effect plugin adds the classes ``lazyloading`` and ``.lazyloaded`` to all image elements, while they are loading or right after they are loaded, to make it easy adding CSS transitions or CSS animations to loading/loaded images:

```html
<style>
img.lazyload,
img.lazyloading {
    opacity: 0;
}
img.lazyloaded {
    opacity: 1;
    transition: opacity 300ms;
}
</style>

<script src="layzsizes.js"></script>
<script src="plugins/effect/ls.effect.js"></script>

<img
	data-sizes="auto"
    src="lqip-src.jpg"
	data-srcset="lqip-src.jpg 100w,
    image2.jpg 300w,
    image3.jpg 600w,
    image4.jpg 900w" class="lazyload" />
```

The classes can be configured using the ``loadedClass`` and the ``loadingClass`` option properties:

```html
<script>
window.lazySizesConfig = {
    loadedClass: 'js-lazyloaded',
    loadingClass: 'js-lazyloading'
};
</script>

<script src="layzsizes.js"></script>
<script src="plugins/effect/ls.effect.js"></script>
```

