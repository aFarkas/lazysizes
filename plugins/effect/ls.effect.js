/**
 * effect plugin for lazySizes:
 *
 * Usage:
 *
 * 1. fadein after loading:
 *

 	img.lazyload,
 	img.lazyloading {
		opacity: 0;
	}
 	img.lazyloaded {
 		opacity: 1;
 		transition: opacity 300ms;
 	}

 *
 * 2. fadein while loading:
 *

 	img.lazyload {
		opacity: 0;
	}
 	img.lazyloading {
 		opacity: 1;
 		transition: opacity 300ms;
 	}
 */

(function(window, document){
	'use strict';
	var config, animEvent;

	if(document.addEventListener){
		config = window.lazySizesConfig || (window.lazySizes && lazySizes.cfg);
		animEvent = 'onwebkitanimationend' in window  ? 'webkitanimationend' : 'animationend';

		if(!config){
			config = {};
			window.lazySizesConfig = config;
		}

		if(!('loadingClass' in config)){
			config.loadingClass = 'lazyloading';
		}
		if(!('loadedClass' in config)){
			config.loadedClass = 'lazyloaded';
		}



		document.addEventListener('lazybeforeunveil', function(e){
			if(!e.defaultPrevented && e.target.nodeName.toUpperCase() == 'IMG' && lazySizes.aC) {

				e.target.addEventListener('load', onLoad, false);
				e.target.addEventListener('error', onLoad, false);
				if(config.loadingClass){
					lazySizes.aC(e.target, config.loadingClass);
				}
			}
		}, false);

	}

	function removeLoadedClass(e){
		e.target.removeEventListener('transitionend', removeLoadedClass, false);
		e.target.removeEventListener(animEvent, removeLoadedClass, false);
		lazySizes.rC(e.target, config.loadedClass);
	}

	function onLoad(e){
		e.target.removeEventListener('load', onLoad, false);
		e.target.removeEventListener('error', onLoad, false);
		if(config.loadingClass){
			lazySizes.rC(e.target, config.loadingClass);
		}
		if(config.loadedClass){
			e.target.addEventListener('transitionend', removeLoadedClass, false);
			e.target.addEventListener(animEvent, removeLoadedClass, false);
			lazySizes.aC(e.target, config.loadedClass);
		}
	}


})(window, document);
