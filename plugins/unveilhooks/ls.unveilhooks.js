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
	/*jshint eqnull:true */
	'use strict';
	var config, bgLoad;
	var uniqueUrls = {};

	if(document.addEventListener && window.getComputedStyle){
		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig || {};

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

				tmp = e.target.getAttribute('data-link');
				if(tmp){
					addStyleScript(tmp, true);
					if(config.clearAttr){
						e.target.removeAttribute('data-link');
					}
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
				}

				// handle data-script
				tmp = e.target.getAttribute('data-script');
				if(tmp){
					addStyleScript(tmp);
					if(config.clearAttr){
						e.target.removeAttribute('data-script');
					}
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
				}
			}
		}, false);

	}

	function addStyleScript(src, style){
		if(uniqueUrls[src]){
			return;
		}
		var elem = document.createElement(style ? 'link' : 'script');
		var insertElem = document.getElementsByTagName('script')[0];

		if(style){
			elem.rel = 'stylesheet';
			elem.href = src;
		} else {
			elem.src = src;
		}
		uniqueUrls[src] = true;
		uniqueUrls[elem.src || elem.href] = true;
		insertElem.parentNode.insertBefore(elem, insertElem);
	}
})(window, document);
