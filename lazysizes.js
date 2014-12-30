(function (factory) {
	window.lazySizes = factory(window);
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return window.lazySizes;
		});
	}
}(function (window) {
	'use strict';
	/*jshint eqnull:true */
	if(!Date.now || !window.document.getElementsByClassName){return;}

	var lazyloadElems, autosizesElems, lazySizesConfig, globalSizesTimer,
		globalSizesIndex, globalLazyTimer, globalLazyIndex,
		addClass, removeClass, hasClass, isWinloaded;

	var document = window.document;
	var docElem = document.documentElement;
	var isPreloading = 0;
	var fixChrome = window.HTMLPictureElement && navigator.userAgent.match(/hrome\/(\d+)/) && (RegExp.$1 == 40 || RegExp.$1 == 41);

	var regPicture = /^picture$/i;
	var regImg = /^img$/i;

	var inViewLow = -21;
	var inViewThreshold = inViewLow;
	var inViewHigh = 9;

	var lowRuns = 0;

	var setImmediate = window.setImmediate || window.setTimeout;
	var addRemoveImgEvents = function(dom, fn, add){
		var action = add ? 'addEventListener' : 'removeEventListener';
		if(add){
			addRemoveImgEvents(dom, fn);
		}
		if(('onload' in dom) || ('onerror' in dom)){
			dom[action]('load', fn, false);
			dom[action]('error', fn, false);
		}
		dom[action]('lazyincluded', fn, false);
	};

	var triggerEvent = function(elem, name, details){
		var event = document.createEvent('Event');

		event.initEvent(name, true, true);

		event.details = details || {};

		elem.dispatchEvent(event);
		return event;
	};

	/*
	if(document.documentElement.classList){
		addClass = function(el, cls){
			el.classList.add(cls);
		};
		removeClass = function(el, cls){
			el.classList.remove(cls);
		};
		hasClass = function(el, cls){
			return el.classList.contains(cls);
		};
	} else {

	}
	*/

	addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.className += " "+cls;
		}
	};
	removeClass = function(ele, cls) {
		var reg;
		if (hasClass(ele,cls)) {
			reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
			ele.className = ele.className.replace(reg,' ');
		}
	};
	hasClass = function hasClass(ele,cls) {
		return ele.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)'));
	};

	function updatePolyfill(el, full){
		var imageData, src;
		if(!window.HTMLPictureElement){
			if(window.picturefill){
				picturefill({reevaluate: true, reparse: true, elements: [el]});
			} else if(window.respimage){
				if(full){
					imageData = el[respimage._.ns];
					if(imageData){
						imageData[full.srcset ? 'srcset' : 'src'] = undefined;
					}
				}
				respimage({reparse: true, elements: [el]});
			} else if(full && full.src){
				el.src = full.src;
			}
		}
	}

	var eLlen, resetPreloadingTimer, eLvW, elvH, eLtop, eLleft, eLright, eLbottom, eLnegativeTreshhold;
	var eLnow = Date.now();
	var resetPreloading = function(e){
		isPreloading--;
		if(e && e.target){
			addRemoveImgEvents(e.target, resetPreloading);
		}
		if(!e || isPreloading < 0 || !e.target) {
			isPreloading = 0;
		}
	};
	var lazyEvalLazy = (function(){
		var timer, running;
		var unblock = function(){
			running = false;
		};
		var run = function(){
			clearTimeout(timer);
			clearLazyTimer();
			evalLazyElements();
			setTimeout(unblock);
		};
		return  function(){
			if(!running){
				running = true;
				clearTimeout(timer);
				timer = setTimeout(run, 66);
			}
		};
	})();

	var evalLazyElements = function (){
		var rect, autoLoadElem, loadedSomething;
		eLlen = lazyloadElems.length;
		eLnow = Date.now();
		if(eLlen){
			eLvW = window.innerWidth + inViewThreshold;
			elvH = window.innerHeight + inViewThreshold;
			eLnegativeTreshhold = inViewThreshold * -1;

			for(; globalLazyIndex < eLlen; globalLazyIndex++){
				rect = lazyloadElems[globalLazyIndex].getBoundingClientRect();

				if ((eLbottom = rect.bottom) >= eLnegativeTreshhold &&
					(eLtop = rect.top) <= elvH &&
					(eLright = rect.right) >= eLnegativeTreshhold &&
					(eLleft = rect.left) <= eLvW &&
					(eLbottom || eLright || eLleft || eLtop) &&
					(!isWinloaded || getComputedStyle(lazyloadElems[globalLazyIndex], null).visibility != 'hidden')){
					if(('onload' in lazyloadElems[globalLazyIndex])){
						preload(lazyloadElems[globalLazyIndex]);
					} else {
						unveilLazy(lazyloadElems[globalLazyIndex]);
					}
					loadedSomething = true;
				} else  {
					if(globalLazyIndex < eLlen - 1 && Date.now() - eLnow > 9){
						autoLoadElem = false;
						globalLazyTimer = setTimeout(evalLazyElements);
						break;
					}

					if(!loadedSomething && isWinloaded && !autoLoadElem &&
						lazySizesConfig.preloadAfterLoad && isPreloading < 3 &&
						((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[globalLazyIndex].getAttribute(lazySizesConfig.sizesAttr) != 'auto')){
						autoLoadElem = lazyloadElems[globalLazyIndex];
					}
				}
			}

			lowRuns++;

			if(autoLoadElem && !loadedSomething){
				preload(autoLoadElem);
			} if (inViewThreshold < inViewHigh && isPreloading < 1 && !loadedSomething && lowRuns > 9){
				inViewThreshold = inViewHigh;
				lowRuns = 0;
				lazyEvalLazy();
			} else if(inViewThreshold != inViewLow){
				inViewThreshold = inViewLow;
			}
		}
	};
	var switchLoadingClass = function(e){
		addClass(e.target, lazySizesConfig.loadedClass);
		removeClass(e.target, lazySizesConfig.loadingClass);
		addRemoveImgEvents(e.target, switchLoadingClass);
	};

	function preload(elem){
		isPreloading++;
		elem = unveilLazy(elem);
		addRemoveImgEvents(elem, resetPreloading, true);
		clearTimeout(resetPreloadingTimer);
		resetPreloadingTimer = setTimeout(resetPreloading, ('onload' in elem) ? 4000 : 999);
	}

	function clearLazyTimer(){
		globalLazyIndex = 0;
		clearTimeout(globalLazyTimer);
	}

	function unveilLazy(elem, force){
		var sources, i, len, sourceSrcset, sizes, src, srcset, parent, isImg, isPicture;

		var event = triggerEvent(elem, 'lazybeforeunveil', {force: !!force});
		var curSrc = elem.currentSrc || elem.src;

		if(!event.defaultPrevented){
			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			sizes = elem.getAttribute(lazySizesConfig.sizesAttr) || elem.getAttribute('sizes');

			if(sizes){
				if(sizes == 'auto'){
					updateSizes(elem, true);
				} else {
					elem.setAttribute('sizes', sizes);
				}
				if(lazySizesConfig.clearAttr){
					elem.removeAttribute(lazySizesConfig.sizesAttr);
				}
			}

			srcset = elem.getAttribute(lazySizesConfig.srcsetAttr);
			src = elem.getAttribute(lazySizesConfig.srcAttr);

			if((isImg = regImg.test(elem.nodeName || ''))) {
				parent = elem.parentNode;
				isPicture = regPicture.test(parent.nodeName || '');
			}

			if(lazySizesConfig.addClasses){
				addClass(elem, lazySizesConfig.loadingClass);

				addRemoveImgEvents(elem, switchLoadingClass, true);
			}

			if(srcset || src){

				if(isPicture){
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						sourceSrcset = sources[i].getAttribute(lazySizesConfig.srcsetAttr);
						if(sourceSrcset){
							sources[i].setAttribute('srcset', sourceSrcset);
						}
					}
				}

				if(srcset){

					elem.setAttribute('srcset', srcset);

					if(fixChrome && sizes){
						elem.removeAttribute('src');
					}

					if(lazySizesConfig.clearAttr){
						elem.removeAttribute(lazySizesConfig.srcsetAttr);
					}
				} else if(src){
					elem.setAttribute('src', src);
					if(lazySizesConfig.clearAttr) {
						elem.removeAttribute(lazySizesConfig.srcAttr);
					}
				}
			}
		}

		setImmediate(function(){
			removeClass(elem, lazySizesConfig.lazyClass);
			if(sizes == 'auto'){
				addClass(elem, lazySizesConfig.autosizesClass);
			}

			if(srcset || sizes){
				updatePolyfill(elem, {srcset: srcset, src: src});
			}

			if(elem.lazyload){
				elem.lazyload = 0;
			}

			//remove curSrc == (elem.currentSrc || elem.src) it's a workaround for FF. see: https://bugzilla.mozilla.org/show_bug.cgi?id=608261
			if( !event.details.stopSwitchClass && lazySizesConfig.addClasses && (!isImg || (!srcset && !src) || (elem.complete && curSrc == (elem.currentSrc || elem.src))) ){
				switchLoadingClass({target: elem});
			}
		});
		return elem;
	}

	var lazyEvalSizes = (function(){
		var timer;
		var run = function(){
			clearTimeout(timer);
			clearSizesTimer();
			evalSizesElements();
		};
		return function(){
			clearTimeout(timer);
			clearTimeout(globalSizesTimer);
			timer = setTimeout(run, 99);
		};
	})();

	var evalSizesElements = function(){
		var checkTime, now, i;
		var len = autosizesElems.length;
		if(len){

			now = Date.now();
			i = globalSizesIndex || 0;
			checkTime = i + 3;

			clearSizesTimer();

			for(; i < len; i++){
				updateSizes(autosizesElems[i]);

				if(i > checkTime && i < len - 1 && Date.now() - now > 9){
					globalSizesIndex = i + 1;

					globalSizesTimer = setTimeout(evalSizesElements, 4);
					break;
				}
			}
		}
	};

	function clearSizesTimer(){
		globalSizesIndex = 0;
		clearTimeout(globalSizesTimer);
	}

	function updateSizes(elem, dataAttr){
		var parentWidth, elemWidth, width, parent, sources, i, len, event;
		parent = elem.parentNode;

		if(parent){
			parentWidth = parent.offsetWidth;
			elemWidth = elem.offsetWidth;
			width = (elemWidth > parentWidth) ?
				elemWidth :
				parentWidth;

			if(!width && !elem._lazysizesWidth){
				while(parent && parent != document.body && !width){
					width =  parent.offsetWidth;
					parent = parent.parentNode;
				}
			}

			event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

			if(!event.defaultPrevented){
				width = event.details.width;

				if(width && width !== elem._lazysizesWidth && (!lazySizesConfig.onlyLargerSizes || (!elem._lazysizesWidth || elem._lazysizesWidth < width))){
					elem._lazysizesWidth = width;
					width += 'px';
					elem.setAttribute('sizes', width);

					if(regPicture.test(parent.nodeName || '')){
						sources = parent.getElementsByTagName('source');
						for(i = 0, len = sources.length; i < len; i++){
							sources[i].setAttribute('sizes', width);
						}
					}

					if(!event.details.dataAttr){
						updatePolyfill(elem);
					}
				}
			}
		}
	}

	// bind to all possible events ;-) This might look like a performance disaster, but it isn't.
	// The main check functions are written to run extreme fast without consuming memory.

	var onload = function(){
		inViewThreshold = lazySizesConfig.threshold || 200;
		inViewLow = inViewThreshold;
		inViewHigh = inViewThreshold * 4;

		document.addEventListener('load', lazyEvalLazy, true);
		isWinloaded = true;
	};
	var onready = function(){

		if(lazySizesConfig.mutation){
			if(window.MutationObserver){
				new MutationObserver( lazyEvalLazy ).observe( docElem, {childList: true, subtree: true, attributes: true} );
			} else {
				docElem.addEventListener('DOMNodeInserted', lazyEvalLazy, true);
				docElem.addEventListener('DOMAttrModified', lazyEvalLazy, true);
			}
		}

		//:hover
		if(lazySizesConfig.hover){
			document.addEventListener('mouseover', lazyEvalLazy, true);
		}
		//:focus/active
		document.addEventListener('focus', lazyEvalLazy, true);
		//:target
		window.addEventListener('hashchange', lazyEvalLazy, true);

		//:fullscreen
		if(('onmozfullscreenchange' in docElem)){
			window.addEventListener('mozfullscreenchange', lazyEvalLazy, true);
		} else if(('onwebkitfullscreenchange' in docElem)){
			window.addEventListener('webkitfullscreenchange', lazyEvalLazy, true);
		} else {
			window.addEventListener('fullscreenchange', lazyEvalLazy, true);
		}

		if(lazySizesConfig.cssanimation){
			document.addEventListener('animationstart', lazyEvalLazy, true);
			document.addEventListener('transitionstart', lazyEvalLazy, true);
		}
	};

	lazySizesConfig = window.lazySizesConfig || {};

	(function(){
		var prop;
		var lazySizesDefaults = {
			mutation: true,
			hover: true,
			cssanimation: true,
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			scroll: true,
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//addClasses: false,
			//preloadAfterLoad: false,
			onlyLargerSizes: true
		};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;
	})();

	setTimeout(function(){


		lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
		autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);

		if(lazySizesConfig.scroll) {
			addEventListener('scroll', lazyEvalLazy, true);
		}

		addEventListener('resize', lazyEvalLazy, false);
		addEventListener('resize', lazyEvalSizes, false);

		if(/^i|^loade|c/.test(document.readyState)){
			onready();
		} else {
			setTimeout(onready);
		}

		if(document.readyState == 'complete'){
			onload();
		} else {
			addEventListener('load', onload, false);
			document.addEventListener('readystatechange', lazyEvalLazy, false);
		}

		lazyEvalLazy();
	});

	removeClass(docElem, 'no-js');

	return {
		cfg: lazySizesConfig,
		updateAllSizes: lazyEvalSizes,
		updateAllLazy: function(force){
			if(force){
				clearLazyTimer();
				evalLazyElements();
			} else {
				lazyEvalLazy();
			}
		},
		unveilLazy: function(el){
			if(hasClass(el, lazySizesConfig.lazyClass)){
				unveilLazy(el);
			}
		},
		updateSizes: updateSizes,
		updatePolyfill: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent
	};
}));
