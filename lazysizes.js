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

	var globalSizesTimer, globalSizesIndex, globalLazyTimer, globalLazyIndex, globalInitialTimer, addClass, removeClass, hasClass;
	var document = window.document;

	var regDummyTags = /^(?:span|div)$/i;
	var regPicture = /^picture$/i;
	var regScript = /^script$/i;
	var regImg = /^img$/i;
	var noDataTouch = {sizes: 1, src: 1, srcset: 1};
	var inViewTreshhold = 66;
	var lazyloadElems = document.getElementsByClassName('lazyload');
	var autosizesElems = document.getElementsByClassName('lazyautosizes');
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

	var evalLazyElements = function (){
		var now, vW, vH, rect, top, left, right, bottom, negativeTreshhold;
		var len = lazyloadElems.length;
		if(len){
			now = Date.now();
			vW = window.innerWidth + inViewTreshhold;
			vH = window.innerHeight + inViewTreshhold;
			negativeTreshhold = inViewTreshhold * -1;

			for(; globalLazyIndex < len; globalLazyIndex++){
				rect = lazyloadElems[globalLazyIndex].getBoundingClientRect();

				if ((bottom = rect.bottom) >= negativeTreshhold &&
					(top = rect.top) <= vH &&
					(right = rect.right) >= negativeTreshhold &&
					(left = rect.left) <= vW &&
					(bottom || right || left || top)){
					unveilLazy(lazyloadElems[globalLazyIndex]);
				} else  {
					if(globalLazyIndex < len - 1 && Date.now() - now > 7){
						globalLazyIndex = globalLazyIndex + 1;
						globalLazyTimer = setTimeout(evalLazyElements, 20);
						break;
					}
				}
			}
		}
	};

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
				dummyEl.removeAttribute('data-src');
				setImmediate(function(){
					removeClass(dummyEl, 'lazyload');
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
		var sizes = elem.getAttribute('data-sizes');
		var src = elem.getAttribute('data-src');
		var srcset = elem.getAttribute('data-srcset');
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
				if(!force && !elem.complete && elem.getAttribute('src') && elem.src){
					elem.removeEventListener('load', unveilAfterLoad, false);
					elem.removeEventListener('error', unveilAfterLoad, false);
					elem.addEventListener('load', unveilAfterLoad, false);
					elem.addEventListener('error', unveilAfterLoad, false);
					return;
				}
				if(regPicture.test(parent.nodeName || '')){
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						sourceSrcset = sources[i].getAttribute('data-srcset');
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
				elem.removeAttribute('data-sizes');
				if (!srcset && window.console && elem.getAttribute('srcset')){
					console.log('using lazysizes with a `srcset` attribute is not good. Use `data-srcset` instead');
				}
			}

			if(srcset){
				elem.setAttribute('srcset', srcset);
				elem.removeAttribute('data-srcset');
			} else if(src){
				elem.setAttribute('src', src);
				elem.removeAttribute('data-src');
			}
		}

		setImmediate(function(){
			removeClass(elem, 'lazyload');
			if(sizes == 'auto'){
				addClass(elem, 'lazyautosizes');
			}

			if(srcset || sizes){
				updatePolyfill(elem, {srcset: srcset, src: src});
			}
		});
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

					globalSizesTimer = setTimeout(evalSizesElements, 20);
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

	var lazySizesConfig;
	// bind to all possible events ;-) This might look like a performance disaster, but it isn't.
	// The main check functions are written to run extreme fast without consuming memory.
	var onload = function(){
		inViewTreshhold *= 5;
		clearTimeout(globalInitialTimer);

		document.addEventListener('load', lazyEvalLazy.throttled, true);
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

		if(lazySizesConfig.cssanimation){
			document.addEventListener('animationstart', lazyEvalLazy.throttled, true);
			document.addEventListener('transitionstart', lazyEvalLazy.throttled, true);
		}

		//:fullscreen
		if(('onmozfullscreenchange' in element)){
			window.addEventListener('mozfullscreenchange', lazyEvalLazy.throttled, true);
		} else if(('onwebkitfullscreenchange' in element)){
			window.addEventListener('webkitfullscreenchange', lazyEvalLazy.throttled, true);
		} else {
			window.addEventListener('fullscreenchange', lazyEvalLazy.throttled, true);
		}
	};

	setTimeout(function(){
		var prop;
		var lazySizesDefaults = {mutation: true, hover: true, cssanimation: true};
		lazySizesConfig = window.lazySizesConfig || {};
		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

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
	}, document.body ? 9 : 99);

	return {
		updateAllSizes: lazyEvalSizes,
		updateAllLazy: lazyEvalLazy.throttled,
		unveilLazy: function(el){
			if(hasClass(el, 'lazyload')){
				unveilLazy(el);
			}
		},
		updateSizes: updateSizes
	};
}));
