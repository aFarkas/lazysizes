#lazysizes noscript/progressive enhancement extension

The noscript extension is the true ultimate progressive enhancement extension for lazySizes. It allows you to transform any HTML inside a ``noscript`` element as soon as it becomes visible.

##Markup

The ``lazyload`` class has to be added to the parent element of the ``noscript`` element and this element has to also have a ``data-noscript`` attribute. As soon as it is near the viewport the content of the ``noscript`` element will replace the content of the ``.lazyload`  element.

```html
<div class="lazyload" data-noscript="">
    <noscript>
        <p>any kind of content you want to be unveiled</p>
    </noscript>
</div>

<!-- or -->

<div class="lazyload" data-noscript="">
    <noscript>
        <picture>
            <!--[if IE 9]><video style="display: none;><![endif]-->
            <source
                srcset="http://placehold.it/500x600/11e87f/fff"
                media="(max-width: 480px)" />
            <source
                srcset="http://placehold.it/700x300"
                media="(max-width: 700px)" />
            <source
                srcset="http://placehold.it/1400x600/e8117f/fff"
                media="(max-width: 1400px)" />
            <source
                srcset="http://placehold.it/1800x900/117fe8/fff" />
            <!--[if IE 9]></video><![endif]-->
            <img
                src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                alt="image with artdirection" />
        </picture>


         <iframe frameborder="0"
                allowfullscreen=""
                src="//www.youtube.com/embed/ZfV-aYdU4uE">
            </iframe>
    </noscript>
</div>
```

**Important note**: While you also can transform responsive images with this plugin, neither the ``data-sizes`` nor the ``customMedia`` features do work with the ``noscript`` extension. Also note: Android 2.x is not supported with this plugin.

##Troubleshooting: Escaped HTML entities
Normally the content of a ``noscript`` must be retrieved as text. But in some cases for example, if the ``noscript`` element was created in a XML documented/context, it must be retrieved as HTML. This can't be automatically detected.

In case this happens, you can fix this either by making sure that ``noscript`` elements are always created in a *text/html* context or by overriding the ``getNoscriptContent`` option callback:

```js
window.lazySizesConfig = window.lazySizesConfig || {};

window.lazySizesConfig.getNoscriptContent =  function(noScript){
    return (noScript.isXML) ? noScript.innerHTML : (noScript.textContent || noScript.innerText);
};
```

##<a name="ie8"></a>Add IE8- support with conditional comments
The noscript extension can also be used in conjunction with conditional comments to add progressive enhancement support for IE8-:

```html
<div class="lazyload" data-noscript="">
    <!--[if lte IE 8]><noscript><![endif]-->
        <p>any kind of content you want to be unveiled</p>
    <!--[if lte IE 8]></noscript><![endif]-->
</div>
```
