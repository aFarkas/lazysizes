# MS Edge h descriptor fix

This plugin/polyfill fixes the missing `h` descriptor parsing in MS Edge by removing the `h` from all candidates of `source` and `img` elements and storing the a physical aspect ratio of the candidates into a `data-aspectratio` attribute.

Note: This polyfill is already included in the [respimg polyfill plugin](../respimg) and must **not** be included along site with it.
