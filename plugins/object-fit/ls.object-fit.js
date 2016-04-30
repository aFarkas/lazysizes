(function(){
	'use strict';
	var support = 'objectFit' in document.createElement('a').style;
	var regCssFit = /object-fit["']*\s*:\s*["']*(contain|cover)/;
	var regCssObject = /object-container["']*\s*:\s*["']*(.+?)(?=(\s|$|,|'|"|;))/;

	function getObject(element){
		var css = (getComputedStyle(element, null) || {});
		var content = css.content || css.fontFamily || '';
		var objectFit = content.match(regCssFit) || '';
		var objectContainer = objectFit && content.match(regCssObject) || '';

		return {
			fit: objectFit && objectFit[1] || '',
			container: objectContainer,
		};
	}

	function initFix(element, config){
		var container = lazySizes.parentFit.getParent(config.container) || element.parentNode;
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
			containerStyle.backgroundPosition = 'center';
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

	if(!support){
		addEventListener('lazybeforesizes', function(e){
			if(e.defaultPrevented || !e.detail.dataAttr){return;}
			var element = e.target;
			var obj = getObject(element);

			if(obj.fit){
				initFix(element, obj);
			}
		}, true);
	}
})();
