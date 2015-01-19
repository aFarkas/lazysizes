(function (window, factory) {
	window.lazySizes = factory(window, window.document);
	if (typeof define === 'function' && define.amd) {
		define(window.lazySizes);
	}
}(window, function (window, document) {
	'use strict';
	/*jshint eqnull:true */
	if(!document.getElementsByClassName){return;}

	var lazySizesConfig;

	var docElem = document.documentElement;

	var regPicture = /^picture$/i;

	var loadEvents = ['load', 'error', 'lazyincluded', '_lazyloaded'];

	var hasClass = function(ele,cls) {
		var reg = new RegExp('(\\s|^)'+cls+'(\\s|$)');
		return ele.className.match(reg) && reg;
	};

	var addClass = function(ele, cls) {
		if (!hasClass(ele, cls)){
			ele.className += " "+cls;
		}
	};

	var removeClass = function(ele, cls) {
		var reg;
		if ((reg = hasClass(ele,cls))) {
			ele.className = ele.className.replace(reg,' ');
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

	var triggerEvent = function(elem, name, details){
		var event = document.createEvent('Event');

		event.initEvent(name, true, true);

		event.details = details || {};

		elem.dispatchEvent(event);
		return event;
	};

	var updatePolyfill = function (el, full){
		var imageData, attr;
		if(!window.HTMLPictureElement){

			if(window.picturefill){
				picturefill({reevaluate: true, reparse: true, elements: [el]});
			} else if(window.respimage){
				if(full && (attr = (full.srcset && 'srcset') || (full.src && 'src'))){

					imageData = el[respimage._.ns];
					if(imageData && imageData[attr] != full[attr] && el.getAttribute(attr) == full[attr]){
						imageData[attr] = undefined;
					}
				}
				respimage({reparse: true, elements: [el]});
			} else if(full && full.src){
				el.src = full.src;
			}

		}
	};

	var getCSS = function (elem, style){
		return getComputedStyle(elem, null)[style];
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

	var throttle = function(fn){
		var run;
		setInterval(function(){
			if(run){
				run = false;
				fn();
			}
		}, 66);

		return function(force){
			if(force === true){
				run = false;
				fn();
			} else {
				run = true;
			}
		};
	};

	var loader = (function(){
		var lazyloadElems, preloadElems, isPreloadAllowed, isCompleted, resetPreloadingTimer, runThrough;

		var eLvW, elvH, eLtop, eLleft, eLright, eLbottom;

		var ua = navigator.userAgent;
		var fixChrome = window.HTMLPictureElement && ua.match(/hrome\/(\d+)/) && (RegExp.$1 == 40);
		var supportNativeLQIP = (/blink|webkit/i).test(ua);

		var regImg = /^img$/i;
		var regIframe = /^iframe$/i;

		var shrinkExpand = -2;
		var defaultExpand = shrinkExpand;
		var preloadExpand = shrinkExpand;
		var currentExpand = shrinkExpand;
		var isExpandCalculated = true;
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

			while(visible && (parent = parent.offsetParent) && parent != docElem && parent != document.body){
				visible = (isCompleted && isLoading < 4) || ((getCSS(parent, 'opacity') || 1) > 0);

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

		var checkElements = function() {
			var rect, autoLoadElem, loadedSomething, elemExpand, elemNegativeExpand, elemExpandVal, beforeExpandVal;

			var eLlen = lazyloadElems.length;

			var start = Date.now();
			var i = checkElementsIndex;

			if(!isExpandCalculated){
				calcExpand();
			}

			if(eLlen){

				for(; i < eLlen; i++, checkElementsIndex++){

					if(!lazyloadElems[i]){break;}

					if(!(elemExpandVal = lazyloadElems[i].getAttribute('data-expand')) || !(elemExpand = elemExpandVal * 1)){
						elemExpand = currentExpand;
					}

					if(isLoading > 6 && (!elemExpandVal || ('src' in lazyloadElems[i]))){continue;}

					if(isLoading > 3 && elemExpand > shrinkExpand){
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
						((isCompleted && currentExpand == defaultExpand && isLoading < 3 && lowRuns < 4 && !elemExpandVal) || isNestedVisible(lazyloadElems[i], elemExpand))){
						checkElementsIndex--;
						start++;
						unveilElement(lazyloadElems[i]);
						loadedSomething = true;
					} else  {

						if(!runThrough && Date.now() - start > 3){
							checkElementsIndex++;
							runThrough = true;
							throttledCheckElements();
							return;
						}

						if(!loadedSomething && isCompleted && !autoLoadElem &&
							isLoading < 3 && lowRuns < 4 &&
							(preloadElems[0] || lazySizesConfig.preloadAfterLoad) &&
							(preloadElems[0] || (!elemExpandVal && ((eLbottom || eLright || eLleft || eLtop) || lazyloadElems[i].getAttribute(lazySizesConfig.sizesAttr) != 'auto')))){
							autoLoadElem = preloadElems[0] || lazyloadElems[i];
						}

					}
				}

				checkElementsIndex = 0;
				runThrough = false;

				lowRuns++;

				if(currentExpand < preloadExpand && isLoading < 2 && lowRuns > 4){
					currentExpand = preloadExpand;
					lowRuns = 0;
					throttledCheckElements();
				} else if(currentExpand != defaultExpand){
					currentExpand = defaultExpand;
				}

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
			var sources, i, len, sourceSrcset, sizes, src, srcset, parent, isPicture, event, firesLoad;

			var curSrc = elem.currentSrc || elem.src;
			var isImg = regImg.test(elem.nodeName);

			if(!supportNativeLQIP && !isCompleted && isImg && curSrc && !elem.complete){return;}

			if(!(event = triggerEvent(elem, 'lazybeforeunveil', {force: !!force})).defaultPrevented){

				//allow using sizes="auto", but don't use. it's invalid. Use data-sizes="auto" or a valid value for sizes instead (i.e.: sizes="80vw")
				sizes = elem.getAttribute(lazySizesConfig.sizesAttr) || elem.getAttribute('sizes');

				if(sizes){
					if(sizes == 'auto'){
						autoSizer.updateElem(elem, true);
					} else {
						elem.setAttribute('sizes', sizes);
					}
				}

				srcset = elem.getAttribute(lazySizesConfig.srcsetAttr);
				src = elem.getAttribute(lazySizesConfig.srcAttr);

				firesLoad = event.details.firesLoad || (('src' in elem) && (srcset || src));

				if(firesLoad){
					isLoading++;
					addRemoveLoadEvents(elem, resetPreloading, true);
					clearTimeout(resetPreloadingTimer);
					resetPreloadingTimer = setTimeout(resetPreloading, 3000);

					if(isImg) {
						parent = elem.parentNode;
						isPicture = regPicture.test(parent.nodeName || '');
					}
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

					} else if(src){
						if(regIframe.test(elem.nodeName)){
							changeIframeSrc(elem, src);
						} else {
							elem.setAttribute('src', src);
						}
					}
				}

				if(lazySizesConfig.addClasses){
					addClass(elem, lazySizesConfig.loadingClass);
					addRemoveLoadEvents(elem, switchLoadingClass, true);
				}
			}

			setTimeout(function(){
				if(sizes == 'auto'){
					addClass(elem, lazySizesConfig.autosizesClass);
				}

				if(srcset || sizes || isPicture){
					updatePolyfill(elem, {srcset: srcset, src: src});
				}

				removeClass(elem, lazySizesConfig.lazyClass);

				//remove curSrc == (elem.currentSrc || elem.src) it's a workaround for FF. see: https://bugzilla.mozilla.org/show_bug.cgi?id=608261
				if( !firesLoad || (elem.complete && curSrc == (elem.currentSrc || elem.src)) ){
					if(firesLoad){
						resetPreloading({target: elem});
					}
					if(lazySizesConfig.addClasses){
						switchLoadingClass({target: elem});
					}
				}
				elem = null;
			});
		};

		var calcExpand = function(){

			if(isPreloadAllowed && !isExpandCalculated){
				defaultExpand = Math.max( Math.min(lazySizesConfig.expand || lazySizesConfig.threshold || 150, 300), 9 );
				preloadExpand = Math.min( defaultExpand * 4, Math.max(innerHeight * 1.1, docElem.clientHeight, defaultExpand * 3) );
			}

			isExpandCalculated = true;
		};

		var allowPreload = function(){
			isPreloadAllowed = true;
			isExpandCalculated = false;
		};

		var onload = function(){
			isCompleted = true;

			allowPreload();
			throttledCheckElements(true);
		};

		var init = function(){

			lazyloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass);
			preloadElems = document.getElementsByClassName(lazySizesConfig.lazyClass+' '+lazySizesConfig.preloadClass);

			if(lazySizesConfig.scroll) {
				addEventListener('scroll', throttledCheckElements, true);
			}

			addEventListener('resize', function(){
				isExpandCalculated = false;
				throttledCheckElements();
			}, false);


			if(window.MutationObserver){
				new MutationObserver( throttledCheckElements ).observe( docElem, {childList: true, subtree: true, attributes: true} );
			} else {
				docElem.addEventListener('DOMNodeInserted', throttledCheckElements, true);
				docElem.addEventListener('DOMAttrModified', throttledCheckElements, true);
			}

			addEventListener('hashchange', throttledCheckElements, true);

			['transitionstart', 'transitionend', 'load', 'focus', 'mouseover', 'animationend'].forEach(function(evt){
				document.addEventListener(evt, throttledCheckElements, true);
			});

			if(!(isCompleted = /d$|^c/.test(document.readyState))){
				addEventListener('load', onload, false);
				document.addEventListener('DOMContentLoaded', throttledCheckElements, false);
			}

			setTimeout(allowPreload, 666);
			throttledCheckElements();
		};

		return {
			init: init,
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

		var init = function(){
			autosizesElems = document.getElementsByClassName(lazySizesConfig.autosizesClass);
			addEventListener('resize', throttledUpdateElementsSizes, false);
		};

		return {
			init: init,
			checkElems: throttledUpdateElementsSizes,
			updateElem: sizeElement
		};
	})();

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
			minSize: 50
		};

		lazySizesConfig = window.lazySizesConfig || {};

		for(prop in lazySizesDefaults){
			if(!(prop in lazySizesConfig)){
				lazySizesConfig[prop] = lazySizesDefaults[prop];
			}
		}

		window.lazySizesConfig = lazySizesConfig;

		setTimeout(function(){
			autoSizer.init();
			loader.init();
		});
	})();



	return {
		cfg: lazySizesConfig,
		autoSizer: autoSizer,
		loader: loader,

		//depreacated methods will be removed with next major version
		updateAllSizes: autoSizer.updateElems,
		updateAllLazy: loader.checkElems,
		unveilLazy: loader.unveil,

		//undocumented internal methods - use with caution
		uS: autoSizer.updateElem, // will be removed with next major version
		uP: updatePolyfill,
		aC: addClass,
		rC: removeClass,
		hC: hasClass,
		fire: triggerEvent,
		gW: getWidth
	};
}));
