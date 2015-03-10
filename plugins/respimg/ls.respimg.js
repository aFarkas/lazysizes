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

	if(window.picturefill || window.respimage || config.pf){return;}

	config.pf = function(options){
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
						w: 99
					});
				}

				return candidates;
			};
		})();

		var runMatchMedia = function(){
			if(runMatchMedia.init){return;}

			runMatchMedia.init = true;
			addEventListener('resize', (function(){
				var timer;
				var matchMediaElems = document.getElementsByClassName('lazymatchmedia');
				var run = function(){
					var i, len;
					for(i = 0, len = matchMediaElems.length; i < len; i++){
						polyfill(matchMediaElems[i]);
					}
				};

				return function(){
					clearTimeout(timer);
					timer = setTimeout(run, 66);
				};
			})());
		};

		var createSrcset = function(elem, isImage){
			var parsedSet;
			var srcSet = elem.getAttribute('srcset') || elem.getAttribute(config.srcsetAttr);

			if(!srcSet && isImage){
				srcSet = !elem._lazypolyfill ?
					(elem.getAttribute('src') || elem.getAttribute(config.srcAttr)) :
					elem._lazypolyfill._set
				;
			}

			if(!elem._lazypolyfill || elem._lazypolyfill._set != srcSet){

				parsedSet = parseWsrcset( srcSet || '' );
				if(isImage && elem.parentNode){
					parsedSet.isPicture = elem.parentNode.nodeName.toUpperCase() == 'PICTURE';

					if(parsedSet.isPicture){
						lazySizes.aC(elem, 'lazymatchmedia');
						if(window.matchMedia || (window.Modernizr && Modernizr.mq)){
							runMatchMedia();
						}
					}
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

		var matchesMedia = function(media){
			if(window.matchMedia){
				matchesMedia = function(media){
					return !media || (matchMedia(media) || {}).matches;
				};
			} else if(window.Modernizr && Modernizr.mq){
				return !media || Modernizr.mq(media);
			} else {
				return !media;
			}

			return matchesMedia(media);
		};

		var getCandidate = function(elem){
			var sources, i, len, media, source, srces, src, width;

			source = elem;
			createSrcset(source, true);
			srces = source._lazypolyfill;

			if(srces.isPicture){
				for(i = 0, sources = elem.parentNode.getElementsByTagName('source'), len = sources.length; i < len; i++){
					if( config.supportsType(sources[i].getAttribute('type'), elem) && matchesMedia( sources[i].getAttribute('media')) ){
						source = sources[i];
						createSrcset(source);
						srces = source._lazypolyfill;
						break;
					}
				}
			}

			if(srces.length > 1){
				width = Math.round( parseInt(source.getAttribute('sizes'), 10) * getX(elem)) || lazySizes.getWidth(elem, elem.parentNode);
				if(!srces.w || srces.w < width){
					srces.w = width;
				}
				src = srces.reduce(reduceNearest);
			} else {
				src = srces[0];
			}


			return src;
		};

		var p = function(elem){
			var candidate = getCandidate(elem);

			if(candidate && candidate.u && elem._lazypolyfill.cur != candidate.u){
				elem._lazypolyfill.cur = candidate.u;
				elem.setAttribute(config.srcAttr, candidate.u);
				elem.setAttribute('src', candidate.u);
			}
		};

		p.parse = parseWsrcset;

		return p;
	})();

	if(window.HTMLPictureElement){return;}

	if(config.loadedClass && config.loadingClass){
		(function(){
			var sels = [];
			['img[sizes$="px"][srcset].', 'picture > img:not([srcset]).'].forEach(function(sel){
				sels.push(sel + config.loadedClass);
				sels.push(sel + config.loadingClass);
			});
			config.pf({
				elements: document.querySelectorAll(sels.join(', '))
			});
		})();

	}
})(window, document);

/**
 * Some versions of iOS (8.1-) do load the first candidate of a srcset candidate list, if width descriptors with the sizes attribute is used.
 * This tiny extension prevents this wasted download by creating a picture structure around the image.
 * Note: This extension is already included in the ls.respimg.js file.
 *
 * Usage:
 *
 * <img
 * 	class="lazyload"
 * 	data-sizes="auto"
 * 	data-srcset="small.jpg 640px,
 * 		medium.jpg 980w,
 * 		large.jpg 1280w"
 * 	/>
 */

(function(document){
	'use strict';
	var regPicture;
	var img = document.createElement('img');

	if(('srcset' in img) && !('sizes' in img)){
		regPicture = /^picture$/i;
		document.addEventListener('lazybeforeunveil', function(e){
			var elem, parent, srcset, sizes, isPicture;
			var picture, source;
			if(e.defaultPrevented ||
				lazySizesConfig.noIOSFix ||
				!(elem = e.target) ||
				!(srcset = elem.getAttribute(lazySizesConfig.srcsetAttr)) ||
				!(parent = elem.parentNode) ||
				(
					!(isPicture = regPicture.test(parent.nodeName || '')) &&
					!(sizes = elem.getAttribute('sizes') || elem.getAttribute(lazySizesConfig.sizesAttr))
				)
			){return;}

			picture = isPicture ? parent : document.createElement('picture');

			if(!elem._lazyImgSrc){
				Object.defineProperty(elem, '_lazyImgSrc', {
					value: document.createElement('source'),
					writable: true
				});
			}
			source = elem._lazyImgSrc;

			if(sizes){
				source.setAttribute('sizes', sizes);
			}

			source.setAttribute(lazySizesConfig.srcsetAttr, srcset);
			elem.setAttribute('data-pfsrcset', srcset);
			elem.removeAttribute(lazySizesConfig.srcsetAttr);

			if(!isPicture){
				parent.insertBefore(picture, elem);
				picture.appendChild(elem);
			}
			picture.insertBefore(source, elem);
		});
	}
})(document);
