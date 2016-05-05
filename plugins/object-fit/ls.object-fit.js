(function(){
	'use strict';
	var style = document.createElement('a').style;
	var fitSupport = 'objectFit' in style;
	var positionSupport = 'objectPosition' in style;
	var regCssFit = /object-fit["']*\s*:\s*["']*(contain|cover)/;
	var regCssObject = /object-container["']*\s*:\s*["']*(.+?)(?=(\s|$|,|'|"|;))/;
	var regCssPosition = /object-position["']*\s*:\s*["']*(.+?)(?=($|,|'|"|;))/;
	var positionDefaults = {
		center: 'center',
		'50% 50%': 'center',
	};

	function getObject(element){
		var css = (getComputedStyle(element, null) || {});
		var content = css.fontFamily || '';
		var objectFit = content.match(regCssFit) || '';
		var objectContainer = objectFit && content.match(regCssObject) || '';
		var objectPosition = objectFit && content.match(regCssPosition) || '';

		if(objectPosition){
			objectPosition = objectPosition[1];
		}

		return {
			fit: objectFit && objectFit[1] || '',
			container: objectContainer && objectContainer[1],
			position: positionDefaults[objectPosition] || objectPosition || 'center',
		};
	}

	function initFix(element, config){
		var container = lazySizes.parentFit.getParent(element, config.container) || element.parentNode;
		var containerStyle = container.style;

		var onChange = function(){
			var src = element.currentSrc || element.src;

			if(src){
				containerStyle.backgroundImage = 'url(' + src + ')';
			}
		};

		element._lazysizesParentFit = config.fit;
		if(config.container){
			element._lazysizesParentContainer = config.container;
		}

		element.addEventListener('load', function(){
			lazySizes.rAF(onChange);
		}, true);

		lazySizes.rAF(function(){
			containerStyle.backgroundRepeat = 'no-repeat';
			containerStyle.backgroundPosition = config.position;
			containerStyle.backgroundSize = config.fit;
			element.style.display = 'none';

			element.setAttribute('data-parent-fit', config.fit);
			if(element._lazysizesParentFit){
				delete element._lazysizesParentFit;
			}

			if(config.container){
				element.setAttribute('data-parent-container', config.container);
				if(element._lazysizesParentContainer){
					delete element._lazysizesParentContainer;
				}
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
