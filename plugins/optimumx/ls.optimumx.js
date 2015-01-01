/*
 This lazySizes extension helps to use responsive images, but to opt-out from high retina support in case the w descriptor is used (for x descriptor this is not needed!),
 - data-sizes="auto" has to be used in conjunction
 - respimage.js needs to be loaded even if the browser supports responsive images

 <img src="100.jpg"
 	data-optimumx="1.8"
 	data-sizes="auto"
 	data-srcset="100.jpg 100w,
 	300.jpg 300w,
 	600.jpg 600w,
 	900.jpg 900w,
 	1200.jpg 1200w"
 	/>

 	see a live demo here: http://afarkas.github.io/lazysizes/maxdpr/
 */

(function(window, document, undefined){
	/*jshint eqnull:true */
	'use strict';
	var config, extentLazySizes;
	var regPicture = /^picture$/i;
	if(!window.addEventListener || !window.devicePixelRatio){
		return;
	}

	config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(typeof config.getOptimumX != 'function'){
		config.getOptimumX = function(/*element*/){
			var dpr = window.devicePixelRatio;
			if(dpr > 2.5){
				dpr *= 0.7; // returns 2.1 for 3
			} else if(dpr > 1.9){
				dpr *= 0.8; // returns 1.6 for 2
			} else if(dpr > 1.4){
				dpr *= 0.9; // returns 1.35 for 1.5
			} else {
				dpr *= 0.99; // returns 0.99 for 1 or 1.24 for 1.3
			}
			return Math.round(dpr * 100) / 100;
		};
	}

	function ascendingSort( a, b ) {
		return a.w - b.w;
	}

	function mapSetCan(can){
		var nCan = {
			url: can.url
		};
		nCan[can.desc.type] = can.desc.val;
		return nCan;
	}

	function parseSets(elem){
		var lazyData = {srcset: elem.getAttribute(lazySizes.cfg.srcsetAttr)} || '';
		var cands = window.respimage ? respimage._.parseSet(lazyData) : window.parseSrcset(lazyData.srcset);
		elem._lazyMaxDprSrcset = lazyData;

		lazyData.cands = cands;

		if(cands[0] && cands[0].desc){
			cands = cands.map(mapSetCan);
			lazyData.cands = cands;
		}

		lazyData.index = 0;
		lazyData.dirty = false;
		if(cands[0] && cands[0].w){
			cands.sort( ascendingSort );
			lazyData.cSrcset = [cands[0].url +' '+ cands[0].w + 'w'];
		} else {
			lazyData.cSrcset = [];
			lazyData.cands = [];
		}

		return lazyData;
	}

	function parseImg(elem){
		var sources, i, len;
		var parent = elem.parentNode || {};
		var lazyData = parseSets(elem);
		lazyData.isImg = true;
		if(regPicture.test(parent.nodeName || '')){
			lazyData.picture = true;
			sources = parent.getElementsByTagName('source');
			for(i = 0, len = sources.length; i < len; i++){
				parseSets(sources[i]).isImg = false;
			}
		}

		return lazyData;
	}

	function takeHighRes(beforeCan, curCanWidth, width){
		var low, high;
		if(!beforeCan || !beforeCan.w){
			return true;
		}

		if(beforeCan.w > width){return false;}

		low = 1 - (beforeCan.w / width);
		high = (curCanWidth / width) - 1;

		return high - low < 0;
	}

	function getConstrainedSrcSet(data, width){
		var i, can, take;

		for(i = data.index + 1; i < data.cands.length; i++){
			can = data.cands[i];
			take = false;
			if(!can.w){
				if(!can.x){
					can.x = can.d || 1;
				}
				take = 'x';
			} else if(can.w <= width || takeHighRes(data.cands[i - 1], can.w, width)){
				take = 'w';
			} else {
				break;
			}

			if(take){
				data.cSrcset.push(can.url +' '+ can[take] + take);
				data.index = i;
			}
		}
	}

	function constrainSrces(elem, width, attr){
		var imageData, curIndex;
		var lazyData = elem._lazyMaxDprSrcset;

		if(!lazyData){return;}
		curIndex = lazyData.index;

		getConstrainedSrcSet(lazyData, width);

		if(!lazyData.dirty || curIndex != lazyData.index){
			elem.setAttribute(attr, lazyData.cSrcset.join(', '));
			lazyData.dirty = true;

			if(lazyData.isImg && attr == 'srcset' && !window.HTMLPictureElement){
				if(window.respimage && !respimage._.observer){
					imageData = elem[respimage._.ns];
					if(imageData){
						imageData.srcset = undefined;
					}
					respimage({reevaluate: true, reparse: true, elements: [elem]});
				} else if(window.picturefill){
					picturefill({reevaluate: true, reparse: true, elements: [elem]});
				}
			}

			if(lazyData.cSrcset.length >= lazyData.cands.length){
				elem.removeAttribute('data-optimumx');
			}
		}
	}

	function getOptimumX(element){
		var optimumx = element.getAttribute('data-optimumx') || element.getAttribute('data-maxdpr');
		if(optimumx){
			if(optimumx == 'auto'){
				optimumx = config.getOptimumX(element);
			} else {
				optimumx = parseFloat(optimumx, 10);
			}
		}
		return optimumx;
	}

	extentLazySizes = function(){
		if(window.lazySizes && !window.lazySizes.getOptimumX){
			window.lazySizes.getX = getOptimumX;
		}
	};

	addEventListener('lazybeforesizes', function(e){
		var maxdpr, lazyData, width, attr, parent, sources, i, len;

		if((!window.respimage && !window.parseSrcset) ||
			e.defaultPrevented ||
			!(maxdpr = getOptimumX(e.target)) ||
			maxdpr >= window.devicePixelRatio ||
			(e.target._lazysizesWidth && e.target._lazysizesWidth > e.details.width)){return;}

		lazyData = e.target._lazyMaxDprSrcset || parseImg(e.target);
		width = e.details.width * maxdpr;

		if(width){
			attr = e.details.dataAttr ? lazySizes.cfg.srcsetAttr : 'srcset';

			if(lazyData.picture && (parent = e.target.parentNode)){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					constrainSrces(sources[i], width, attr);
				}
			}
			constrainSrces(e.target, width, attr);
		}
	}, false);

	extentLazySizes();
	setTimeout(extentLazySizes);

})(window, document);
