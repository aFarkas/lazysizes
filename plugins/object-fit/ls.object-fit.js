(function(){
	'use strict';
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

	function initFix(element, config){
		var switchClassesAdded;
		var lazysizesCfg = lazySizes.cfg;
		var styleElement = element.cloneNode(false);
		var styleElementStyle = styleElement.style;

		var onChange = function(){
			var src = element.currentSrc || element.src;

			if(src){
				styleElementStyle.backgroundImage = 'url(' + (regBgUrlEscape.test(src) ? JSON.stringify(src) : src ) + ')';

				if(!switchClassesAdded){
					switchClassesAdded = true;
					lazySizes.rC(styleElement, lazysizesCfg.loadingClass);
					lazySizes.aC(styleElement, lazysizesCfg.loadedClass);
				}
			}
		};

		element._lazysizesParentFit = config.fit;

		element.addEventListener('load', function(){
			lazySizes.rAF(onChange);
		}, true);

		styleElement.addEventListener('load', function(){
			var curSrc = styleElement.currentSrc || styleElement.src;

			if(curSrc && curSrc != blankSrc){
				styleElement.src = blankSrc;
				styleElement.srcset = '';
			}
		});

		lazySizes.rAF(function(){

			var hideElement = element;
			var container = element.parentNode;

			if(container.nodeName.toUpperCase() == 'PICTURE'){
				hideElement = container;
				container = container.parentNode;
			}

			lazySizes.rC(styleElement, lazysizesCfg.loadedClass);
			lazySizes.rC(styleElement, lazysizesCfg.lazyClass);
			lazySizes.aC(styleElement, lazysizesCfg.loadingClass);
			lazySizes.aC(styleElement, lazysizesCfg.objectFitClass || 'lazysizes-display-clone');

			if(styleElement.getAttribute(lazysizesCfg.srcsetAttr)){
				styleElement.setAttribute(lazysizesCfg.srcsetAttr, '');
			}

			if(styleElement.getAttribute(lazysizesCfg.srcAttr)){
				styleElement.setAttribute(lazysizesCfg.srcAttr, '');
			}

			styleElement.src = blankSrc;
			styleElement.srcset = '';

			styleElementStyle.backgroundRepeat = 'no-repeat';
			styleElementStyle.backgroundPosition = config.position;
			styleElementStyle.backgroundSize = config.fit;

			hideElement.style.display = 'none';

			element.setAttribute('data-parent-fit', config.fit);
			element.setAttribute('data-parent-container', 'prev');

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
		addEventListener('lazyunveilread', function(e){
			var element = e.target;
			var obj = getObject(element);

			if(obj.fit && (!fitSupport || (obj.position != 'center'))){
				initFix(element, obj);
			}
		}, true);
	}
})();
