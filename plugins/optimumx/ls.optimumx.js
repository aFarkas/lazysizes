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
	if(!window.addEventListener){return;}

	var config;

	var regPicture = /^picture$/i;
	var docElem = document.documentElement;

	var parseWsrcset = (function(){
		var candidates;
		var reg = /(([^,\s].[^\s]+)\s+(\d+)(w|h)(\s+(\d+)(w|h))?)/g;
		var addCandidate = function(match, candidate, url, descNumber1, descType1, fullDesc, descNumber2, descType2){
			candidates.push({
				c: candidate,
				u: url,
				w: (descType2 == 'w' ? descNumber2 : descNumber1)  * 1
			});
		};

		return function(input){
			candidates = [];
			input.replace(reg, addCandidate);
			return candidates;
		};
	})();

	var parseImg = (function(){

		var ascendingSort = function ( a, b ) {
			return a.w - b.w;
		};

		var parseSets =  function (elem, dataName){
			var lazyData = {srcset: elem.getAttribute(lazySizes.cfg.srcsetAttr)  || ''};
			var cands = parseWsrcset(lazyData.srcset);
			Object.defineProperty(elem, dataName, {
				value: lazyData,
				writable: true
			});

			lazyData.cands = cands;

			lazyData.index = 0;
			lazyData.dirty = false;
			if(cands[0] && cands[0].w){

				cands.sort( ascendingSort );
				lazyData.cSrcset = [cands[ lazyData.index ].c];
			} else {
				lazyData.cSrcset = lazyData.srcset ? [lazyData.srcset] : [];
				lazyData.cands = [];
			}

			return lazyData;
		};

		return function parseImg(elem, dataName){
			var sources, i, len, parent;


			if(!elem[dataName]){
				parent = elem.parentNode || {};
				elem[dataName] = parseSets(elem, dataName);
				elem[dataName].isImg = true;
				if(regPicture.test(parent.nodeName || '')){
					elem[dataName].picture = true;
					sources = parent.getElementsByTagName('source');
					for(i = 0, len = sources.length; i < len; i++){
						parseSets(sources[i], dataName).isImg = false;
					}
				}
			}

			return elem[dataName];
		};
	})();

	var constraintFns = {
		_lazyOptimumx: (function(){
			var takeHighRes = function (beforeCan, curCanWidth, width){
				var low, high;
				if(!beforeCan || !beforeCan.w){
					return true;
				}

				if(beforeCan.w > width){return false;}

				low = 1 - (beforeCan.w / width);
				high = (curCanWidth / width) - 1;

				return high - low < 0;
			};

			return function (data, width){
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
			};
		})()
	};

	var constrainSets = (function(){

		var constrainSet = function(elem, width, attr, dataName){
			var curIndex;
			var lazyData = elem[dataName];

			if(!lazyData){return;}
			curIndex = lazyData.index;

			constraintFns[dataName](lazyData, width);

			if(!lazyData.dirty || curIndex != lazyData.index){
				lazyData.cSrcset.join(', ');
				elem.setAttribute(attr, lazyData.cSrcset.join(', '));
				lazyData.dirty = true;
			}
		};

		return function(image, width, attr, dataName){
			var sources, parent, len, i;
			var lazyData = image[dataName];

			lazyData.width = width;

			if(lazyData.picture && (parent = image.parentNode)){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					constrainSet(sources[i], width, attr, dataName);
				}
			}

			constrainSet(image, width, attr, dataName);
		};
	})();

	var getOptimumX = function(element){
		var optimumx = element.getAttribute('data-optimumx') || element.getAttribute('data-maxdpr');
		if(optimumx){
			if(optimumx == 'auto'){
				optimumx = config.getOptimumX(element);
			} else {
				optimumx = parseFloat(optimumx, 10);
			}
		}
		return optimumx;
	};

	var extentLazySizes = function(){
		if(window.lazySizes && !window.lazySizes.getOptimumX){
			lazySizes.getX = getOptimumX;
			lazySizes.pWS = parseWsrcset;
			docElem.removeEventListener('lazybeforeunveil', extentLazySizes);
		}
	};

	docElem.addEventListener('lazybeforeunveil', extentLazySizes);
	setTimeout(extentLazySizes);

	config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(typeof config.getOptimumX != 'function'){
		config.getOptimumX = function(/*element*/){
			var dpr = window.devicePixelRatio || 1;
			if(dpr > 2.4){
				dpr *= 0.7; // returns 2.1 for 3
			} else if(dpr > 1.9){
				dpr *= 0.85; // returns 1.7 for 2
			}
			return Math.min(Math.round(dpr * 100) / 100, 2.2);
		};
	}

	if(!window.devicePixelRatio){return;}

	addEventListener('lazybeforesizes', function(e){
		var optimumx, lazyData, width, attr;

		if(e.defaultPrevented ||
			!(optimumx = getOptimumX(e.target)) ||
			optimumx >= devicePixelRatio){return;}

		lazyData = parseImg(e.target, '_lazyOptimumx');

		width = e.detail.width * optimumx;

		if(width && (lazyData.width || 0) < width){
			attr = e.detail.dataAttr ? lazySizes.cfg.srcsetAttr : 'srcset';

			constrainSets(e.target, width, attr, '_lazyOptimumx');
		}
	});

	addEventListener('lazybeforeunveil', function(e){
		if(e.target._lazyOptimumx && !e.detail.reloaded){
			e.target._lazyOptimumx = null;
		}
	});

})(window, document);
