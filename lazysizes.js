(function (factory) {
	window.lazySizes = factory(window);
	if (typeof define === 'function' && define.amd) {
		define(window.lazySizes);
	}
}(function (window) {
	'use strict';
	/*jshint eqnull:true */
	if(!window.document.getElementsByClassName){return;}

	var lazyloadElems, autosizesElems, preloadElems, lazySizesConfig,
		globalSizesIndex, addClass, removeClass, hasClass, isWinloaded;

	var document = window.document;
	var docElem = document.documentElement;
	var isPreloading = 0;
	var fixChrome = window.HTMLPictureElement && navigator.userAgent.match(/hrome\/(\d+)/) && (RegExp.$1 == 40);
	var supportNativeLQIP = (/blink|webkit/i).test(navigator.userAgent);

	var regPicture = /^picture$/i;
	var regImg = /^img$/i;
	var regLoadElems = /^(?:img|iframe)$/i;


	var inViewLow = -2;
	var inViewThreshold = inViewLow;
	var inViewHigh = 40;

	var lowRuns = 0;
	var globalLazyIndex = 0;

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? 'addEventListener' : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		['load', 'error', 'lazyincluded', '_lazyloaded'].forEach(function(evt){
			dom[action](evt, fn, true);
		});
	};

	var triggerEvent = function(elem, name, details){
		var event = document.createEvent('Event');

		event.initEvent(name, true, true);

		event.details = details || {};

		elem.dispatchEvent(event);
		return event;
	};

	addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.className += " "+cls;
		}
	};
	removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.className = ele.className.replace(reg,' ');
		}
	};
	hasClass = function(ele,cls) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		return ele.className.match(reg) && reg;
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

	function getCSS(elem, style){
		return getComputedStyle(elem, null)[style];
	}

	var eLlen, resetPreloadingTimer, eLvW, elvH, eLtop, eLleft, eLright, eLbottom, eLnegativeTreshhold;
	var resetPreloading = function(e){
		isPreloading--;
		if(e && e.target){
			addRemoveLoadEvents(e.target, resetPreloading);
		}
		if(!e || isPreloading < 0 || !e.target){
			isPreloading = 0;
		}
	};
	var lazyEvalLazy = (function(){
		var timer, running;

		var run = function(){
			clearTimeout(timer);
			globalLazyIndex = 0;
			evalLazyElements();
			running = false;
		};
		return  function(){
			if(!running){
				running = true;
				clearTimeout(timer);
				timer = setTimeout(run, 66);
			}
		};
	})();
	var isNestedVisibile = function(elem){
		var outerRect;
		var parent = elem;
		var visible = getCSS(elem, 'visibility') != 'hidden';
		var expand = isPreloading < 3 ? inViewThreshold : -2;

		eLtop -= expand;
		eLbottom += expand;
		eLleft -= expand;
		eLright += expand;

		while(visible && (parent = parent.offsetParent) && parent != docElem && parent != document.body){
			visible = (getCSS(parent, 'opacity') || 1) > 0;
			if(visible && getCSS(parent, 'overflow') != 'visible'){
				outerRect = parent.getBoundingClientRect();
				visible = eLright > outerRect.left - 1 &&
					eLleft < outerRect.right + 1 &&
					eLbottom > outerRect.top - 1 &&
					eLtop < outerRect.bottom + 1
				;
			}
		}
		return visible;
	};

	var evalLazyElements = function (){
		var rect, autoLoadElem, loadedSomething;
		eLlen = lazyloadElems.length;
		if(eLlen){
			eLvW = innerWidth + inViewThreshold;
			elvH = innerHeight + inViewThreshold;
			eLnegativeTreshhold = inViewThreshold * -1;

			for(; globalLazyIndex < eLlen; globalLazyIndex++){

				if(isPreloading > 3 && inViewThreshold > 0){
					inViewThreshold = -2;
					eLvW = innerWidth + inViewThreshold;
					elvH = innerHeight + inViewThreshold;
					eLnegativeTreshhold = 2;
				}

				rect = lazyloadElems[globalLazyIndex].getBoundingClientRect();

				if ((eLbottom = rect.bottom) >= eLnegativeTreshhold &&
					(eLtop = rect.top) <= elvH &&
					(eLright = rect.right) >= eLnegativeTreshhold &&
					(eLleft = rect.left) <= eLvW &&
					(eLbottom || eLright || eLleft || eLtop) &&
					((isWinloaded && inViewThreshold == inViewLow && isPreloading < 3 && lowRuns < 9) || isNestedVisibile(lazyloadElems[globalLazyIndex]))){
					unveilLazy(lazyloadElems[globalLazyIndex]);
					loadedSomething = true;
				} else  {

					if(!loadedSomething && isWinloaded && !autoLoadElem &&
						isPreloading < 3 && lowRuns < 9 &&
						(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
						(preloadElems[0] || (eLbottom || eLright || eLleft || eLtop) || lazyloadElems[globalLazyIndex].getAttribute(lazySizesConfig.sizesAttr) != 'auto')){
						autoLoadElem = preloadElems[0] || lazyloadElems[globalLazyIndex];
					}
				}
			}

			lowRuns++;

			if(inViewThreshold < inViewHigh && isPreloading < 2 && lowRuns > 9){
				inViewThreshold = inViewHigh;
				lowRuns = 0;
				setTimeout(lazyEvalLazy);
			} else if(inViewThreshold != inViewLow){
				inViewThreshold = inViewLow;
			}

			if(autoLoadElem && !loadedSomething){
				unveilLazy(autoLoadElem);
			}
		}
	};
	var switchLoadingClass = function(e){
		addClass(e.target, lazySizesConfig.loadedClass);
		removeClass(e.target, lazySizesConfig.loadingClass);
		addRemoveLoadEvents(e.target, switchLoadingClass);
	};

	function unveilLazy(elem, force){
		var sources, i, len, sourceSrcset, sizes, src, srcset, parent, isPicture, event;

		var curSrc = elem.currentSrc || elem.src;
		var isImg = regImg.test(elem.nodeName);

		if(!supportNativeLQIP && !isWinloaded && isImg && curSrc && !elem.complete){return;}
		if(!(event = triggerEvent(elem, 'lazybeforeunveil', {force: !!force})).defaultPrevented){

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

			isPreloading++;
			addRemoveLoadEvents(elem, resetPreloading, true);
			clearTimeout(resetPreloadingTimer);
			resetPreloadingTimer = setTimeout(resetPreloading, 3000);

			if(isImg) {
				parent = elem.parentNode;
				isPicture = regPicture.test(parent.nodeName || '');
			}

			if(isImg){
				addClass(elem, lazySizesConfig.loadingClass);

				addRemoveLoadEvents(elem, switchLoadingClass, true);
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

		setTimeout(function(){
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
			if( !event.details.firesLoad && (!regLoadElems.test(elem.nodeName) || (!srcset && !src) || (elem.complete && curSrc == (elem.currentSrc || elem.src))) ){
				if(lazySizesConfig.addClasses){
					switchLoadingClass({target: elem});
				}
				resetPreloading({target: elem});
			}
			elem = null;
		});
	}

	var lazyEvalSizes = (function(){
		var timer;
		var run = function(){
			clearTimeout(timer);
			globalSizesIndex = 0;
			evalSizesElements();
		};
		return function(){
			clearTimeout(timer);
			timer = setTimeout(run, 99);
		};
	})();

	var evalSizesElements = function(){
		var i;
		var len = autosizesElems.length;
		if(len){
			i = globalSizesIndex || 0;

			for(; i < len; i++){
				updateSizes(autosizesElems[i]);
			}
		}
	};
	var getWidth = function(elem, parent){
		var width, alt;
		if(!elem._lazysizesWidth){
			alt = elem.getAttribute('alt');
			elem.alt = '';
		}

		width = elem.offsetWidth;

		while(width < lazySizesConfig.minSize && parent && parent != document.body && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		if(!elem._lazysizesWidth){
			if(alt == null){
				elem.removeAttribute('alt');
			} else {
				elem.alt = alt;
			}
		}

		return width;
	};

	function updateSizes(elem, dataAttr){
		var width, sources, i, len, event;
		var parent = elem.parentNode;

		if(parent){
			width = getWidth(elem, parent);
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

	var onload = function(){
		inViewLow = Math.max( Math.min(lazySizesConfig.threshold || 150, 300), 9 );
		inViewHigh = Math.min( inViewLow * 7, Math.max(innerHeight * 1.3, docElem.clientHeight * 1.3, inViewLow * 4) );
		isWinloaded = /d$|^c/.test(document.readyState);
		inViewThreshold = isWinloaded ? inViewHigh : inViewLow;
	};

	lazySizesConfig = window.lazySizesConfig || {};

	(function(){
		var prop;
		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			scroll: true,
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//addClasses: false,
			//preloadAfterLoad: false,
			onlyLargerSizes: true,
			minSize: 40
		};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;
	})();

	setTimeout(function(){
		var readyState = document.readyState;
		lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
		preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass+' '+lazySizesConfig.preloadClass);
		autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);

		if(lazySizesConfig.scroll) {
			addEventListener('scroll', lazyEvalLazy, true);
		}

		addEventListener('resize', lazyEvalLazy, false);
		addEventListener('resize', lazyEvalSizes, false);

		if(window.MutationObserver){
			new MutationObserver( lazyEvalLazy ).observe( docElem, {childList: true, subtree: true, attributes: true} );
		} else {
			docElem.addEventListener('DOMNodeInserted', lazyEvalLazy, true);
			docElem.addEventListener('DOMAttrModified', lazyEvalLazy, true);
		}

		addEventListener('hashchange', lazyEvalLazy, true);

		//ToDo?: 'animationstart', 'fullscreenchange'
		['transitionstart', 'transitionend', 'load', 'focus', 'mouseover', 'animationend'].forEach(function(evt){
			document.addEventListener(evt, lazyEvalLazy, true);
		});


		if(/d$|^c/.test(readyState)){
			onload();
		} else {
			document.addEventListener('DOMContentLoaded', lazyEvalLazy, false);
			addEventListener('load', onload, false);
			setTimeout(onload, 6000);
		}
		lazyEvalLazy();
	});

	return {
		cfg: lazySizesConfig,
		updateAllSizes: lazyEvalSizes,
		updateAllLazy: function(force){
			if(force){
				globalLazyIndex = 0;
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
		//undocumented methods
		uS: updateSizes,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth
	};
}));
