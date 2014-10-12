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
	var inViewTreshhold = 99;
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



	function inView(el) {
		var rect = el.getBoundingClientRect();
		var bottom, right, left, top;

		return !!(
			(bottom = rect.bottom) >= (inViewTreshhold * -1) &&
			(top = rect.top) <= window.innerHeight + inViewTreshhold &&
			(right = rect.right) >= (inViewTreshhold * -1) &&
			(left = rect.left) <= window.innerWidth + inViewTreshhold &&
			(bottom || right || left || top)
		);
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
		} else if(!window.HTMLPictureElement && window.console){
			console.log('Please use a responsive image polyfill, like respimage or picturefill. https://github.com/aFarkas/respimage');
		}
	}

	var lazyEvalLazy = (function(){
		var timer, running;
		var run = function(){
			running = false;
			clearTimeout(timer);
			clearLazyTimer();
			evalLazyElements();
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
					timer = setTimeout(run, 66);
				}
			}
		};
	})();

	var evalLazyElements = function (){
		var now, i, checkTime;
		var len = lazyloadElems.length;
		if(len){
			now = Date.now();
			checkTime = 0;

			i = globalLazyIndex || 0;

			clearLazyTimer();

			for(; i < len; i++){
				if (inView(lazyloadElems[i])){
					unveilLazy(lazyloadElems[i]);
				} else  {
					checkTime++;
					if(2 < checkTime && i < len - 1 && Date.now() - now > 9){
						globalLazyIndex = i + 1;
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
				elem.setAttribute(cleanElemAttr, elemAttrs[i].nodeValue);
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

			if(width){
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

	var onload = function(){
		inViewTreshhold *= 3;
		clearTimeout(globalInitialTimer);
		if(window.MutationObserver){
			new MutationObserver( lazyEvalLazy.debounce ).observe( document.body || document.documentElement, {childList: true, subtree: true} );
		} else {
			(document.body || document.documentElement).addEventListener( "DOMNodeInserted", lazyEvalLazy.debounce, true);
		}
		document.body.addEventListener('scroll', lazyEvalLazy.throttled, true);
	};

	window.addEventListener('scroll', lazyEvalLazy.throttled, false);

	window.addEventListener('resize', lazyEvalLazy.debounce, false);
	document.addEventListener('load', lazyEvalLazy.debounce, true);

	document.addEventListener('touchmove', lazyEvalLazy.debounce, true);
	document.addEventListener('readystatechange', lazyEvalLazy.debounce, false);

	window.addEventListener('resize', lazyEvalSizes, false);

	if(document.readyState == 'complete'){
		onload();
	} else {
		window.addEventListener('load', onload, false);
	}
	lazyEvalLazy.debounce();

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
