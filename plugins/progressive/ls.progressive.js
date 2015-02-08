/*
This lazysizes plugin optimizes perceived performance by adding better support for rendering progressive JPGs/PNGs in conjunction with the LQIP pattern.
*/
(function(document){
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
})(document);
