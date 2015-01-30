(function(){
	'use strict';
	if(!window.addEventListener){return;}

	var proxyWidth = function(elem, image){
		var width = lazySizes.gW(elem, elem.parentNode);
		if(!elem._lazysizesWidth || width > elem._lazysizesWidth){
			image.setAttribute('sizes',  width+'px');
			elem._lazysizesWidth = width;
		}
		return elem._lazysizesWidth;
	};

	addEventListener('lazybeforeunveil', function(e){
		var set, image, load, init, elem;

		if(e.defaultPrevented || !(set = e.target.getAttribute('data-bgset'))){return;}
		image = document.createElement('img');
		elem = e.target;
		proxyWidth(elem, image);

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

		image.setAttribute('srcset', set);
		image.style.display = 'none';
		image.className = lazySizes.cfg.autosizesClass;

		Object.defineProperty(image, '_lazybgset', {
			value: elem,
			writable: true
		});

		elem.appendChild(image);

		lazySizes.uP(image);
	});

	addEventListener('lazybeforesizes', function(e){
		if(e.defaultPrevented || !e.target._lazybgset){return;}
		e.details.width = proxyWidth(e.target._lazybgset, e.target);
	});
})();
