/*
This plugin extends lazySizes to lazyLoad:
background images, videos/posters and scripts

Background-Image:
For background images, use data-bg attribute:
<div class="lazyload" data-bg="bg-img.jpg"></div>

 Video:
 For video/audio use data-poster and preload="none":
 <video class="lazyload" data-poster="poster.jpg" preload="none">
 <!-- sources -->
 </video>

 Scripts:
 For scripts use data-script:
 <div class="lazyload" data-script="module-name.js"></div>


 Script modules using require:
 For modules using require use data-require:
 <div class="lazyload" data-require="module-name"></div>
*/

(function(window, document){
	'use strict';
	var config;
	var scriptUrls = {};
	if(document.addEventListener){
		config = window.lazySizesConfig || (window.lazySizes && lazySizes.cfg) || {};

		document.addEventListener('lazybeforeunveil', function(e){
			var tmp;
			if(!e.defaultPrevented) {

				if(e.target.preload == 'none'){
					e.target.preload = 'auto';
					e.preventDefault();
				}

				// handle data-bg
				tmp = e.target.getAttribute('data-bg');
				if (tmp) {
					e.target.style.backgroundImage = 'url(' + tmp + ')';
					if(config.clearAttr){
						e.target.removeAttribute('data-bg');
					}
					e.preventDefault();
					return;
				}

				// handle data-poster
				tmp = e.target.getAttribute('data-poster');
				if(tmp){
					e.target.poster = tmp;
					if(config.clearAttr){
						e.target.removeAttribute('data-poster');
					}
					e.preventDefault();
					return;
				}

				// handle data-script
				tmp = e.target.getAttribute('data-script');
				if(tmp){
					addScript(e.target, tmp);
					if(config.clearAttr){
						e.target.removeAttribute('data-script');
					}
					e.preventDefault();
					return;
				}

				// handle data-require
				tmp = e.target.getAttribute('data-require');
				if(tmp){
					if(window.require){
						require([tmp]);
					}
					if(config.clearAttr){
						e.target.removeAttribute('data-require');
					}
					e.preventDefault();
					return;
				}
			}
		}, false);

	}

	function addScript(element, src){
		if(scriptUrls[src]){
			return;
		}
		var elem = document.createElement('script');
		var parent = element.parentNode;

		elem.src = src;
		scriptUrls[src] = true;
		scriptUrls[elem.src] = true;
		parent.insertBefore(elem, element);
	}
})(window, document);
