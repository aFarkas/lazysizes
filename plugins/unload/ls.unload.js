(function(window, document, undefined){
	'use strict';
	if(!document.addEventListener){return;}
	var config, checkElements, expand;

	var unloadElements = [];
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
	var unloader = {
		checkElements: function(){
			var i, len, box;

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
		var dpr = window.devicePixelRatio || 1;
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
			config.unloadPixelThreshold =  Math.max( Math.min(document.documentElement.clientWidth * dpr, document.documentElement.clientHeight * dpr, 999) - 40, 210 * dpr, 310);
			config.unloadPixelThreshold *= config.unloadPixelThreshold / 2.5;
		}

		if(config.autoUnload){
			document.documentElement.addEventListener('load',  function(e){
				if(e.target.className.indexOf(lazySizesConfig.loadingClass) != -1 && e.target.naturalWidth * e.target.naturalHeight > config.unloadPixelThreshold  && e.target.className.indexOf(lazySizesConfig.preloadClass) == -1){
					lazySizes.aC(e.target, lazySizesConfig.unloadClass);
				}
			}, true);
		}

		lazySizes.unloader = unloader;

		expand = ((config.expand * config.expFactor) + 99) * 1.1;
		checkElements = document.getElementsByClassName([config.unloadClass, config.loadedClass].join(' '));

		setInterval(throttleRun, 9999);
		addEventListener('lazybeforeunveil', throttleRun);
		addEventListener('lazybeforeunveil', unloader._reload, true);
	}

	setTimeout(init);

	addEventListener('lazybeforeunveil', init);
})(window, document);
