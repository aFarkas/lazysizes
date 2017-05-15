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

(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
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
			var takeHighRes = function (lowerCandidate, higherCandidateResolution, optimumx){
				var low, bonusFactor, substract;
				if(!lowerCandidate || !lowerCandidate.d){
					return true;
				}

				substract = optimumx > 0.7 ? 0.6 : 0.4;

				if(lowerCandidate.d >= optimumx){return false;}

				bonusFactor = Math.pow(lowerCandidate.d - substract, 1.6) || 0.1;

				if(bonusFactor < 0.1){
					bonusFactor = 0.1;
				} else if(bonusFactor > 3){
					bonusFactor = 3;
				}

				low = lowerCandidate.d + ((higherCandidateResolution - optimumx) * bonusFactor);

				return low < optimumx;
			};

			return function (data, width, optimumx){
				var i, can;

				for(i = 0; i < data.cands.length; i++){
					can = data.cands[i];
					can.d = (can.w || 1) / width;

					if(data.index >= i){continue;}

					if(can.d <= optimumx || takeHighRes(data.cands[i - 1], can.d, optimumx)){
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

		var constrainSet = function(elem, displayWidth, optimumx, attr, dataName){
			var curIndex;
			var lazyData = elem[dataName];

			if(!lazyData){return;}
			curIndex = lazyData.index;

			constraintFns[dataName](lazyData, displayWidth, optimumx);

			if(!lazyData.dirty || curIndex != lazyData.index){
				lazyData.cSrcset.join(', ');
				elem.setAttribute(attr, lazyData.cSrcset.join(', '));
				lazyData.dirty = true;
			}
		};

		return function(image, displayWidth, optimumx, attr, dataName){
			var sources, parent, len, i;
			var lazyData = image[dataName];

			lazyData.width = displayWidth;

			if(lazyData.picture && (parent = image.parentNode)){
				sources = parent.getElementsByTagName('source');
				for(i = 0, len = sources.length; i < len; i++){
					constrainSet(sources[i], displayWidth, optimumx, attr, dataName);
				}
			}

			constrainSet(image, displayWidth, optimumx, attr, dataName);
		};
	})();

	var getOptimumX = function(element){
		var optimumx = element.getAttribute('data-optimumx') || element.getAttribute('data-maxdpr');

		if(!optimumx && config.constrainPixelDensity){
			optimumx = 'auto';
		}

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
		if(lazySizes && !lazySizes.getOptimumX){
			lazySizes.getX = getOptimumX;
			lazySizes.pWS = parseWsrcset;
			docElem.removeEventListener('lazybeforeunveil', extentLazySizes);
		}
	};

	docElem.addEventListener('lazybeforeunveil', extentLazySizes);
	setTimeout(extentLazySizes);

	config = (lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	if(typeof config.getOptimumX != 'function'){
		config.getOptimumX = function(/*element*/){
			var dpr = window.devicePixelRatio || 1;
			if(dpr > 2.6){
				dpr *= 0.6; // returns 1.8 for 3
			} else if(dpr > 1.9){
				dpr *= 0.8; // returns 1.6 for 2
			} else {
				dpr -= 0.01; // returns 0.99 for 1
			}
			return Math.min(Math.round(dpr * 100) / 100, 2);
		};
	}

	if(!window.devicePixelRatio){return;}

	addEventListener('lazybeforesizes', function(e){
		if(e.detail.instance != lazySizes){return;}

		var optimumx, lazyData, width, attr;

		var elem = e.target;
		var detail = e.detail;
		var dataAttr = detail.dataAttr;

		if(e.defaultPrevented ||
			!(optimumx = getOptimumX(elem)) ||
			optimumx >= devicePixelRatio){return;}

		if(dataAttr && elem._lazyOptimumx && !detail.reloaded && (!config.unloadedClass || !lazySizes.hC(elem, config.unloadedClass))){
			elem._lazyOptimumx = null;
		}

		lazyData = parseImg(elem, '_lazyOptimumx');

		width = detail.width;

		if(width && (lazyData.width || 0) < width){
			attr = dataAttr ? lazySizes.cfg.srcsetAttr : 'srcset';

			lazySizes.rAF(function(){
				constrainSets(elem, width, optimumx, attr, '_lazyOptimumx');
			});
		}
	});

}));
