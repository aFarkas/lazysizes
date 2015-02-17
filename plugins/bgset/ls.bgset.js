(function(){
	'use strict';
	if(!window.addEventListener){return;}

	var regSplitSet = /\s*\|\s+|\s+\|\s*/g;
	var regSource = /^(.+?)(?:\s+\[\s*(.+?)\s*\])?$/;

	var proxyWidth = function(elem){
		var width = lazySizes.gW(elem, elem.parentNode);
		if(!elem._lazysizesWidth || width > elem._lazysizesWidth){
			elem._lazysizesWidth = width;
		}
		return elem._lazysizesWidth;
	};

	var createPicture = function(sets, elem, img){
		var picture = document.createElement('picture');
		var sizes = elem.getAttribute(lazySizesConfig.sizesAttr);
		var optimumx = elem.getAttribute('data-optimumx');

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

		sets = sets.split(regSplitSet);

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
					source.setAttribute('media', RegExp.$2);
				}
			}
			picture.appendChild(source);
		});

		if(sizes){
			img.setAttribute(lazySizesConfig.sizesAttr, sizes);
			elem.removeAttribute(lazySizesConfig.sizesAttr);
		}
		if(optimumx){
			img.setAttribute('data-optimumx', optimumx);
		}

		picture.appendChild(img);

		elem.appendChild(picture);
	};

	addEventListener('lazybeforeunveil', function(e){
		var set, image, elem;

		if(e.defaultPrevented || !(set = e.target.getAttribute('data-bgset'))){return;}

		elem = e.target;
		image = document.createElement('img');

		image._lazybgsetLoading = true;
		e.details.firesLoad = true;

		createPicture(set, elem, image);

		lazySizes.loader.unveil(image);
		lazySizes.fire(image, '_lazyloaded', {}, true, true);
	});

	document.addEventListener('load', function(e){
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
	}, true);

	addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented || !e.target._lazybgset){return;}
		e.details.width = proxyWidth(e.target._lazybgset);
	});
})();
