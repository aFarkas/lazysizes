/*
 This lazySizes extension helps to use responsive images, but to opt-out from too high retina support in case the w descriptor is used (for x descriptor this is not needed!),
 - data-sizes="auto" has to be used in conjunction

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
	var config, extentLazySizes, parseWsrcset;
	var regPicture = /^picture$/i;
	if(!window.devicePixelRatio){return;}

	parseWsrcset = (function(){
		var candidates;
		var reg = /([^,\s].[^\s]+\s+(\d+)w)/g;
		var regHDesc = /\s+\d+h/g;
		var addCandidate = function(match, candidate, wDescriptor){
			candidates.push({
				c: candidate,
				w: wDescriptor * 1
			});
		};

		return function(input){
			candidates = [];
			input
				.replace(regHDesc, '')
				.replace(reg, addCandidate)
			;
			return candidates;
		};
	})();

	config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(typeof config.getOptimumX != 'function'){
		config.getOptimumX = function(/*element*/){
			var dpr = window.devicePixelRatio;
			if(dpr > 2.4){
				dpr *= 0.63; // returns 1.9 for 3
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

	function parseSets(elem){
		var lazyData = {srcset: elem.getAttribute(lazySizes.cfg.srcsetAttr)  || ''};
		var cands = parseWsrcset(lazyData.srcset);
		elem._lazyOptimumx = lazyData;

		lazyData.cands = cands;

		lazyData.index = 0;
		lazyData.dirty = false;
		if(cands[0] && cands[0].w){
			cands.sort( ascendingSort );
			lazyData.cSrcset = [cands[0].c];
		} else {
			lazyData.cSrcset = lazyData.srcset ? [lazyData.srcset] : [];
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
		var i, can;

		for(i = data.index + 1; i < data.cands.length; i++){
			can = data.cands[i];
			if(can.w <= width || takeHighRes(data.cands[i - 1], can.w, width)){
				data.cSrcset.push(can.c);
				data.index = i;
			} else {
				break;
			}
		}
	}

	function constrainSrces(elem, width, attr){
		var curIndex, srcset;
		var lazyData = elem._lazyOptimumx;

		if(!lazyData){return;}
		curIndex = lazyData.index;

		getConstrainedSrcSet(lazyData, width);

		if(!lazyData.dirty || curIndex != lazyData.index){
			srcset = lazyData.cSrcset.join(', ');
			elem.setAttribute(attr, lazyData.cSrcset.join(', '));
			lazyData.dirty = true;

			if(lazyData.cSrcset.length >= lazyData.cands.length){
				elem.removeAttribute('data-optimumx');
				elem.removeAttribute('data-maxdpr');
			}
		}
		return srcset;
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
			lazySizes.getX = getOptimumX;
		}
	};

	addEventListener('lazybeforesizes', function(e){
		var optimumx, lazyData, width, attr, parent, sources, i, len;

		if(e.defaultPrevented ||
			!(optimumx = getOptimumX(e.target)) ||
			optimumx >= window.devicePixelRatio){return;}

		lazyData = e.target._lazyOptimumx || parseImg(e.target);

		width = e.details.width * optimumx;

		if(width && (lazyData.width || 0) < width){
			attr = e.details.dataAttr ? lazySizes.cfg.srcsetAttr : 'srcset';

			lazyData.width = width;

			if(lazyData.picture && (parent = e.target.parentNode)){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					constrainSrces(sources[i], width, attr);
				}
			}

			e.details.srcset = constrainSrces(e.target, width, attr);
		}
	}, false);

	extentLazySizes();
	setTimeout(extentLazySizes);

})(window, document);
