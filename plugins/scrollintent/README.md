#lazysizes scrollintent extension

Normally lazysizes uses a throttled scroll event to check for ``.lazyload`` elements. In case a user scrolls fast from to to bottom of the page lazyload resources in the "not viewed" middle of the page might be loaded in that case.

The scrollintent plugin changes the behavior to only check for ``.lazyload`` resources if either the user scrolling is slow or the user has stopped scrolling.
