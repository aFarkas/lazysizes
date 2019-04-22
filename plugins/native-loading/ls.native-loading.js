(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	'use strict';

	var imgSupport = 'loading' in HTMLImageElement.prototype;
	var iframeSupport = 'loading' in HTMLIFrameElement.prototype;

	if (!window.addEventListener || !window.MutationObserver || (!imgSupport && !iframeSupport)) {
		return;
	}

	var nativeLoadingCfg;
	var isConfigSet = false;
	var oldPrematureUnveil = lazySizes.prematureUnveil;
	var cfg = lazySizes.cfg;

	function disableEvents(nativeLoadingCfg) {
		var loader = lazySizes.loader;
		var throttledCheckElements = loader.checkElems;
		var removeALSL = function(){
			setTimeout(function(){
				window.removeEventListener('scroll', loader._aLSL, true);
			}, 1000);
		};

		if (nativeLoadingCfg.windowEvents.indexOf('resize') != -1) {
			window.addEventListener('load', removeALSL);
			removeALSL();

			window.removeEventListener('scroll', throttledCheckElements, true);
		}

		if (nativeLoadingCfg.windowEvents.indexOf('resize') != -1) {
			window.removeEventListener('resize', throttledCheckElements, true);
		}

		nativeLoadingCfg.documentEvents.forEach(function(name){
			document.removeEventListener(name, throttledCheckElements, true);
		});
	}

	function runConfig() {
		isConfigSet = true;

		nativeLoadingCfg = cfg.nativeLoading || {};

		if (!nativeLoadingCfg.documentEvents) {
			nativeLoadingCfg.documentEvents = ['focus', 'mouseover', 'click', 'load', 'transitionend', 'animationend', 'webkitAnimationEnd'];
		}


		if (!nativeLoadingCfg.windowEvents) {
			nativeLoadingCfg.windowEvents = ['scroll', 'resize'];
		}

		if (imgSupport && iframeSupport && nativeLoadingCfg.disableListeners) {
			disableEvents(nativeLoadingCfg);
			nativeLoadingCfg.setLoadingAttribute = true;
		}

		if (nativeLoadingCfg.setLoadingAttribute) {
			window.addEventListener('lazybeforeunveil', function(e){
				var element = e.target;

				if ('loading' in element && !element.getAttribute('loading')) {
					element.setAttribute('loading', 'lazy');
				}
			}, true);
		}
	}

	lazySizes.prematureUnveil = function prematureUnveil(element) {

		if (!isConfigSet) {
			runConfig();
		}

		if ('loading' in element &&
			(nativeLoadingCfg.setLoadingAttribute || element.getAttribute('loading')) &&
			(element.getAttribute('data-sizes') != 'auto' || element.offsetWidth)) {
			lazySizes.loader.unveil(element);
			return true;
		}

		if (oldPrematureUnveil) {
			return oldPrematureUnveil(element);
		}
	};

}));
