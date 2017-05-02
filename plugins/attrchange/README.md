# lazysizes attribute change / re-initialization extension

In case you are changing the ``data-src``/``data-srcset`` attributes of already transformed lazyload elements dynamically, you normally also must re-add the ``lazyload`` class to the element.

This extension automatically detects changes to your ``data-*`` attributes and adds the class for you.

In case you are using React you can also try the following [react-lazysizes](https://www.npmjs.com/package/react-lazysizes) module as another possible alternative.


