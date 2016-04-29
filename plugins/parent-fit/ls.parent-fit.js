(function(window, document){
	'use strict';

	if(!window.addEventListener){return;}
	var regDescriptors = /\s+(\d+)(w|h)\s+(\d+)(w|h)/;
	var regCssFit = /object-fit["']*\s*:\s*["']*(contain|cover|width)/;
	var regCssObject = /object-parent["']*\s*:\s*["']*(.+?)(?=(\s|$|\+|\)|\(|\[|]|>|<|~|\{|}|,|'|"))/;
	var regPicture = /^picture$/i;
	var getCSS = function (elem){
		return (getComputedStyle(elem, null) || {});
	};
	var parentFit = {
		getFit: function(element){
			var tmpMatch, parentObj, parentNode;
			var css = getCSS(element);
			var content = css.content || css.fontFamily;
			var obj = {
				fit: element._lazysizesParentFit || element.getAttribute('data-parent-fit')
			};

			if(!obj.fit && content && (tmpMatch = content.match(regCssFit))){
				obj.fit = tmpMatch[1];
			}

			if(obj.fit){
				parentNode = element.parentNode;
				parentObj = element.getAttribute('data-parent-object');

				if(!parentObj && content && (tmpMatch = content.match(regCssObject))){
					parentObj = tmpMatch[1];
				}

				if(parentObj && (parentNode.closest || window.jQuery)){
					obj.parent = (parentNode.closest ?
							parentNode.closest(parentObj) :
						jQuery(parentNode).closest(parentObj)[0]) ||
						parentNode
					;
				} else {
					obj.parent = parentNode;
				}

				if(obj.parent && regPicture.test(obj.parent.nodeName || '')){
					obj.parent = obj.parent.parentNode;
				}
			} else {
				obj.fit = css.objectFit;
			}

			return obj;
		},
		getImageRatio: function(element){
			var i, srcset, media, ratio;
			var parent = element.parentNode;
			var elements = parent && regPicture.test(parent.nodeName || '') ?
					parent.querySelectorAll('source, img') :
					[element]
				;

			for(i = 0; i < elements.length; i++){
				element = elements[i];
				srcset = element.getAttribute(lazySizesConfig.srcsetAttr) || element.getAttribute('srcset') || element.getAttribute('data-pfsrcset') || element.getAttribute('data-risrcset') || '';
				media = element.getAttribute('media');
				media = lazySizesConfig.customMedia[element.getAttribute('data-media') || media] || media;

				if(srcset && (!media || (window.matchMedia && matchMedia(media) || {}).matches )){
					ratio = parseFloat(element.getAttribute('data-aspectratio'));

					if(!ratio && srcset.match(regDescriptors)){
						if(RegExp.$2 == 'w'){
							ratio = RegExp.$1 / RegExp.$3;
						} else {
							ratio = RegExp.$3 / RegExp.$1;
						}
					}
					break;
				}
			}

			return ratio;
		},
		calculateSize: function(element, width){
			var displayRatio, height, imageRatio, retWidth;
			var fitObj = this.getFit(element);
			var fit = fitObj.fit;
			var fitElem = fitObj.parent;

			if(fit != 'width' && ((fit != 'contain' && fit != 'cover') || !(imageRatio = this.getImageRatio(element)))){
				return width;
			}

			if(fitElem){
				width = fitElem.clientWidth;
			} else {
				fitElem = element;
			}

			retWidth = width;

			if(fit == 'width'){
				retWidth = width;
			} else {
				height = fitElem.clientHeight;

				if(height > 40 && (displayRatio =  width / height) && ((fit == 'cover' && displayRatio < imageRatio) || (fit == 'contain' && displayRatio > imageRatio))){
					retWidth = width * (imageRatio / displayRatio);
				}
			}

			return retWidth;
		}
	};
	var extend = function(){
		if(window.lazySizes){
			if(!lazySizes.parentFit){
				lazySizes.parentFit = parentFit;
			}
			window.removeEventListener('lazybeforeunveil', extend, true);
		}
	};

	window.addEventListener('lazybeforeunveil', extend, true);

	document.addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented){return;}
		var element = e.target;
		e.detail.width = parentFit.calculateSize(element, e.detail.width);
	});
	setTimeout(extend);
})(window, document);
