(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';

	if(!document.addEventListener){return;}

	var config, riasCfg;
	var replaceTypes = {string: 1, number: 1};
	var regNumber = /^\-*\+*\d+\.*\d*$/;
	var regPicture = /^picture$/i;
	var regWidth = /\s*\{\s*width\s*\}\s*/i;
	var regPlaceholder = /\s*\{\s*([a-z0-9]+)\s*\}\s*/ig;
	var regObj = /^\[.*\]|\{.*\}$/;
	var anchor = document.createElement('a');

	(function(){
		var prop;
		var noop = function(){};
		var riasDefaults = {
			prefix: '',
			postfix: '',
			srcAttr: 'data-src',
			absUrl: false,
			modifyOptions: noop,
			widthmap: {}
		};

		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

		if(!config){
			config = {};
			window.lazySizesConfig = config;
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
				widths.push(96);
				while(!width || width < 2800){
					i += 10;
					if(i > 60){
						i += 10;
					}
					width = (16 * i);
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
			var candidate = url.replace(regWidth, options.widthmap[width] || width);

			candidates.push({url: candidate, w: width});
			candidates.srcset.push(candidate +' '+width+'w');
		});
		return candidates;
	}

	function setSrc(src, opts, elem){

		if(!src){return;}

		src = replaceUrlProps(src, opts);

		src.isPicture = opts.isPicture;

		elem.setAttribute(config.srcsetAttr, src.srcset.join(', '));
		Object.defineProperty(elem, '_lazyrias', {
			value: src
		});
	}

	function createAttrObject(elem, src){
		var opts = getElementOptions(elem, src);

		riasCfg.modifyOptions.call(elem, {target: elem, details: opts});

		lazySizes.fire(elem, 'lazyriasmodifyoptions', opts);
		return opts;
	}

	function getSrc(elem){
		return elem.getAttribute( elem.getAttribute('data-srcattr') || riasCfg.srcAttr ) || elem.getAttribute(config.srcsetAttr) || elem.getAttribute(config.srcAttr) || '';
	}

	addEventListener('lazybeforeunveil', function(e){
		var elem, src, elemOpts, parent, sources, i, len, sourceSrc;
		if(e.defaultPrevented || !(src = getSrc(e.target)) || riasCfg.disabled || !(e.target.getAttribute(config.sizesAttr) || e.getAttribute('sizes'))){return;}

		elem = e.target;

		elemOpts = createAttrObject(elem, src);

		if(regWidth.test(src) || regWidth.test(elemOpts.prefix) || regWidth.test(elemOpts.postfix)){
			if(elemOpts.isPicture && (parent = elem.parentNode)){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sourceSrc = getSrc(sources[i]);
					setSrc(sourceSrc, elemOpts, sources[i]);
				}
			}

			setSrc(src, elemOpts, elem);
		}


	});

	// partial polyfill
	(function(){
		var reduceNearest = function (prev, curr, initial, ar) {
			return (Math.abs(curr.w - ar.w) < Math.abs(prev.w - ar.w) ? curr : prev);
		};

		var getCandidate = function(elem, width){
			var sources, i, len, media, srces;
			width *= Math.min((lazySizes.getX && lazySizes.getX(elem)) || window.devicePixelRatio || 1, 2);
			srces = elem._lazyrias;

			if(srces.isPicture && window.matchMedia){
				for(i = 0, sources = elem.parentNode.getElementsByTagName('source'), len = sources.length; i < len; i++){
					if(sources[i]._lazyrias && !sources[i].getAttribute('type') && ( !(media = sources[i].getAttribute('media')) || ((matchMedia(media) || {}).matches))){
						srces = sources[i]._lazyrias;
						break;
					}
				}
			}

			if(!srces.w || srces.w < width){
				srces.w = width;
			}
			return srces.reduce(reduceNearest);
		};


		var polyfill = function(e){
			var candidate;
			var elem = e.target;

			if(window.HTMLPictureElement || window.respimage || window.picturefill){
				removeEventListener('lazybeforesizes', polyfill);
				return;
			}

			if(!elem._lazyrias){return;}

			candidate = getCandidate(elem, e.details.width);

			if(candidate && candidate.url && elem._lazyrias.cur != candidate.url){
				elem._lazyrias.cur = candidate.url;
				elem.setAttribute(config.srcAttr, candidate.url);
				elem.setAttribute('src', candidate.url);
			}
		};

		addEventListener('lazybeforesizes', polyfill);

	})();

})(window, document);
