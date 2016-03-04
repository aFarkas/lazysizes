(function(){
	'use strict';
	if(!window.addEventListener){return;}

	var oldReadCallback;
	var regWhite = /\s+/g;
	var regSplitSet = /\s*\|\s+|\s+\|\s*/g;
	var regSource = /^(.+?)(?:\s+\[\s*(.+?)\s*\])?$/;
	var allowedBackgroundSize = {contain: 1, cover: 1};
	var rAF = window.requestAnimationFrame || setTimeout;

	var proxyWidth = function(elem){
		var width = (elem._bgsetReadCache && 'width' in elem._bgsetReadCache) ?
			elem._bgsetReadCache.width :
			lazySizes.gW(elem, elem.parentNode)
		;

		if(!elem._lazysizesWidth || width > elem._lazysizesWidth){
			elem._lazysizesWidth = width;
		}
		return elem._lazysizesWidth;
	};
	var getBgSize = function(elem){
		var bgSize;

		if(elem._bgsetReadCache){
			bgSize = elem._bgsetReadCache.bgSize;
		} else {
			bgSize = (getComputedStyle(elem) || {getPropertyValue: function(){}}).getPropertyValue('background-size');

			if(!allowedBackgroundSize[bgSize] && allowedBackgroundSize[elem.style.backgroundSize]){
				bgSize = elem.style.backgroundSize;
			}
		}

		return bgSize;
	};
	var createPicture = function(sets, elem, img){
		var picture = document.createElement('picture');
		var sizes = elem.getAttribute(lazySizesConfig.sizesAttr);
		var ratio = elem.getAttribute('data-ratio');
		var optimumx = elem.getAttribute('data-optimumx');
		var bgSize = getBgSize(elem);

		if(allowedBackgroundSize[bgSize] && (sizes == 'auto' || !sizes)){
			img.setAttribute('data-parent-fit', bgSize);
			sizes = 'auto';
		}

		if(elem._lazybgset && elem._lazybgset.parentNode == elem){
			elem.removeChild(elem._lazybgset);
		}

		Object.defineProperty(img, '_lazybgset', {
			value: elem,
			writable: true
		});
		Object.defineProperty(elem, '_lazybgset', {
			value: picture,
			writable: true
		});

		sets = sets.replace(regWhite, ' ').split(regSplitSet);

		picture.style.display = 'none';
		img.className = lazySizesConfig.lazyClass;

		if(sets.length == 1 && !sizes){
			sizes = 'auto';
		}

		sets.forEach(function(set){
			var source = document.createElement('source');

			if(sizes && sizes != 'auto'){
				source.setAttribute('sizes', sizes);
			}

			if(set.match(regSource)){
				source.setAttribute(lazySizesConfig.srcsetAttr, RegExp.$1);
				if(RegExp.$2){
					source.setAttribute('media', lazySizesConfig.customMedia[RegExp.$2] || RegExp.$2);
				}
			}
			picture.appendChild(source);
		});

		if(sizes){
			img.setAttribute(lazySizesConfig.sizesAttr, sizes);
			elem.removeAttribute(lazySizesConfig.sizesAttr);
			elem.removeAttribute('sizes');
		}
		if(optimumx){
			img.setAttribute('data-optimumx', optimumx);
		}
		if(ratio) {
			img.setAttribute('data-ratio', ratio);
		}

		picture.appendChild(img);

		elem.appendChild(picture);
	};

	var proxyLoad = function(e){
		if(!e.target._lazybgset){return;}

		var image = e.target;
		var elem = image._lazybgset;
		var bg = image.currentSrc || image.src;

		if(bg){
			elem.style.backgroundImage = 'url('+ bg +')';
		}

		if(image._lazybgsetLoading){
			lazySizes.fire(elem, '_lazyloaded', {}, false, true);
			delete image._lazybgsetLoading;
		}
	};

	window.lazySizesConfig = window.lazySizesConfig || {};

	oldReadCallback = window.lazySizesConfig.rC;

	window.lazySizesConfig.rC = function(elem, width){
		var bgSize;

		if(oldReadCallback){
			width = oldReadCallback.apply(this, arguments) || width;
		}

		if(elem.getAttribute('data-bgset')){
			bgSize = getBgSize(elem);

			if(allowedBackgroundSize[bgSize] || elem.getAttribute(lazySizesConfig.sizesAttr)){
				width = proxyWidth(elem);
			}
			elem._bgsetReadCache = {
				bgSize: bgSize,
				width: width,
			};
		}

		return elem._bgsetReadCache && elem._bgsetReadCache.width || width;
	};

	addEventListener('lazybeforeunveil', function(e){
		var set, image, elem;

		if(e.defaultPrevented || !(set = e.target.getAttribute('data-bgset'))){return;}

		elem = e.target;
		image = document.createElement('img');

		image.alt = '';

		image._lazybgsetLoading = true;
		e.detail.firesLoad = true;

		createPicture(set, elem, image);

		image._bgsetReadCache = elem._bgsetReadCache;

		setTimeout(function(){
			lazySizes.loader.unveil(image);

			rAF(function(){
				lazySizes.fire(image, '_lazyloaded', {}, true, true);
				if(image.complete) {
					proxyLoad({target: image});
				}

				if(elem._bgsetReadCache){
					delete elem._bgsetReadCache;
				}

				if(image._bgsetReadCache){
					delete image._bgsetReadCache;
				}
			});
		});

	});

	document.addEventListener('load', proxyLoad, true);

	document.documentElement.addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented || !e.target._lazybgset){return;}
		e.detail.width = proxyWidth(e.target._lazybgset);
	});
})();
