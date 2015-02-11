(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';
	var polyfill;
	var config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(!config.supportsType){
		config.supportsType = function(type/*, elem*/){
			return !type;
		};
	}

	if(window.picturefill || window.respimage || config.polyfill || window.HTMLPictureElement){return;}

	config.polyfill = function(options){
		var i, len;
		if(window.picturefill || window.respimage){return;}
		for(i = 0, len = options.elements.length; i < len; i++){
			polyfill(options.elements[i]);
		}
	};

	// partial polyfill
	polyfill = (function(){
		var reduceNearest = function (prev, curr, initial, ar) {
			return (Math.abs(curr.w - ar.w) < Math.abs(prev.w - ar.w) ? curr : prev);
		};

		var parseWsrcset = (function(){
			var candidates;
			var regWCandidates = /(([^,\s].[^\s]+)\s+(\d+)w)/g;
			var regHDesc = /\s+\d+h/g;
			var regMultiple = /\s/;
			var addCandidate = function(match, candidate, url, wDescriptor){
				candidates.push({
					c: candidate,
					u: url,
					w: wDescriptor * 1
				});
			};

			return function(input){
				candidates = [];
				input = input.trim();
				input
					.replace(regHDesc, '')
					.replace(regWCandidates, addCandidate)
				;

				if(!candidates.length && input && !regMultiple.test(input)){
					candidates.push({
						c: input,
						u: input,
						w: 100
					});
				}

				return candidates;
			};
		})();

		var createSrcset = function(elem, testPicture){
			var parsedSet;
			var srcSet = elem.getAttribute('srcset') || elem.getAttribute(config.srcsetAttr);

			if(!srcSet && testPicture){
				srcSet = elem.getAttribute('src') || elem.getAttribute(config.srcAttr);
			}
			if(!elem._lazypolyfill || elem._lazypolyfill._set != srcSet){


				parsedSet = parseWsrcset( srcSet || '' );
				if(testPicture && elem.parentNode){
					parsedSet.isPicture = elem.parentNode.nodeName.toUpperCase() == 'PICTURE';
				}
				parsedSet._set = srcSet;
				Object.defineProperty(elem, '_lazypolyfill', {
					value: parsedSet,
					writable: true
				});
			}
		};

		var getX = function(elem){
			var dpr = window.devicePixelRatio || 1;
			var optimum = lazySizes.getX && lazySizes.getX(elem);
			var x = Math.min(optimum || dpr, 2.2, dpr);

			if(x < 1.2){
				x *= 1.05;
			} else if(x > 1.6 && !optimum){
				x *= 0.95;
			}

			return x;
		};

		var getCandidate = function(elem){
			var sources, i, len, media, srces, src, width;

			createSrcset(elem, true);
			srces = elem._lazypolyfill;

			if(srces.isPicture){
				for(i = 0, sources = elem.parentNode.getElementsByTagName('source'), len = sources.length; i < len; i++){
					if(config.supportsType(sources[i].getAttribute('type'), elem) && ( !(media = sources[i].getAttribute('media')) || (window.matchMedia && ((matchMedia(media) || {}).matches)))){
						createSrcset(sources[i]);
						srces = sources[i]._lazypolyfill;
						break;
					}
				}
			}

			if(srces.length > 1){
				width = Math.round( parseInt(elem.getAttribute('sizes'), 10) * getX(elem)) || lazySizes.getWidth(elem, elem.parentNode);
				if(!srces.w || srces.w < width){
					srces.w = width;
				}
				src = srces.reduce(reduceNearest);
			} else {
				src = srces[0];
			}


			return src;
		};

		return function(elem){
			var candidate = getCandidate(elem);

			if(candidate && candidate.u && elem._lazypolyfill.cur != candidate.u){
				elem._lazypolyfill.cur = candidate.u;
				elem.setAttribute(config.srcAttr, candidate.u);
				elem.setAttribute('src', candidate.u);
			}
		};
	})();

	if(config.loadedClass && config.loadingClass){
		(function(){
			var sels = [];
			['img[sizes$="px"][srcset].', 'picture > img:not([srcset]).'].forEach(function(sel){
				sels.push(sel + config.loadedClass);
				sels.push(sel + config.loadingClass);
			});
			config.polyfill({
				elements: document.querySelectorAll(sels.join(', '))
			});
		})();

	}
})(window, document);
