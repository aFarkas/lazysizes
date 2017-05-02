# lazysizes unload

Unloads ``img.lazyload`` (including ``picture``) elements if they consume a lot of memory and they are out of view. To improve memory consumption as also resize/orientationchange performance.

## Usage

Simply add the lazysizes unload extension to your site.

## Options

* ``lazySizesConfig.unloadClass`` (default: ``"lazyunload"``): Elements with this class will be unloaded even if they only consume less memory/pixels than defined in ``unloadPixelThreshold``.
* ``lazySizesConfig.unloadedClass`` (default: ``"lazyunloaded"``): If an element was unloaded it becomes the class ``lazyunloaded``.
* ``lazySizesConfig.unloadPixelThreshold`` (default: Number is dynamically calculated): If the amount of image pixels exceeds this threshold this image will be unloaded.
* ``lazySizesConfig.autoUnload`` (default: ``true``): Whether unloading should happen automatically with all lazyload images. If set to false, only elements with the class ``lazyunload`` will be unloaded.
* ``lazySizesConfig.emptySrc`` (default: transparent data uri): The src to be used as unload image.
* ``lazySizesConfig.unloadHidden`` (default: ``true``): Whether hidden images (``display: none;``) also should be unloaded.

**Note**: In case you dynamically change the ``data-src``/``data-srcset`` of an already unloaded element, you have to remove the ``lazyunloaded`` class.

## Events

* ``lazyafterunload``: This event will be fired on the unloaded lazyload elements. This event can be used to extend the unload functionality.
```js
//div ajax example which returns DOM string:
document.addEventListener('lazybeforeunveil', function (e) {
    var containerId = e.target.getAttribute('data-id');
    
    //load ajax content with containerId
    //append content to e.target.innerHTML
});

//clean DOM nodes inside container that where previously loaded by ajax:
//lazyafterunload gives possibility to take care of the cleanup in this case
document.addEventListener('lazyafterunload', function (e) {
    var container = e.target;
    
    while (container.firstElementChild) {
        container.removeChild(container.firstElementChild);
    }
});
```
