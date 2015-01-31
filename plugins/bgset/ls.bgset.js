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
			if(sizes == 'auto'){
				Object.defineProperty(img, '_lazybgset', {
					value: elem,
					writable: true
				});
			}
		}

		picture.appendChild(img);

		elem.appendChild(picture);

		elem.removeAttribute(lazySizesConfig.sizesAttr);

	};

	addEventListener('lazybeforeunveil', function(e){
		var set, image, load, init, elem;

		if(e.defaultPrevented || !(set = e.target.getAttribute('data-bgset'))){return;}

		elem = e.target;
		image = document.createElement('img');

		load = function(evt){
			var bg = evt.type == 'load' ? image.currentSrc || image.src : false;
			if(bg){
				elem.style.backgroundImage = 'url('+ bg +')';
			}

			if(!init){
				lazySizes.fire(elem, '_lazyloaded');
				if(e && e.details){
					e.details.firesLoad = false;
				}
				init = true;
				e = null;
			}
		};

		e.details.firesLoad = true;

		image.addEventListener('load', load);
		image.addEventListener('error', load);

		createPicture(set, elem, image);

		lazySizes.loader.unveil(image);
	});

	addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented || !e.target._lazybgset){return;}
		e.details.width = proxyWidth(e.target._lazybgset);
	});
})();
