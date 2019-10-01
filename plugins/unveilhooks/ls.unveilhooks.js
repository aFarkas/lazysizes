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
	var bgLoad, regBgUrlEscape;
	var uniqueUrls = {};

	if(document.addEventListener){
		regBgUrlEscape = /\(|\)|\s|'/;

		// create an empty canvas element
		var canvas = document.createElement('canvas'),
			canvasContext = canvas.getContext('2d'),
			isiOS = /iPhone/i.test(navigator.userAgent);
		bgLoad = function(url, cb) {
			var img = document.createElement('img');
			// fix toDataURL SecurityError: The operation is insecure
			img.crossOrigin = 'anonymous';
			img.onload = function() {
				if (isiOS) {
					// avoid flicker when background-image change
					//Set canvas size is same as the picture
					canvas.width = img.width;
					canvas.height = img.height;
					// draw image into canvas element
					canvasContext.drawImage(img, 0, 0, img.width, img.height);
					/**
					 * I tried tree schemes http:,blob:,data: to set image url, data: is most smoothly rendered.
					 * If put them in order on a smooth scale, they looks like data > blob > http
					 */
					// get canvas contents as a data URL (returns png format by default)
					cb(canvas.toDataURL());
					// get canvas contents as a blob URL (returns png format by default)
					// https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob
					// canvas.toBlob(function(blob) {
					//   cb(window.URL.createObjectURL(blob));
					// });
				} else {
					// The other platform, plain url is okay
					cb(regBgUrlEscape.test(url) ? JSON.stringify(url) : url);
				}

				img.onload = null;
				img.onerror = null;
				img = null;
			};
			img.onerror = img.onload;

			img.src = url;

			if(img && img.complete && img.onload){
				img.onload();
			}
		};

		addEventListener('lazybeforeunveil', function(e){
			if(e.detail.instance != lazySizes){return;}

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
					if(lazySizes.cfg.requireJs){
						lazySizes.cfg.requireJs([tmp]);
					} else {
						addStyleScript(tmp);
					}
				}

				// handle data-bg
				bg = e.target.getAttribute('data-bg');
				if (bg) {
					e.detail.firesLoad = true;
					load = function(bgURL){
						e.target.style.backgroundImage = 'url(' + bgURL + ')';
						e.detail.firesLoad = false;
						lazySizes.fire(e.target, '_lazyloaded', {}, true, true);
					};

					bgLoad(bg, load);
				}

				// handle data-poster
				poster = e.target.getAttribute('data-poster');
				if(poster){
					e.detail.firesLoad = true;
					load = function(bgURL){
						e.target.poster = bgURL;
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
}));
