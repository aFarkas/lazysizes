(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';

	if(!document.addEventListener){return;}

	var config, riasCfg;
	var replaceTypes = {string: 1, number: 1};
	var regNumber = /^\-*\+*\d+\.*\d*$/;
	var regPicture = /^picture$/i;
	var regWidth = /\s*\{\s*width\s*\}\s*/i;
	var regHeight = /\s*\{\s*height\s*\}\s*/i;
	var regPlaceholder = /\s*\{\s*([a-z0-9]+)\s*\}\s*/ig;
	var regObj = /^\[.*\]|\{.*\}$/;
	var regAllowedSizes = /^(?:auto|\d+(px)?)$/;
	var anchor = document.createElement('a');
	var img = document.createElement('img');
	var buggySizes = ('srcset' in img) && !('sizes' in img);
	var supportPicture = !!window.HTMLPictureElement && !buggySizes;

	(function(){
		var prop;
		var noop = function(){};
		var riasDefaults = {
			prefix: '',
			postfix: '',
			srcAttr: 'data-src',
			absUrl: false,
			modifyOptions: noop,
			widthmap: {},
			ratio: false
		};

		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

		if(!config){
			config = {};
			window.lazySizesConfig = config;
		}

		if(!config.supportsType){
			config.supportsType = function(type/*, elem*/){
				return !type;
			};
		}

		if(!config.rias){
			config.rias = {};
		}
		riasCfg = config.rias;

		if(!('widths' in riasCfg)){
			riasCfg.widths = [];
			(function (widths){
				var width;
				var i = 0;
				while(!width || width < 3000){
					i += 5;
					if(i > 30){
						i += 1;
					}
					width = (36 * i);
					widths.push(width);
				}
			})(riasCfg.widths);
		}

		for(prop in riasDefaults){
			if(!(prop in riasCfg)){
				riasCfg[prop] = riasDefaults[prop];
			}
		}
	})();

	function getElementOptions(elem, src){
		var attr, parent, setOption, options;


		parent = elem.parentNode;
		options = {
			isPicture: !!(parent && regPicture.test(parent.nodeName || ''))
		};

		setOption = function(attr, run){
			var attrVal = elem.getAttribute('data-'+ attr);

			if(attrVal != null){
				if(attrVal == 'true'){
					attrVal = true;
				} else if(attrVal == 'false'){
					attrVal = false;
				} else if(regNumber.test(attrVal)){
					attrVal = parseFloat(attrVal);
				} else if(typeof riasCfg[attr] == 'function'){
					attrVal = riasCfg[attr](elem, attrVal);
				} else if(regObj.test(attrVal)){
					try {
						attrVal = JSON.parse(attrVal);
					} catch(e){}
				}
				options[attr] = attrVal;
			} else if((attr in riasCfg) && typeof riasCfg[attr] != 'function'){
				options[attr] = riasCfg[attr];
			} else if(run && typeof riasCfg[attr] == 'function'){
				options[attr] = riasCfg[attr](elem, attrVal);
			}
		};

		for(attr in riasCfg){
			setOption(attr);
		}
		src.replace(regPlaceholder, function(full, match){
			if(!(match in options)){
				setOption(match, true);
			}
		});

		return options;
	}

	function replaceUrlProps(url, options){
		var candidates = [];
		var replaceFn = function(full, match){
			return (replaceTypes[typeof options[match]]) ? options[match] : full;
		};
		candidates.srcset = [];

		if(options.absUrl){
			anchor.setAttribute('href', url);
			url = anchor.href;
		}

		url = ((options.prefix || '') + url + (options.postfix || '')).replace(regPlaceholder, replaceFn);

		options.widths.forEach(function(width){
			var widthAlias = options.widthmap[width] || width;
			var candidate = {
				u: url.replace(regWidth, widthAlias)
						.replace(regHeight, options.ratio ? Math.round(width * options.ratio) : ''),
				w: width
			};

			candidates.push(candidate);
			candidates.srcset.push( (candidate.c = candidate.u + ' ' + width + 'w') );
		});
		return candidates;
	}

	function setSrc(src, opts, elem){
		var elemW = 0;
		var elemH = 0;
		var sizeElement = elem;

		if(!src){return;}

		if (opts.ratio === 'container') {
			// calculate image or parent ratio
			elemW = sizeElement.scrollWidth;
			elemH = sizeElement.scrollHeight;

			while ((!elemW || !elemH) && sizeElement !== document) {
				sizeElement = sizeElement.parentNode;
				elemW = sizeElement.scrollWidth;
				elemH = sizeElement.scrollHeight;
			}
			if (elemW && elemH) {
				opts.ratio = elemH / elemW;
			}
		}

		src = replaceUrlProps(src, opts);

		src.isPicture = opts.isPicture;

		if(buggySizes && elem.nodeName.toUpperCase() == 'IMG'){
			elem.removeAttribute(config.srcsetAttr);
		} else {
			elem.setAttribute(config.srcsetAttr, src.srcset.join(', '));
		}

		Object.defineProperty(elem, '_lazyrias', {
			value: src,
			writable: true
		});
	}

	function createAttrObject(elem, src){
		var opts = getElementOptions(elem, src);

		riasCfg.modifyOptions.call(elem, {target: elem, details: opts, detail: opts});

		lazySizes.fire(elem, 'lazyriasmodifyoptions', opts);
		return opts;
	}

	function getSrc(elem){
		return elem.getAttribute( elem.getAttribute('data-srcattr') || riasCfg.srcAttr ) || elem.getAttribute(config.srcsetAttr) || elem.getAttribute(config.srcAttr) || elem.getAttribute('data-pfsrcset') || '';
	}

	addEventListener('lazybeforesizes', function(e){
		var elem, src, elemOpts, parent, sources, i, len, sourceSrc, sizes, detail, hasPlaceholder, modified, emptyList, max_width_allowed;
		elem = e.target;

		if(!e.detail.dataAttr || e.defaultPrevented || riasCfg.disabled || !((sizes = elem.getAttribute(config.sizesAttr) || elem.getAttribute('sizes')) && regAllowedSizes.test(sizes))){return;}

		src = getSrc(elem);

		elemOpts = createAttrObject(elem, src);

		hasPlaceholder = regWidth.test(elemOpts.prefix) || regWidth.test(elemOpts.postfix);

		/* never allow sizes to be set to a width higher than the maximum width image we have.
		*
		* This stops some upscaling on Firefox and Chrome as they use the sizes
		* attribute to set the intrinsic width/height of an image. If no CSS rules
		* (or just a max-with) are used, small images get upscaled.
		*
		*/
		max_width_allowed = Math.max.apply(null, elemOpts.widths);
		e.detail.width = Math.min(max_width_allowed, e.detail.width);

		if(elemOpts.isPicture && (parent = elem.parentNode)){
			sources = parent.getElementsByTagName('source');
			for(i = 0, len = sources.length; i < len; i++){
				if ( hasPlaceholder || regWidth.test(sourceSrc = getSrc(sources[i])) ){
					setSrc(sourceSrc, elemOpts, sources[i]);
					modified = true;
				}
			}
		}

		if ( hasPlaceholder || regWidth.test(src) ){
			setSrc(src, elemOpts, elem);
			modified = true;
		} else if (modified) {
			emptyList = [];
			emptyList.srcset = [];
			emptyList.isPicture = true;
			Object.defineProperty(elem, '_lazyrias', {
				value: emptyList,
				writable: true
			});
		}

		if(modified){
			if(supportPicture){
				elem.removeAttribute(config.srcAttr);
			} else if(sizes != 'auto') {
				detail = {
					width: parseInt(sizes, 10)
				};
				polyfill({
					target: elem,
					detail: detail
				});
			}
		}
	}, true);
	// partial polyfill
	var polyfill = (function(){
		var ascendingSort = function( a, b ) {
			return a.w - b.w;
		};

		var reduceCandidate = function (srces) {
			var lowerCandidate, bonusFactor;
			var len = srces.length;
			var candidate = srces[len -1];
			var i = 0;

			for(i; i < len;i++){
				candidate = srces[i];
				candidate.d = candidate.w / srces.w;
				if(candidate.d >= srces.d){
					if(!candidate.cached && (lowerCandidate = srces[i - 1]) &&
						lowerCandidate.d > srces.d - (0.13 * Math.pow(srces.d, 2.2))){

						bonusFactor = Math.pow(lowerCandidate.d - 0.6, 1.6);

						if(lowerCandidate.cached) {
							lowerCandidate.d += 0.15 * bonusFactor;
						}

						if(lowerCandidate.d + ((candidate.d - srces.d) * bonusFactor) > srces.d){
							candidate = lowerCandidate;
						}
					}
					break;
				}
			}
			return candidate;
		};

		var getWSet = function(elem, testPicture){
			var src;
			if(!elem._lazyrias && lazySizes.pWS && (src = lazySizes.pWS(elem.getAttribute(config.srcsetAttr || ''))).length){
				Object.defineProperty(elem, '_lazyrias', {
					value: src,
					writable: true
				});
				if(testPicture && elem.parentNode){
					src.isPicture = elem.parentNode.nodeName.toUpperCase() == 'PICTURE';
				}
			}
			return elem._lazyrias;
		};

		var getX = function(elem){
			var dpr = window.devicePixelRatio || 1;
			var optimum = lazySizes.getX && lazySizes.getX(elem);
			return Math.min(optimum || dpr, 2.4, dpr);
		};

		var getCandidate = function(elem, width){
			var sources, i, len, media, srces, src;

			srces = elem._lazyrias;

			if(srces.isPicture && window.matchMedia){
				for(i = 0, sources = elem.parentNode.getElementsByTagName('source'), len = sources.length; i < len; i++){
					if(getWSet(sources[i]) && !sources[i].getAttribute('type') && ( !(media = sources[i].getAttribute('media')) || ((matchMedia(media) || {}).matches))){
						srces = sources[i]._lazyrias;
						break;
					}
				}
			}

			if(!srces.w || srces.w < width){
				srces.w = width;
				srces.d = getX(elem);
				src = reduceCandidate(srces.sort(ascendingSort));
			}

			return src;
		};

		var polyfill = function(e){
			var candidate;
			var elem = e.target;

			if(!buggySizes && (window.respimage || window.picturefill || lazySizesConfig.pf)){
				document.removeEventListener('lazybeforesizes', polyfill);
				return;
			}

			if(!('_lazyrias' in elem) && (!e.detail.dataAttr || !getWSet(elem, true))){
				return;
			}

			candidate = getCandidate(elem, e.detail.width);

			if(candidate && candidate.u && elem._lazyrias.cur != candidate.u){
				elem._lazyrias.cur = candidate.u;
				candidate.cached = true;
				lazySizes.rAF(function(){
					elem.setAttribute(config.srcAttr, candidate.u);
					elem.setAttribute('src', candidate.u);
				});
			}
		};

		if(!supportPicture){
			addEventListener('lazybeforesizes', polyfill);
		} else {
			polyfill = function(){};
		}

		return polyfill;

	})();

})(window, document);
