/**
 * Some versions of iOS (8.1-) do load the first candidate of a srcset candidate list, if width descriptors with the sizes attribute is used.
 * This tiny extension prevents this wasted download by creating a picture structure around the image.
 * Note: This extension is already included in the ls.respimg.js file.
 *
 * Usage:
 *
 * <img
 * 	class="lazyload"
 * 	data-sizes="auto"
 * 	data-srcset="small.jpg 640px,
 * 		medium.jpg 980w,
 * 		large.jpg 1280w"
 * 	/>
 */

(function(document){
	'use strict';
	var regPicture;
	var img = document.createElement('img');

	if(('srcset' in img) && !('sizes' in img) && !window.HTMLPictureElement){
		regPicture = /^picture$/i;
		document.addEventListener('lazybeforeunveil', function(e){
			var elem, parent, srcset, sizes, isPicture;
			var picture, source;
			if(e.defaultPrevented ||
				lazySizesConfig.noIOSFix ||
				!(elem = e.target) ||
				!(srcset = elem.getAttribute(lazySizesConfig.srcsetAttr)) ||
				!(parent = elem.parentNode) ||
				(
					!(isPicture = regPicture.test(parent.nodeName || '')) &&
					!(sizes = elem.getAttribute('sizes') || elem.getAttribute(lazySizesConfig.sizesAttr))
				)
			){return;}

			picture = isPicture ? parent : document.createElement('picture');

			if(!elem._lazyImgSrc){
				Object.defineProperty(elem, '_lazyImgSrc', {
					value: document.createElement('source'),
					writable: true
				});
			}
			source = elem._lazyImgSrc;

			if(sizes){
				source.setAttribute('sizes', sizes);
			}

			source.setAttribute(lazySizesConfig.srcsetAttr, srcset);
			elem.setAttribute('data-pfsrcset', srcset);
			elem.removeAttribute(lazySizesConfig.srcsetAttr);

			if(!isPicture){
				parent.insertBefore(picture, elem);
				picture.appendChild(elem);
			}
			picture.insertBefore(source, elem);
		});
	}
})(document);
