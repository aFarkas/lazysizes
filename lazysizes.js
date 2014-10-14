(function (factory) {
	window.lazySizes = factory();
	if (typeof define === 'function' && define.amd) {
		define(function() {
			return window.lazySizes;
		});
	}
}(function () {
	'use strict';

	if(!Date.now || !window.document.getElementsByClassName){return;}

	var lazyloadElems, autosizesElems, lazySizesConfig, globalSizesTimer,
		globalSizesIndex, globalLazyTimer, globalLazyIndex, globalInitialTimer,
		addClass, removeClass, hasClass, isWinloaded;
	var document = window.document;
	var isPreloading = 0;

	var regDummyTags = /^(?:span|div)$/i;
	var regPicture = /^picture$/i;
	var regScript = /^script$/i;
	var regImg = /^img$/i;
	var noDataTouch = {sizes: 1, src: 1, srcset: 1};
	var inViewTreshhold = 66;

	var setImmediate = window.setImmediate || window.setTimeout;
	var scriptUrls = {};
	var unveilAfterLoad = function(e){
		e.target.removeEventListener('load', unveilAfterLoad, false);
		e.target.removeEventListener('error', unveilAfterLoad, false);
		unveilLazy(e.target, true);
	};

	if(document.documentElement.classList){
		addClass = function(el, cls){
			el.classList.add(cls);
		};
		removeClass = function(el, cls){
			el.classList.remove(cls);
		};
		hasClass = function(el, cls){
			el.classList.contains(cls);
		};
	} else {
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
	}

	function updatePolyfill(el, full){
		var imageData;
		if(window.picturefill){
			picturefill({reevaluate: true, reparse: true, elements: [el]});
		} else if(window.respimage && !respimage._.observer){
			if(full){
				imageData = el[respimage._.ns];
				if(imageData){
					imageData[full.srcset ? 'srcset' : 'src'] = undefined;
				}
			}
			respimage({reparse: true, elements: [el]});
		} else if(!window.HTMLPictureElement && window.console && document.readyState == 'complete'){
			console.log('Please use a responsive image polyfill, like respimage or picturefill. https://github.com/aFarkas/respimage');
		}
	}

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
		return {
			debounce: function(){
				clearTimeout(timer);
				clearTimeout(globalInitialTimer);
				running = true;
				timer = setTimeout(run, 66);
			},
			throttled: function(){
				if(!running){
					running = true;
					clearTimeout(timer);
					timer = setTimeout(run, 99);
				}
			}
		};
	})();

	var eLlen, eLnow, eLvW, elvH, eLtop, eLleft, eLright, eLbottom, eLnegativeTreshhold;
	var evalLazyElements = function (){
		var rect, autoLoadElem, loadedSomething;
		eLlen = lazyloadElems.length;
		if(eLlen){
			eLnow = Date.now();
			eLvW = window.innerWidth + inViewTreshhold;
			elvH = window.innerHeight + inViewTreshhold;
			eLnegativeTreshhold = inViewTreshhold * -1;

			for(; globalLazyIndex < eLlen; globalLazyIndex++){
				rect = lazyloadElems[globalLazyIndex].getBoundingClientRect();

				if ((eLbottom = rect.bottom) >= eLnegativeTreshhold &&
					(eLtop = rect.top) <= elvH &&
					(eLright = rect.right) >= eLnegativeTreshhold &&
					(eLleft = rect.left) <= eLvW &&
					(eLbottom || eLright || eLleft || eLtop)){
					unveilLazy(lazyloadElems[globalLazyIndex]);
					loadedSomething = true;
				} else  {

					if(!loadedSomething && isWinloaded && !autoLoadElem &&
						lazySizesConfig.preloadAfterLoad && isPreloading < 2 &&
						((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[globalLazyIndex].getAttribute(lazySizesConfig.sizesAttr) != 'auto')){
						autoLoadElem = lazyloadElems[globalLazyIndex];
					}
					if(globalLazyIndex < eLlen - 1 && Date.now() - eLnow > 9){
						globalLazyIndex = globalLazyIndex + 1;
						autoLoadElem = false;
						globalLazyTimer = setTimeout(evalLazyElements, 4);
						break;
					}
				}
			}

			if(autoLoadElem && !loadedSomething){
				preload(autoLoadElem);
			}
		}
	};
	var resetPreloadingTimer;
	var resetPreloading = function(e){
		isPreloading--;
		clearTimeout(resetPreloadingTimer);
		if(e && e.target){
			e.target.removeEventListener('load', resetPreloading, false);
			e.target.removeEventListener('error', resetPreloading, false);
			e.target.removeEventListener('abort', resetPreloading, false);
			e.target.removeEventListener('readystatechange', resetPreloading, false);
		}
	};

	function preload(elem){
		isPreloading++;
		elem = unveilLazy(elem);
		elem.addEventListener('load', resetPreloading, false);
		elem.addEventListener('abort', resetPreloading, false);
		elem.addEventListener('readystatechange', resetPreloading, false);
		elem.addEventListener('error', resetPreloading, false);
		clearTimeout(resetPreloadingTimer);
		resetPreloadingTimer = setTimeout(resetPreloading, 5000);
	}

	function transformDummy(dummyEl){
		var i, len, elemAttr, cleanElemAttr, elem, parent;
		var nodeName = dummyEl.getAttribute('data-tag') || 'img';
		var elemAttrs = dummyEl.attributes;

		elem = document.createElement(nodeName);

		if(nodeName != 'script'){
			for(i = 0, len = elemAttrs.length; i < len; i++){
				elemAttr = elemAttrs[i].nodeName;
				cleanElemAttr = elemAttr.replace(/^data\-/, '');
				if (cleanElemAttr == 'tag') {
					continue;
				}
				if(noDataTouch[cleanElemAttr] || !(elemAttr in elem)){
					cleanElemAttr = elemAttr;
				}
				elem.setAttribute(cleanElemAttr, elemAttrs[i].value);
			}
		}

		parent = dummyEl.parentNode;

		if(parent){
			parent.insertBefore(elem, dummyEl);
			if(nodeName != 'script'){
				parent.removeChild(dummyEl);
			} else {
				dummyEl.removeAttribute(lazySizesConfig.srcAttr);
				setImmediate(function(){
					removeClass(dummyEl, lazySizesConfig.lazyClass);
				});
			}
		}
		return elem;
	}

	function clearLazyTimer(){
		globalLazyIndex = 0;
		clearTimeout(globalLazyTimer);
	}

	function unveilLazy(elem, force){
		var sources, i, len, sourceSrcset;
		var sizes = elem.getAttribute(lazySizesConfig.sizesAttr);
		var src = elem.getAttribute(lazySizesConfig.srcAttr);
		var srcset = elem.getAttribute(lazySizesConfig.srcsetAttr);
		var parent = elem.parentNode;

		if(src || srcset){

			if(regDummyTags.test(elem.nodeName)){
				elem = transformDummy(elem);
			}

			if(regScript.test(elem.nodeName || '')){
				if(scriptUrls[src]){
					return;
				} else {
					scriptUrls[src] = true;
				}
			} else if(regImg.test(elem.nodeName || '')) {

				//LQIP
				if(!force && !elem.complete && elem.getAttribute('src') && elem.src && !elem.lazyload){
					elem.removeEventListener('load', unveilAfterLoad, false);
					elem.removeEventListener('error', unveilAfterLoad, false);
					elem.addEventListener('load', unveilAfterLoad, false);
					elem.addEventListener('error', unveilAfterLoad, false);
					return;
				}
				if(regPicture.test(parent.nodeName || '')){
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						sourceSrcset = sources[i].getAttribute(lazySizesConfig.srcsetAttr);
						if(sourceSrcset){
							sources[i].setAttribute('srcset', sourceSrcset);
						}
					}
				}
			}

			if(sizes){
				if(sizes == 'auto'){
					updateSizes(elem, true);
				} else {
					elem.setAttribute('sizes', sizes);
				}
				elem.removeAttribute(lazySizesConfig.sizesAttr);
				if (!srcset && window.console && elem.getAttribute('srcset')){
					console.log('using lazysizes with a `srcset` attribute is not good. Use `data-srcset` instead');
				}
			}

			if(srcset){
				elem.setAttribute('srcset', srcset);
				elem.removeAttribute(lazySizesConfig.srcsetAttr);
			} else if(src){
				elem.setAttribute('src', src);
				elem.removeAttribute(lazySizesConfig.srcAttr);
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

	function updateSizes(elem, noPolyfill){
		var parentWidth, elemWidth, width, parent, sources, i, len;
		parent = elem.parentNode;

		if(parent){
			parentWidth = parent.offsetWidth;
			elemWidth = elem.offsetWidth;
			width = (elemWidth > parentWidth) ?
				elemWidth :
				parentWidth;

			if(width && (!elem._lazysizesWidth || elemWidth > 99)){
				elem._lazysizesWidth = 1;
				width += 'px';
				elem.setAttribute('sizes', width);

				if(regPicture.test(parent.nodeName || '')){
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						sources[i].setAttribute('sizes', width);
					}
				}

				if(!noPolyfill){
					updatePolyfill(elem);
				}
			}
		}
	}

	// bind to all possible events ;-) This might look like a performance disaster, but it isn't.
	// The main check functions are written to run extreme fast without consuming memory.
	var onload = function(){
		inViewTreshhold *= 5;
		clearTimeout(globalInitialTimer);

		document.addEventListener('load', lazyEvalLazy.throttled, true);
		isWinloaded = true;
	};
	var onready = function(){
		var element = document.body || document.documentElement;

		if(lazySizesConfig.mutation){
			if(window.MutationObserver){
				new MutationObserver( lazyEvalLazy.throttled ).observe( document.documentElement, {childList: true, subtree: true, attributes: true} );
			} else {
				element.addEventListener( "DOMNodeInserted", lazyEvalLazy.throttled, true);
				document.documentElement.addEventListener( "DOMAttrModified", lazyEvalLazy.throttled, true);
			}
		}

		//:hover
		if(lazySizesConfig.hover){
			document.addEventListener('mouseover', lazyEvalLazy.throttled, true);
		}
		//:focus/active
		document.addEventListener('focus', lazyEvalLazy.throttled, true);
		//:target
		window.addEventListener('hashchange', lazyEvalLazy.throttled, true);

		//:fullscreen
		if(('onmozfullscreenchange' in element)){
			window.addEventListener('mozfullscreenchange', lazyEvalLazy.throttled, true);
		} else if(('onwebkitfullscreenchange' in element)){
			window.addEventListener('webkitfullscreenchange', lazyEvalLazy.throttled, true);
		} else {
			window.addEventListener('fullscreenchange', lazyEvalLazy.throttled, true);
		}

		if(lazySizesConfig.cssanimation){
			document.addEventListener('animationstart', lazyEvalLazy.throttled, true);
			document.addEventListener('transitionstart', lazyEvalLazy.throttled, true);
		}
	};

	setTimeout(function(){
		var prop;
		var lazySizesDefaults = {
			mutation: true,
			hover: true,
			cssanimation: true,
			lazyClass: 'lazyload',
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			preloadAfterLoad: false
		};

		lazySizesConfig = window.lazySizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
		autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);

		window.addEventListener('scroll', lazyEvalLazy.throttled, false);
		(document.body || document.documentElement).addEventListener('scroll', lazyEvalLazy.throttled, true);
		document.addEventListener('touchmove', lazyEvalLazy.throttled, false);

		window.addEventListener('resize', lazyEvalLazy.debounce, false);
		window.addEventListener('resize', lazyEvalSizes, false);

		if(	/^i|^loade|c/.test(document.readyState) ){
			onready();
		} else {
			document.addEventListener('DOMContentLoaded', onready, false);
		}

		if(document.readyState == 'complete'){
			onload();
		} else {
			window.addEventListener('load', onload, false);
			document.addEventListener('readystatechange', lazyEvalLazy.throttled, false);
		}
		lazyEvalLazy.throttled();

		if('lazySizesConfig' in window){
			window.lazySizesConfig = null;
		}

	}, document.body ? 9 : 99);

	return {
		updateAllSizes: lazyEvalSizes,
		updateAllLazy: lazyEvalLazy.throttled,
		unveilLazy: function(el){
			if(hasClass(el, lazySizesConfig.lazyClass)){
				unveilLazy(el);
			}
		},
		updateSizes: updateSizes,
		transformDummy: transformDummy,
		updatePolyfill: updatePolyfill
	};
}));
