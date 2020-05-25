(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if (typeof define == 'function' && define.amd) {
		define(['lazysizes'], factory);
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	'use strict';
	if(!document.addEventListener){return;}
	var config, checkElements;

	var lazySizesCfg = lazySizes.cfg;
	var unloadElements = [];
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
	var unloader = {
		checkElements: function(){
			var i, len, box;

			var expand = (lazySizes._defEx + 99) * 1.1;
			var vTop = expand * -1;
			var vLeft = vTop;
			var vBottom = innerHeight + expand;
			var vRight = innerWidth + expand;

			for(i = 0, len = checkElements.length; i < len; i++){
				box = checkElements[i].getBoundingClientRect();

				if((box.top > vBottom || box.bottom < vTop || box.left > vRight || box.right < vLeft) ||
					(config.unloadHidden && !box.top && !box.bottom && !box.left && !box.right)){
					unloadElements.push(checkElements[i]);
				}
			}
			requestAnimationFrame(unloader.unloadElements);
		},
		unload: function(element){
			var sources, isResponsive, i, len;
			var picture = element.parentNode;
			lazySizes.rC(element, config.loadedClass);

			if(element.getAttribute(config.srcsetAttr)){
				element.setAttribute('srcset', config.emptySrc);
				isResponsive = true;
			}

			if(picture && picture.nodeName.toUpperCase() == 'PICTURE'){
				sources = picture.getElementsByTagName('source');

				for(i = 0, len = sources.length; i < len; i++){
					sources[i].setAttribute('srcset', config.emptySrc);
				}

				isResponsive = true;
			}

			if(lazySizes.hC(element, config.autosizesClass)){
				lazySizes.rC(element, config.autosizesClass);
				element.setAttribute(config.sizesAttr, 'auto');
			}

			if(isResponsive || element.getAttribute(config.srcAttr)){
				element.src = config.emptySrc;
			}

			lazySizes.aC(element, config.unloadedClass);
			lazySizes.aC(element, config.lazyClass);
			lazySizes.fire(element, 'lazyafterunload');
		},
		unloadElements: function(elements){
			elements = Array.isArray(elements) ? elements : unloadElements;

			while(elements.length){
				unloader.unload(elements.shift());
			}
		},
		_reload: function(e) {
			if(lazySizes.hC(e.target, config.unloadedClass) && e.detail){
				e.detail.reloaded = true;
				lazySizes.rC(e.target, config.unloadedClass);
			}
		}
	};

	function init(){
		if(!window.lazySizes || checkElements){return;}
		var docElem = document.documentElement;
		var throttleRun = (function(){
			var running;
			var run = function(){
				unloader.checkElements();
				running = false;
			};
			return function(){
				if(!running){
					running = true;
					setTimeout(run, 999);
				}
			};
		})();

		config = lazySizes.cfg;
		removeEventListener('lazybeforeunveil', init);

		if(!('unloadClass' in config)){
			config.unloadClass = 'lazyunload';
		}

		if(!('unloadedClass' in config)){
			config.unloadedClass = 'lazyunloaded';
		}

		if(!('unloadHidden' in config)){
			config.unloadHidden = true;
		}

		if(!('emptySrc' in config)){
			config.emptySrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
		}

		if(!('autoUnload' in config)){
			config.autoUnload = true;
		}

		if(!('unloadPixelThreshold' in config)){
			config.unloadPixelThreshold = 60000;
		}

		if(config.autoUnload){
			docElem.addEventListener('load',  function(e){
				if(e.target.naturalWidth * e.target.naturalHeight > config.unloadPixelThreshold && e.target.className &&
					e.target.className.indexOf && e.target.className.indexOf(lazySizesCfg.loadingClass) != -1 &&
					e.target.className.indexOf(lazySizesCfg.preloadClass) == -1){
					lazySizes.aC(e.target, lazySizesCfg.unloadClass);
				}
			}, true);
		}

		lazySizes.unloader = unloader;

		checkElements = document.getElementsByClassName([config.unloadClass, config.loadedClass].join(' '));

		setInterval(throttleRun, 9999);
		addEventListener('lazybeforeunveil', throttleRun);
		addEventListener('lazybeforeunveil', unloader._reload, true);
	}

	addEventListener('lazybeforeunveil', init);
}));
