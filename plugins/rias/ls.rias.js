/*

*/

(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';

	if(!document.addEventListener){return;}

	var config, riasCfg;
	var regExps = {};
	var copyAttrs = {string: 1, boolean: 1, number: 1};
	var regNumber = /^\-*\+*\d+\.*\d*$/;
	var regPicture = /^picture$/i;
	var r20 = /%20/g;
	var anchor = document.createElement('a');

	function createDefaultFormats(formats){
		var width;
		var i = 0;
		while(!width || width < 2800){
			i += 10;
			width = (16 * i);
			formats.push(width);
		}
	}

	function extendConfig(){
		var prop;
		var noop = function(){};
		var riasDefaults = {
			prefix: '',
			postfix: '',
			srcAttr: 'data-src',
			quality: 85,
			hdQuality: 70,
			maxdpr: 1.7,
			absUrl: false,
			encodeSrc: false,
			modifySrc: noop,
			modifyOptions: noop
		};

		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

		if(config){
			if(!config.rias){
				config.rias = {};
			}
			riasCfg = config.rias;

			if(!('formats' in riasCfg)){
				riasCfg.formats = [];
				createDefaultFormats(riasCfg.formats, 96);
			}

			for(prop in riasDefaults){
				if(!(prop in riasCfg)){
					riasCfg[prop] = riasDefaults[prop];
				}
			}

			if(riasCfg.formats){
				riasCfg.formats.sort(function(a, b) {
					return a - b;
				});
			}

			if(!riasCfg.disable){
				init();
			}
			return true;
		}
		return false;
	}

	function getElementOptions(elem){
		var attr, attrVal, parent;

		var options = elem._lazyRiasOpts;

		if(!options){
			parent = elem.parentNode;
			options = {
				isPicture: !!(parent && regPicture.test(parent.nodeName || ''))
			};

			elem._lazyRiasOpts = options;
			for(attr in riasCfg){
				attrVal = elem.getAttribute('data-'+ attr);

				if(attrVal != null){
					if(attrVal == 'true'){
						attrVal = true;
					} else if(attrVal == 'false'){
						attrVal = false;
					} else if(regNumber.test(attrVal)){
						attrVal = parseFloat(attrVal);
					}
					options[attr] = attrVal;
				} else if(copyAttrs[typeof riasCfg[attr]]){
					options[attr] = riasCfg[attr];
				}
			}
		}

		return options;
	}

	function reduceNearest(prev, curr, initial, ar) {
		return (Math.abs(curr - ar.width) < Math.abs(prev - ar.width) ? curr : prev);
	}

	function replaceUrlProps(src, attrs){
		var attr, regAttr;
		for(attr in attrs){
			if(!regExps[attr]){
				regExps[attr] = new RegExp('\\s*\\{\\s*' + attr + '\\s*\\}\\s*' , 'gi');
			}
			regAttr = regExps[attr];
			src = src.replace(regAttr, attrs[attr]);
		}
		return src;
	}

	function setSrc(src, opts, elem, attrName, prefix, postfix ){
		var retSrc;

		if(!src){return;}

		src = replaceUrlProps(src, opts);

		if(opts.absUrl){
			anchor.setAttribute('href', src);
			src = anchor.href;
		}

		if(opts.encodeSrc){
			src = encodeURIComponent(src).replace(r20, '+');
		}

		src = prefix + src + postfix;

		retSrc = riasCfg.modifySrc(src, opts, elem, riasCfg);

		if(retSrc == null){
			retSrc = src;
		}

		if(retSrc && retSrc != elem.getAttribute(attrName)){
			elem.setAttribute(attrName, retSrc);
			return true;
		}
	}

	function createAttrObject(elem, width){

		var opts = getElementOptions(elem);
		var formats = ('formats' in opts) ? opts.formats : riasCfg.formats;
		var event = document.createEvent('Event');

		event.initEvent('lazyriasmodifyoptions', true, false);

		opts.width = width;
		opts.height = elem.offsetHeight;

		opts.dpr = window.devicePixelRatio || 1;

		if(opts.maxdpr < opts.dpr){
			opts.dpr = opts.maxdpr;
		}

		if(opts.dpr > 1.4 && opts.quality > opts.hdQuality){
			opts.quality = opts.hdQuality;
		}

		if(opts.dpr > 1){
			opts.width *= opts.dpr;
			opts.height *= opts.dpr;
		}

		if(formats){
			if(Array.isArray(formats)){
				formats.width = opts.width;
				opts.width = formats.reduce(reduceNearest);
			} else {
				opts.width = Math.round(opts.width / formats) * formats;
			}
		}

		riasCfg.modifyOptions(opts, elem);
		event.details = opts;
		elem.dispatchEvent(event);

		return opts;
	}

	function init(){

		document.addEventListener('lazybeforesizes', function(e){
			var src, elemOpts, parent, sources, i, len, setAttr, changed, isRespimage, imageData, sourceSrc, prefix, postfix;


			if(e.defaultPrevented ||
				!(src = e.target._lazyRiasSrc || e.target.getAttribute( e.target.getAttribute('data-srcattr') || riasCfg.srcAttr )) ||
				(e.target._lazysizesWidth && e.target._lazysizesWidth > e.details.width)){return;}

			elemOpts = createAttrObject(e.target, e.details.width);
			prefix = replaceUrlProps(elemOpts.prefix, elemOpts);
			postfix = replaceUrlProps(elemOpts.postfix, elemOpts);


			setAttr = e.details.dataAttr ? config.srcAttr : 'src';

			if(!e.target._lazyRiasSrc){
				e.target._lazyRiasSrc = src;
			}

			if(elemOpts.isPicture || e.target.getAttribute( (e.details.dataAttr ? config.srcsetAttr : 'srcset') )){
				setAttr = e.details.dataAttr ? config.srcsetAttr : 'srcset';
				isRespimage = true;
			}

			if(elemOpts.isPicture && (parent = e.target.parentNode)){

				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sourceSrc = sources[i]._lazyRiasSrc || sources[i].getAttribute(riasCfg.srcAttr) || sources[i].getAttribute(config.srcsetAttr);

					if(!sources[i]._lazyRiasSrc){
						sources[i]._lazyRiasSrc = sourceSrc;
					}
					if( setSrc(sourceSrc, elemOpts, sources[i], setAttr, prefix, postfix) ){
						changed = 'changed';
					}
				}
			}

			if(setSrc(src, elemOpts, e.target, setAttr, prefix, postfix)){
				changed = true;
			}

			if(isRespimage){
				e.target.setAttribute('sizes', e.details.width+'px');
			}
			e.target._lazysizesWidth = e.details.width;
			e.preventDefault();

			if(isRespimage && changed && !e.details.dataAttr && !window.HTMLPictureElement){

				if(window.picturefill){
					picturefill({reevaluate: true, reparse: true, elements: [e.target]});
				} else if(window.respimage && !respimage._.observer){
					imageData = e.target[respimage._.ns];
					if(changed === true && imageData){
						imageData.srcset = undefined;
					}
					respimage({reparse: true, elements: [e.target]});
				} else if(window.console){
					console.log('a picture/[srcset] polyfill is needed here.');
				}

			}




		}, false);
	}


	if(!extendConfig()){
		setTimeout(extendConfig);
	}
})(window, document);
