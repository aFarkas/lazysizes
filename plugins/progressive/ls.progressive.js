/*
This lazysizes plugin optimizes perceived performance by adding better support for rendering progressive JPGs/PNGs in conjunction with the LQIP pattern.
*/
(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	/*jshint eqnull:true */
	'use strict';
	var regImg, onLoad;

	if('srcset' in document.createElement('img')){
		regImg = /^img$/i;

		onLoad = function(e){
			e.target.style.backgroundSize = '';
			e.target.style.backgroundImage = '';
			e.target.removeEventListener(e.type, onLoad);
		};

		document.addEventListener('lazybeforeunveil', function(e){
			if(e.detail.instance != lazySizes){return;}

			var img = e.target;
			if(!regImg.test(img.nodeName)){
				return;
			}
			var src = img.getAttribute('src');
			if(src) {
				img.style.backgroundSize = '100% 100%';
				img.style.backgroundImage = 'url(' + src + ')';
				img.removeAttribute('src');
				img.addEventListener('load', onLoad);
			}
		}, false);
	}
}));
