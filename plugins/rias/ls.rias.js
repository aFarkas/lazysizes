(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';

	if(!document.addEventListener){return;}

	var config, riasCfg;
	var regNumber = /^\-*\+*\d+\.*\d*$/;
	var regPicture = /^picture$/i;
	var r20 = /%20/g;
	var regWidth = /\s*\{\s*width\s*\}\s*/i;
	var regPlaceholder = /\s*\{\s*([a-z0-9]+)\s*\}\s*/ig;
	var regObj = /^\[.*\]|\{.*\}$/;
	var anchor = document.createElement('a');

	var partialFill = (function(){
		var reduceNearest = function (prev, curr, initial, ar) {
			return (Math.abs(curr.w - ar.w) < Math.abs(prev.w - ar.w) ? curr : prev);
		};
		return function(elem, srces){
			var src;
			if(!window.HTMLPictureElement && !window.respimage && !window.picturefill){
				srces.w = Math.max(elem.offsetWidth, (elem.parentNode || {offsetWidth: 0}).offsetWidth) *
					Math.min(window.devicePixelRatio || 1, 2);
				src = srces.reduce(reduceNearest);

				if(src && src.url){
					elem.setAttribute(config.srcAttr, src.url);
					elem.setAttribute('src', src.url);
				}
			}
		};
	})();

	(function(){
		var prop;
		var noop = function(){};
		var riasDefaults = {
			prefix: '',
			postfix: '',
			srcAttr: 'data-src',
			absUrl: false,
			encodeSrc: false,
			modifySrc: noop,
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
			} else if(typeof riasCfg[attr] != 'function'){
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
			return (!(match in options)) ? full : options[match];
		};
		candidates.srcset = [];

		url = (options.prefix || '') + url + (options.postfix || '');

		if(options.absUrl){
			anchor.setAttribute('href', url);
			url = anchor.href;
		}

		options.widths.forEach(function(width){
			var candidate = url.replace(regWidth, options.widthmap[width] || width).replace(regPlaceholder, replaceFn);
			if(options.encodeSrc){
				candidate = encodeURIComponent(candidate).replace(r20, '+');
			}
			candidates.push({url: candidate, w: width});
			candidates.srcset.push(candidate +' '+width+'w');
		});
		return candidates;
	}

	function setSrc(src, opts, elem){

		if(!src){return;}

		src = replaceUrlProps(src, opts);


		elem.setAttribute(config.srcsetAttr, src.srcset.join(', '));
		partialFill(elem, src);
	}

	function createAttrObject(elem, src){

		var opts = getElementOptions(elem, src);
		var event = document.createEvent('Event');

		riasCfg.modifyOptions.call(elem, {target: elem, details: opts});

		event.initEvent('lazyriasmodifyoptions', true, false);
		event.details = opts;

		elem.dispatchEvent(event);
		console.log(opts);

		return opts;
	}

	function getSrc(elem){
		return elem.getAttribute( elem.getAttribute('data-srcattr') || riasCfg.srcAttr ) || elem.getAttribute(config.srcsetAttr) || elem.getAttribute(config.srcAttr) || '';
	}

	document.addEventListener('lazybeforeunveil', function(e){
		var elem, src, elemOpts, parent, sources, i, len, sourceSrc;


		if(e.defaultPrevented || !(src = getSrc(e.target)) || !regWidth.test(src) || riasCfg.disabled){return;}

		elem = e.target;

		elemOpts = createAttrObject(elem, src);

		if(elemOpts.isPicture && (parent = elem.parentNode)){
			sources = parent.getElementsByTagName('source');
			for(i = 0, len = sources.length; i < len; i++){
				sourceSrc = getSrc(sources[i]);
				setSrc(sourceSrc, elemOpts, sources[i]);
			}
		}

		setSrc(src, elemOpts, elem);

	}, false);

})(window, document);
