# Changelog

## 5.1.1

* Fix ratio calculation in rias plugin (fixed in [#685](https://github.com/aFarkas/lazysizes/pull/685) by [tikotzky](https://github.com/tikotzky))
* Make  thumb size for youtube poster image in video-embed plugin configurable (see [#681](https://github.com/aFarkas/lazysizes/pull/681) thx to [@nikitasol](https://github.com/nikitasol))

## next

* Allow import/execution in node environment
* Use "hqdefault" for youtube poster image in video-embed plugin fixes [#666](https://github.com/aFarkas/lazysizes/issues/666)

## 5.0.0

* Use `width`/`height` content attributes to detect physical aspect ratio of image candidates, if `data-aspectratio` and `h`/`w` descriptors are missing. [#642](https://github.com/aFarkas/lazysizes/issues/642)
* Do not leak global `lazySizesConfig` anymore fixes [#647](https://github.com/aFarkas/lazysizes/issues/647)
* Improve handling of cloned object-fit images fixes [#648](https://github.com/aFarkas/lazysizes/issues/648)
* Improve blur-up/effect plugin.
* Add support fot native `loading="lazy"` feature as a [native loading plugin](https://github.com/aFarkas/lazysizes/tree/gh-pages/plugins/native-loading).

## 4.1.8

* Added the class `ls-is-cached` to already cached images.
* Added h descriptor parsing fix plugin for MS edge (was already included in respimg polyfill.)
* Effects-Plugin/Blur Up plugin: Remove [].find because IE..., fixes [#631](https://github.com/aFarkas/lazysizes/issues/631)
* Documentation stuff
* Bring back *.min.js files to npm package, but don't use them in your `import`/`require`. These are mostly for CDNs. Not for Common JS bundlers. 

## 4.1.7

* Blur Up plugin: make blur up mode configurable by script
* Unload Plugin: Fix unload plugin not knowing current expand, fixes [#608](https://github.com/aFarkas/lazysizes/issues/608)
* simplify resetPreloading and switchLoadingClass, fixes [#614](https://github.com/aFarkas/lazysizes/issues/614)

## 4.1.6

* Several Readme fixes
* Allow expand, hFax and expFactor to be changed after initialization, see [#581](https://github.com/aFarkas/lazysizes/issues/581)

## 4.1.5

* Blur Up plugin: Add an empty alt attribute to the blur image to satisfy a11y [c3256d6](https://github.com/aFarkas/lazysizes/commit/c3256d61c002a984ab3e644e922b0fdc052519d8)
* Blur Up plugin: added aria-hidden attribute [1d62efb](https://github.com/aFarkas/lazysizes/commit/1d62efb352f579d4505bd3d76d8166db2db9481f)
* RiaS plugin: fix wrong ratio calculation, fixes [#550](https://github.com/aFarkas/lazysizes/issues/550)
* Rias Plugin: add aspect-ratio to rias for calculating height, fixes [#557](https://github.com/aFarkas/lazysizes/issues/557)

## 4.1.4

* Resolve race condition with blurImg [dffa93b](https://github.com/aFarkas/lazysizes/commit/dffa93b804302363aceb7dc814b01629014ed03b)
* make intersectionobserver version compatible with plugins [2f1a025](https://github.com/aFarkas/lazysizes/commit/2f1a02531eb96e828d42fb7877e776b810d7f346)

## 4.1.3

* change from custom to basic event interface (maybe fixes [#520](https://github.com/aFarkas/lazysizes/issues/527))
* Clarify data-aspectratio attribute [d868605](https://github.com/aFarkas/lazysizes/commit/d8686050adeb68aae14e522bed12d68ab00b7595)

## 4.1.2

* fixes race condition with blurupimg [#527](https://github.com/aFarkas/lazysizes/issues/527)
* add proxy change event to extend bgset [#532](https://github.com/aFarkas/lazysizes/issues/532)


## 4.1.1

* See [3ace9f3](https://github.com/aFarkas/lazysizes/commit/3ace9f359617409fe2824311032439fcf76a7c99)

## 4.1.0

* improve effect plugin

## 4.0.4

* fixes issue in bgset introduced with version 4.0.3

## 4.0.3

* add [blur up plugin](https://jsfiddle.net/trixta/v0oq0412/embedded/result/)

## 4.0.0

* make all plugins CommonJS compatible (thx to @claudiobmgrtnr and @jantimon)
* added `loadHidden` option(thx to @justinvoelker)
* added artdirection plugin (no documentation yet, but great)
* iOS 8.1 fixes has to be loaded explicitly in non CommonJS environments (not included in respimg plugin anymore)
* removed `picture` support for old FF 38-

## 2.0.0

* lazysizes core:
	* heavily improved performance (`requestIdleCallback`, better debouncing and a lot more).
* plugins:
	* new plugin: [**object fit polyfill**](plugins/object-fit).
	* improved new options for [parent-fit plugin](plugins/parent-fit).

## 1.5.0
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

## 1.4.0
* lazysizes core:
	* improved lazyloading in background tabs.
	* improved avoiding layout thrashing
	* support of SVG elements (`svg`/`image`/`use`...)
* bgset/parentFit plugin:
	* improved avoiding layout thrashing
* rias (and bgset):
	* added support for height calculation (thx to @LRancez, [#213](https://github.com/aFarkas/lazysizes/pull/213))

## 1.3.2

* lazysizes core:
	* add `hFactor` option (see #181).
* unload plugin:
	* simplified `unloadPixelThreshold` calculation.
* bgset plugin:
	* add an empty alt to image (see #200).

## 1.3.1 version

* lazysizes core:
	* replace `setImmediate` with `setTimeout` (improved performance for IE/EDGE).
* plugins:
	* fixed conflict with respimg plugin in combination with bgset plugin, in case of art direction and resize to smaller.
	* fixed conflict with RIaS plugin in combination with respimg plugin/picturefill in Safari 8/9.
