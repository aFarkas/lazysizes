#Changelog

##2.0.0

* lazysizes core:
	* heavily improved performance (`requestIdleCallback`, better debouncing and a lot more).
* plugins:
	* new plugin: [**object fit polyfill**](plugins/object-fit).
	* improved new options for [parent-fit plugin](plugins/parent-fit).

##1.5.0
Breaking change:
	* the lazysizes.js and lazysizes.min.js files do not register as AMD modules anymore, if you need an AMD module use the new lazysizes-umd.js or lazysizes-umd.min.js file.
* lazysizes core:
	* improved lazyloading in background tabs.
	* fixed set lazyloaded class to early in FF.
* bgset/parentFit plugin:
	* improved avoiding layout thrashing.
* respimg/bgset/parentFit plugin:
	* fixed bug in Edge 14 to parse height descriptors correctly.
* unload plugin:
	unload plugin was broken since version 1.4.0 (thanks to @hokamoto)

##1.4.0
* lazysizes core:
	* improved lazyloading in background tabs.
	* improved avoiding layout thrashing
	* support of SVG elements (`svg`/`image`/`use`...)
* bgset/parentFit plugin:
	* improved avoiding layout thrashing
* rias (and bgset):
	* added support for height calculation (thx to @LRancez, [#213](https://github.com/aFarkas/lazysizes/pull/213))

##1.3.2

* lazysizes core:
	* add `hFactor` option (see #181).
* unload plugin:
	* simplified `unloadPixelThreshold` calculation.
* bgset plugin:
	* add an empty alt to image (see #200).

##1.3.1 version

* lazysizes core:
	* replace `setImmediate` with `setTimeout` (improved performance for IE/EDGE).
* plugins:
	* fixed conflict with respimg plugin in combination with bgset plugin, in case of art direction and resize to smaller.
	* fixed conflict with RIaS plugin in combination with respimg plugin/picturefill in Safari 8/9.
