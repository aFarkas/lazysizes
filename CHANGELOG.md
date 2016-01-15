#Changelog

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
