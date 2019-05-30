(function(window, factory) {
	if(!window) {return;}
	var globalInstall = function(initialEvent){
		factory(window.lazySizes, initialEvent);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(typeof window != 'undefined' ?
	window : 0, function(window, document, lazySizes, initialEvent) {
	'use strict';
	var cloneElementClass;
	var style = document.createElement('a').style;
	var fitSupport = 'objectFit' in style;
	var positionSupport = fitSupport && 'objectPosition' in style;
	var regCssFit = /object-fit["']*\s*:\s*["']*(contain|cover)/;
	var regCssPosition = /object-position["']*\s*:\s*["']*(.+?)(?=($|,|'|"|;))/;
	var blankSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	var regBgUrlEscape = /\(|\)|'/;
	var positionDefaults = {
		center: 'center',
		'50% 50%': 'center',
	};

	function getObject(element){
		var css = (getComputedStyle(element, null) || {});
		var content = css.fontFamily || '';
		var objectFit = content.match(regCssFit) || '';
		var objectPosition = objectFit && content.match(regCssPosition) || '';

		if(objectPosition){
			objectPosition = objectPosition[1];
		}

		return {
			fit: objectFit && objectFit[1] || '',
			position: positionDefaults[objectPosition] || objectPosition || 'center',
		};
	}

	function generateStyleClass() {
		if (cloneElementClass) {
			return;
		}

		var styleElement = document.createElement('style');

		cloneElementClass = lazySizes.cfg.objectFitClass || 'lazysizes-display-clone';

		document.querySelector('head').appendChild(styleElement);
	}

	function removePrevClone(element) {
		var prev = element.previousElementSibling;

		if (prev && lazySizes.hC(prev, cloneElementClass)) {
			prev.parentNode.removeChild(prev);
			element.style.position = prev.getAttribute('data-position') || '';
			element.style.visibility = prev.getAttribute('data-visibility') || '';
		}
	}

	function initFix(element, config){
		var switchClassesAdded, addedSrc, styleElement, styleElementStyle;
		var lazysizesCfg = lazySizes.cfg;

		var onChange = function(){
			var src = element.currentSrc || element.src;

			if(src && addedSrc !== src){
				addedSrc = src;
				styleElementStyle.backgroundImage = 'url(' + (regBgUrlEscape.test(src) ? JSON.stringify(src) : src ) + ')';

				if(!switchClassesAdded){
					switchClassesAdded = true;
					lazySizes.rC(styleElement, lazysizesCfg.loadingClass);
					lazySizes.aC(styleElement, lazysizesCfg.loadedClass);
				}
			}
		};
		var rafedOnChange = function(){
			lazySizes.rAF(onChange);
		};

		element._lazysizesParentFit = config.fit;

		element.addEventListener('lazyloaded', rafedOnChange, true);
		element.addEventListener('load', rafedOnChange, true);

		lazySizes.rAF(function(){

			var hideElement = element;
			var container = element.parentNode;

			if(container.nodeName.toUpperCase() == 'PICTURE'){
				hideElement = container;
				container = container.parentNode;
			}

			removePrevClone(hideElement);

			if (!cloneElementClass) {
				generateStyleClass();
			}

			styleElement = element.cloneNode(false);
			styleElementStyle = styleElement.style;

			styleElement.addEventListener('load', function(){
				var curSrc = styleElement.currentSrc || styleElement.src;

				if(curSrc && curSrc != blankSrc){
					styleElement.src = blankSrc;
					styleElement.srcset = '';
				}
			});

			lazySizes.rC(styleElement, lazysizesCfg.loadedClass);
			lazySizes.rC(styleElement, lazysizesCfg.lazyClass);
			lazySizes.rC(styleElement, lazysizesCfg.autosizesClass);
			lazySizes.aC(styleElement, lazysizesCfg.loadingClass);
			lazySizes.aC(styleElement, cloneElementClass);

			['data-parent-fit', 'data-parent-container', 'data-object-fit-polyfilled',
				lazysizesCfg.srcsetAttr, lazysizesCfg.srcAttr].forEach(function(attr) {
				styleElement.removeAttribute(attr);
			});

			styleElement.src = blankSrc;
			styleElement.srcset = '';

			styleElementStyle.backgroundRepeat = 'no-repeat';
			styleElementStyle.backgroundPosition = config.position;
			styleElementStyle.backgroundSize = config.fit;

			styleElement.setAttribute('data-position', hideElement.style.position);
			styleElement.setAttribute('data-visibility', hideElement.style.visibility);

			hideElement.style.visibility = 'hidden';
			hideElement.style.position = 'absolute';

			element.setAttribute('data-parent-fit', config.fit);
			element.setAttribute('data-parent-container', 'prev');
			element.setAttribute('data-object-fit-polyfilled', '');
			element._objectFitPolyfilledDisplay = styleElement;

			container.insertBefore(styleElement, hideElement);

			if(element._lazysizesParentFit){
				delete element._lazysizesParentFit;
			}

			if(element.complete){
				onChange();
			}
		});
	}

	if(!fitSupport || !positionSupport){
		var onRead = function(e){
			if(e.detail.instance != lazySizes){return;}

			var element = e.target;
			var obj = getObject(element);

			if(obj.fit && (!fitSupport || (obj.position != 'center'))){
				initFix(element, obj);
				return true;
			}

			return false;
		};

		window.addEventListener('lazybeforesizes', function(e) {
			if(e.detail.instance != lazySizes){return;}
			var element = e.target;

			if (element.getAttribute('data-object-fit-polyfilled') != null && !element._objectFitPolyfilledDisplay) {
				if(!onRead(e)){
					lazySizes.rAF(function () {
						element.removeAttribute('data-object-fit-polyfilled');
					});
				}
			}
		});
		window.addEventListener('lazyunveilread', onRead, true);

		if(initialEvent && initialEvent.detail){
			onRead(initialEvent);
		}
	}
}));
