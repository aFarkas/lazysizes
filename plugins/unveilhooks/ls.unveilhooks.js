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
	var bgLoad;
	var uniqueUrls = {};

	if(document.addEventListener){

		bgLoad = function (url, cb){
			var img = document.createElement('img');
			img.onload = function(){
				img.onload = null;
				img.onerror = null;
				img = null;
				cb();
			};
			img.onerror = img.onload;

			img.src = url;

			if(img && img.complete && img.onload){
				img.onload();
			}
		};

		addEventListener('lazybeforeunveil', function(e){
			var tmp, load, bg, poster;
			if(!e.defaultPrevented) {

				if(e.target.preload == 'none'){
					e.target.preload = 'auto';
				}

				tmp = e.target.getAttribute('data-link');
				if(tmp){
					addStyleScript(tmp, true);
				}

				// handle data-script
				tmp = e.target.getAttribute('data-script');
				if(tmp){
					addStyleScript(tmp);
				}

				// handle data-require
				tmp = e.target.getAttribute('data-require');
				if(tmp){
					if(window.require){
						require([tmp]);
					}
				}

				// handle data-bg
				bg = e.target.getAttribute('data-bg');
				if (bg) {
					e.detail.firesLoad = true;
					load = function(){
						e.target.style.backgroundImage = 'url(' + bg + ')';
						e.detail.firesLoad = false;
						lazySizes.fire(e.target, '_lazyloaded', {}, true, true);
					};

					bgLoad(bg, load);
				}

				// handle data-poster
				poster = e.target.getAttribute('data-poster');
				if(poster){
					e.detail.firesLoad = true;
					load = function(){
						e.target.poster = poster;
						e.detail.firesLoad = false;
						lazySizes.fire(e.target, '_lazyloaded', {}, true, true);
					};

					bgLoad(poster, load);

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
