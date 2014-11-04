/*

*/

(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';

	if(!document.addEventListener){return;}

	var config, riasCfg;
	var regExps = {};
	var regPicture = /^picture$/i;
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
		var prop, attrOpts;
		var riasDefaults = {
			prefix: '',
			postfix: '',
			urlAttr: 'data-src',
			quality: 80,
			hdQuality: 70,
			maxdpr: 2,
			customAttrs: {},
			makeFullSrc: false,
			encodeSrc: false,
			adjustSrc: function(src){
				return src;
			},
			adjustAttrs: function(){

			}
		};

		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

		if(config){
			attrOpts = {string: 1, number: 1};
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

			for(prop in riasCfg){
				if(!(prop in riasCfg.customAttrs) && attrOpts[typeof riasCfg[prop]]){
					riasCfg.customAttrs[prop] = true;
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

	function extendAttrs(elem, attrs){
		var attr, attrVal;
		for(attr in riasCfg.customAttrs){
			attrVal = elem.getAttribute('data-'+ attr);
			if(attrVal){
				attrs[attr] = attrVal;
			}
		}
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

	function setSrc(src, attrs, elem, attrName, prefix, postfix ){
		var retSrc;

		if(!src){return;}

		src = replaceUrlProps(src, attrs);

		if(riasCfg.makeFullSrc){
			anchor.setAttribute('href', src);
			src = anchor.href;
		}

		src = prefix + src + postfix;

		retSrc = riasCfg.adjustSrc(src, attrs, elem, riasCfg);

		if(retSrc == null){
			retSrc = src;
		}

		if(retSrc && retSrc != elem.getAttribute(attrName)){
			elem.setAttribute(attrName, retSrc);
			return true;
		}
	}

	function createAttrObject(elem, width){
		var attrs = {
			width: width,
			maxdpr: riasCfg.maxdpr,
			quality: riasCfg.quality,
			hdQuality: riasCfg.hdQuality,
			dpr: window.devicePixelRatio || 1
		};

		extendAttrs(elem, attrs);

		if(attrs.maxdpr < attrs.dpr){
			attrs.dpr = attrs.maxdpr;
		}

		if(attrs.dpr > 1.4 && attrs.quality > attrs.hdQuality){
			attrs.quality = attrs.hdQuality;
		}

		if(attrs.dpr){
			attrs.width *= attrs.dpr;
		}

		if(riasCfg.formats){
			riasCfg.formats.width = attrs.width;
			attrs.width = riasCfg.formats.reduce(reduceNearest);
		}

		riasCfg.adjustAttrs(attrs, elem);

		return attrs;
	}

	function init(){

		document.addEventListener('lazybeforesizes', function(e){
			var src, attrs, isPicture, parent, sources, i, len, setAttr, changed, isRespimage, imageData, sourceSrc, prefix, postfix;


			if(e.defaultPrevented ||
				!(src = e.target._lazyRiasSrc || e.target.getAttribute(riasCfg.urlAttr)) ||
				(e.target._lazysizesWidth && e.target._lazysizesWidth > e.details.width)){return;}

			attrs = createAttrObject(e.target, e.details.width);
			prefix = replaceUrlProps(riasCfg.prefix, attrs);
			postfix = replaceUrlProps(riasCfg.postfix, attrs);

			parent = e.target.parentNode;
			isPicture = parent && regPicture.test(parent.nodeName || '');
			setAttr = e.details.dataAttr ? config.srcAttr : 'src';

			if(!e.target._lazyRiasSrc){
				e.target._lazyRiasSrc = src;
			}

			if(isPicture || e.target.getAttribute( (e.details.dataAttr ? config.srcsetAttr : 'srcset') )){
				setAttr = e.details.dataAttr ? config.srcsetAttr : 'srcset';
				isRespimage = true;
			}

			if(isPicture){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					sourceSrc = sources[i]._lazyRiasSrc || sources[i].getAttribute(riasCfg.urlAttr) || sources[i].getAttribute(config.srcsetAttr);

					if(!sources[i]._lazyRiasSrc){
						sources[i]._lazyRiasSrc = sourceSrc;
					}
					if( setSrc(sourceSrc, attrs, sources[i], setAttr, prefix, postfix) ){
						changed = 'changed';
					}
				}
			}

			if(setSrc(src, attrs, e.target, setAttr, prefix, postfix)){
				changed = true;
			}

			if(isRespimage && changed && !e.details.dataAttr && !window.HTMLPictureElement){
				e.target._lazysizesWidth = e.details.width;
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
			if(isRespimage){
				e.target.setAttribute('sizes', e.details.width+'px');
			}
			e.preventDefault();


		}, false);
	}


	if(!extendConfig()){
		setTimeout(extendConfig);
	}
})(window, document);
