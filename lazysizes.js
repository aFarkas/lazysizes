(function(window, factory) {
	var lazySizes = factory(window, window.document);
	window.lazySizes = lazySizes;
	if(typeof module == 'object' && module.exports){
		module.exports = lazySizes;
	} else if (typeof define == 'function' && define.amd) {
		define(lazySizes);
	}
}(window, function(window, document) {
	'use strict';
	/*jshint eqnull:true */
	if(!document.getElementsByClassName){return;}

	var lazySizesConfig;

	var docElem = document.documentElement;

	var addEventListener = window.addEventListener;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var hasClass = function(ele, cls) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		return ele.className.match(reg) && reg;
	};

	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.className += ' '+cls;
		}
	};

	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.className = ele.className.replace(reg, ' ');
		}
	};

	var addRemoveLoadEvents = function(dom, fn, add){
		var action = add ? 'addEventListener' : 'removeEventListener';
		if(add){
			addRemoveLoadEvents(dom, fn);
		}
		loadEvents.forEach(function(evt){
			dom[action](evt, fn);
		});
	};

	var triggerEvent = function(elem, name, details, noBubbles, noCanceable){
		var event = document.createEvent('Event');

		event.initEvent(name, !noBubbles, !noCanceable);

		event.details = details || {};

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var polyfill;
		if(!window.HTMLPictureElement){
			if( ( polyfill = (window.picturefill || window.respimage || lazySizesConfig.pf) ) ){
				polyfill({reevaluate: true, reparse: true, elements: [el]});
			} else if(full && full.src){
				el.src = full.src;
			}
		}
	};

	var getCSS = function (elem, style){
		return getComputedStyle(elem, null)[style];
	};

	var getWidth = function(elem, parent){
		var width = elem.offsetWidth;

		while(width < lazySizesConfig.minSize && parent && !elem._lazysizesWidth){
			width =  parent.offsetWidth;
			parent = parent.parentNode;
		}

		return width;
	};

	var throttle = function(fn){
		var run, timer;
		var main = function(){
			if(run){
				run = false;
				fn();
			}
		};
		var handleVisibility = function(){
			clearInterval(timer);
			if(!document.hidden){
				main();
				timer = setInterval(main, 51);
			}
		};

		document.addEventListener('visibilitychange', handleVisibility);
		handleVisibility();

		return function(force){
			run = true;
			if(force === true){
				main();
			}
		};
	};

	var loader = (function(){
		var lazyloadElems, preloadElems, isCompleted, resetPreloadingTimer, loadMode;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

		var defaultExpand, preloadExpand;

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var supportScroll = ('onscroll' in window) && !(/glebot/.test(navigator.userAgent));

		var shrinkExpand = 0;
		var currentExpand = 0;
		var lowRuns = 0;

		var isLoading = 0;

		var checkElementsIndex = 0;

		var resetPreloading = function(e){
			isLoading--;
			if(e && e.target){
				addRemoveLoadEvents(e.target, resetPreloading);
			}

			if(!e || isLoading < 0 || !e.target){
				isLoading = 0;
			}
		};

		var isNestedVisible = function(elem, elemExpand){
			var outerRect;
			var parent = elem;
			var visible = getCSS(elem, 'visibility') != 'hidden';

			eLtop -= elemExpand;
			eLbottom += elemExpand;
			eLleft -= elemExpand;
			eLright += elemExpand;

			while(visible && (parent = parent.offsetParent)){
				visible = (isCompleted && isLoading < 2) || ((getCSS(parent, 'opacity') || 1) > 0);

				if(visible && getCSS(parent, 'overflow') != 'visible'){
					outerRect = parent.getBoundingClientRect();
					visible = eLright > outerRect.left &&
					eLleft < outerRect.right &&
					eLbottom > outerRect.top - 1 &&
					eLtop < outerRect.bottom + 1
					;
				}
			}
			return visible;
		};

		var checkElements = function() {
			var i, start, rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

			var eLlen = lazyloadElems.length;

			if(eLlen && (loadMode = lazySizesConfig.loadMode)){
				start = Date.now();

				i = checkElementsIndex;

				lowRuns++;

				if(currentExpand < preloadExpand && isLoading < 1 && lowRuns > 5 && loadMode > 2){
					currentExpand = preloadExpand;
					lowRuns = 0;
				} else if(currentExpand != defaultExpand && loadMode > 1 && lowRuns > 4){
					currentExpand = defaultExpand;
				} else {
					currentExpand = shrinkExpand;
				}

				for(; i < eLlen; i++, checkElementsIndex++){

					if(!lazyloadElems[i] || lazyloadElems[i]._lazyRace){continue;}

					if(!supportScroll){unveilElement(lazyloadElems[i]);continue;}

					if(!(elemExpandVal = lazyloadElems[i].getAttribute('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if(isLoading > 6 && (!elemExpandVal || ('src' in lazyloadElems[i]))){continue;}

					if(elemExpand > shrinkExpand && (loadMode < 2 || isLoading > 3)){
						elemExpand = shrinkExpand;
					}

					if(beforeExpandVal !== elemExpand){
						eLvW = innerWidth + elemExpand;
						elvH = innerHeight + elemExpand;
						elemNegativeExpand = elemExpand * -1;
						beforeExpandVal = elemExpand;
					}

					rect = lazyloadElems[i].getBoundingClientRect();

					if ((eLbottom = rect.bottom) >= elemNegativeExpand &&
						(eLtop = rect.top) <= elvH &&
						(eLright = rect.right) >= elemNegativeExpand &&
						(eLleft = rect.left) <= eLvW &&
						(eLbottom || eLright || eLleft || eLtop) &&
						((isCompleted && currentExpand < preloadExpand && isLoading < 3 && lowRuns < 4 && !elemExpandVal && loadMode > 2) || isNestedVisible(lazyloadElems[i], elemExpand))){
						checkElementsIndex--;
						start += 2;
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
					} else  {
						if(Date.now() - start > 3){
							checkElementsIndex++;
							throttledCheckElements();
							return;
						}

						if(!loadedSomething && isCompleted && !autoLoadElem &&
							isLoading < 3 && lowRuns < 4 && loadMode > 2 &&
							(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
							(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i].getAttribute(lazySizesConfig.sizesAttr) != 'auto')))){
							autoLoadElem = preloadElems[0] || lazyloadElems[i];
						}
					}
				}

				checkElementsIndex = 0;

				if(autoLoadElem && !loadedSomething){
					unveilElement(autoLoadElem);
				}
			}
		};

		var throttledCheckElements = throttle(checkElements);

		var switchLoadingClass = function(e){
			addClass(e.target, lazySizesConfig.loadedClass);
			removeClass(e.target, lazySizesConfig.loadingClass);
			addRemoveLoadEvents(e.target, switchLoadingClass);
		};

		var changeIframeSrc = function(elem, src){
			try {
				elem.contentWindow.location.replace(src);
			} catch(e){
				elem.setAttribute('src', src);
			}
		};

		var unveilElement = function (elem, force){
			var sources, i, len, sourceSrcset, src, srcset, parent, isPicture, event, firesLoad, customMedia;

			var curSrc = elem.currentSrc || elem.src;
			var isImg = regImg.test(elem.nodeName);

			//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
			var sizes = elem.getAttribute(lazySizesConfig.sizesAttr) || elem.getAttribute('sizes');
			var isAuto = sizes == 'auto';

			if( (isAuto || !isCompleted) && isImg && curSrc && !elem.complete && !hasClass(elem, lazySizesConfig.errorClass)){return;}

			elem._lazyRace = true;

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', {force: !!force})).defaultPrevented){

				if(sizes){
					if(isAuto){
						autoSizer.updateElem(elem, true);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem.getAttribute(lazySizesConfig.srcsetAttr);
				src = elem.getAttribute(lazySizesConfig.srcAttr);

				if(isImg) {
					parent = elem.parentNode;
					isPicture = regPicture.test(parent.nodeName || '');
				}

				firesLoad = event.details.firesLoad || (('src' in elem) && (srcset || src || isPicture));

				if(firesLoad){
					isLoading++;
					addRemoveLoadEvents(elem, resetPreloading, true);
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 3000);
				}

				if(isPicture){
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						if( (customMedia = lazySizesConfig.customMedia[sources[i].getAttribute('data-media') || sources[i].getAttribute('media')]) ){
							sources[i].setAttribute('media', customMedia);
						}
						sourceSrcset = sources[i].getAttribute(lazySizesConfig.srcsetAttr);
						if(sourceSrcset){
							sources[i].setAttribute('srcset', sourceSrcset);
						}
					}
				}

				if(srcset){
					elem.setAttribute('srcset', srcset);
				} else if(src){
					if(regIframe.test(elem.nodeName)){
						changeIframeSrc(elem, src);
					} else {
						elem.setAttribute('src', src);
					}
				}

				addClass(elem, lazySizesConfig.loadingClass);
				addRemoveLoadEvents(elem, switchLoadingClass, true);
			}

			setTimeout(function(){
				if(elem._lazyRace){
					delete elem._lazyRace;
				}

				if(sizes == 'auto'){
					addClass(elem, lazySizesConfig.autosizesClass);
				}

				if(srcset || isPicture){
					updatePolyfill(elem, {src: src});
				}

				removeClass(elem, lazySizesConfig.lazyClass);

				//remove curSrc == (elem.currentSrc || elem.src) it's a workaround for FF. see: https://bugzilla.mozilla.org/show_bug.cgi?id=608261
				if( !firesLoad || (elem.complete && curSrc == (elem.currentSrc || elem.src)) ){
					if(firesLoad){
						resetPreloading(event);
					}
					switchLoadingClass(event);
				}
				elem = null;
			});
		};

		var onload = function(){
			var scrollTimer;
			var afterScroll = function(){
				lazySizesConfig.loadMode = 3;
				throttledCheckElements();
			};

			isCompleted = true;
			lowRuns += 8;

			lazySizesConfig.loadMode = 3;
			throttledCheckElements(true);

			addEventListener('scroll', function(){
				if(lazySizesConfig.loadMode == 3){
					lazySizesConfig.loadMode = 2;
				}
				clearTimeout(scrollTimer);
				scrollTimer = setTimeout(afterScroll, 66);
			}, true);
		};

		return {
			_: function(){

				lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
				preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass + ' ' + lazySizesConfig.preloadClass);

				defaultExpand = lazySizesConfig.expand;
				preloadExpand = defaultExpand * lazySizesConfig.expFactor;

				addEventListener('scroll', throttledCheckElements, true);

				addEventListener('resize', throttledCheckElements, true);

				if(window.MutationObserver){
					new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
				} else {
					docElem.addEventListener('DOMNodeInserted', throttledCheckElements, true);
					docElem.addEventListener('DOMAttrModified', throttledCheckElements, true);
					setInterval(throttledCheckElements, 3000);
				}

				addEventListener('hashchange', throttledCheckElements, true);

				['transitionstart', 'transitionend', 'load', 'focus', 'mouseover', 'animationend', 'click'].forEach(function(name){
					document.addEventListener(name, throttledCheckElements, true);
				});

				if(!(isCompleted = /d$|^c/.test(document.readyState))){
					addEventListener('load', onload);
					document.addEventListener('DOMContentLoaded', throttledCheckElements);
				} else {
					onload();
				}

				throttledCheckElements(lazyloadElems.length > 0);
			},
			checkElems: throttledCheckElements,
			unveil: unveilElement
		};
	})();


	var autoSizer = (function(){
		var autosizesElems;

		var sizeElement = function (elem, dataAttr){
			var width, sources, i, len, event;
			var parent = elem.parentNode;

			if(parent){
				width = getWidth(elem, parent);
				event = triggerEvent(elem, 'lazybeforesizes', {width: width, dataAttr: !!dataAttr});

				if(!event.defaultPrevented){
					width = event.details.width;

					if(width && width !== elem._lazysizesWidth){
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
							updatePolyfill(elem, event.details);
						}
					}
				}
			}
		};

		var updateElementsSizes = function(){
			var i;
			var len = autosizesElems.length;
			if(len){
				i = 0;

				for(; i < len; i++){
					sizeElement(autosizesElems[i]);
				}
			}
		};

		var throttledUpdateElementsSizes = throttle(updateElementsSizes);

		return {
			_: function(){
				autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
				addEventListener('resize', throttledUpdateElementsSizes);
			},
			checkElems: throttledUpdateElementsSizes,
			updateElem: sizeElement
		};
	})();

	var init = function(){
		if(!init.i){
			init.i = true;
			autoSizer._();
			loader._();
		}
	};

	(function(){
		var prop;
		var lazySizesDefaults = {
			lazyClass: 'lazyload',
			loadedClass: 'lazyloaded',
			loadingClass: 'lazyloading',
			preloadClass: 'lazypreload',
			errorClass: 'lazyerror',
			autosizesClass: 'lazyautosizes',
			srcAttr: 'data-src',
			srcsetAttr: 'data-srcset',
			sizesAttr: 'data-sizes',
			//preloadAfterLoad: false,
			minSize: 50,
			customMedia: {},
			init: true,
			expFactor: 2,
			expand: 300,
			loadMode: 2
		};

		lazySizesConfig = window.lazySizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;

		setTimeout(function(){
			if(lazySizesConfig.init){
				init();
			}
		});
	})();

	return {
		cfg: lazySizesConfig,
		autoSizer: autoSizer,
		loader: loader,
		init: init,
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth
	};
}));
