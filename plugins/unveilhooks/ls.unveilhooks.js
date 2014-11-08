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
	var config, bgLoad;
	var scriptUrls = {};

	if(document.addEventListener && window.getComputedStyle){
		config = window.lazySizesConfig || (window.lazySizes && lazySizes.cfg) || {};

		bgLoad = function (url, cb){
			var img = document.createElement('img');
			img.onload = function(){
				img.onload = null;
				img = null;
				cb();
			};

			img.src = url;

			if(img && img.complete && img.onload){
				img.onload();
			}
		};

		document.addEventListener('lazybeforeunveil', function(e){
			var tmp, bg, load;
			if(!e.defaultPrevented) {

				if(e.target.preload == 'none'){
					e.target.preload = 'auto';
					e.preventDefault();
				}

				// handle data-bg
				tmp = e.target.getAttribute('data-bg');
				if (tmp) {
					bg = getComputedStyle(e.target).getPropertyValue("backgroundImage");
					load = function(){
						e.target.style.backgroundImage = 'url(' + tmp + ')';
					};

					if(bg && bg != 'none'){
						bgLoad(tmp, load);
					} else {
						load();
					}

					if(config.clearAttr){
						e.target.removeAttribute('data-bg');
					}
					e.preventDefault();
					return;
				}

				// handle data-poster
				tmp = e.target.getAttribute('data-poster');
				if(tmp){

					load = function(){
						e.target.poster = tmp;
					};

					if(e.target.getAttribute('poster')){
						bgLoad(tmp, load);
					} else {
						load();
					}

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
