(function(window){
	'use strict';

	if(!window.addEventListener){return;}
	var regDescriptors = /\s+(\d+)(w|h)\s+(\d+)(w|h)/;
	var regPicture = /^picture$/i;

	var parentFit = {
		getFit: function(element){
			var obj = {
				fit: element.getAttribute('data-parent-fit')
			};

			if(obj.fit){
				obj.parent = element.parentNode;
				if(obj.parent && regPicture.test(obj.parent.nodeName || '')){
					obj.parent = obj.parent.parentNode;
				}
			} else {
				obj.fit = getComputedStyle(element).getPropertyValue("object-fit");
			}

			return obj;
		},
		getImageRatio: function(element){
			var i, srcset, media;
			var dims = {};
			var parent = element.parentNode;
			var elements = parent && regPicture.test(parent.nodeName || '') ?
					parent.querySelectorAll('source, img') :
					[elements]
				;

			for(i = 0; i < elements.length; i++){
				element = elements[i];
				srcset = element.getAttribute(lazySizesConfig.srcsetAttr) || element.getAttribute('srcset') || element.getAttribute('data-pfsrcset') || '';
				media = element.getAttribute('media');
				media = lazySizesConfig.customMedia[element.getAttribute('data-media') || media] || media;

				if(srcset && (!media || (window.matchMedia && matchMedia(media) || {}).matches )){
					if(srcset.match(regDescriptors)){
						if(RegExp.$2 == 'w'){
							dims.w = RegExp.$1;
							dims.h = RegExp.$3;
						} else {
							dims.w = RegExp.$3;
							dims.h = RegExp.$1;
						}
					}
					break;
				}
			}

			return dims.w / dims.h;
		},
		calculateSize: function(element, width){
			var displayRatio, height, imageRatio;
			var fitObj = this.getFit(element);
			var fit = fitObj.fit;
			var fitElem = fitObj.parent;

			if((fit != 'contain' && fit != 'cover') || !(imageRatio = this.getImageRatio(element))){return width;}

			if(fitElem){
				width = fitElem.offsetWidth;
			} else {
				fitElem = element;
			}

			height = fitElem.offsetHeight;
			displayRatio =  width / height;


			if(height > 40 && ((fit == 'cover' && displayRatio < imageRatio) || (fit == 'contain' && displayRatio > imageRatio))){
				width = width * (imageRatio / displayRatio);
			}

			return width;
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

		e.detail.width = parentFit.calculateSize(e.target, e.detail.width);
	});
	setTimeout(extend);
})(window);
