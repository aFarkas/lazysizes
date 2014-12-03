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
	'use strict';
	var regPicture = /^picture$/i;
	if(!window.addEventListener){
		return;
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
		var low, high, curRes;
		if(!beforeCan || !beforeCan.w){
			return true;
		}
		curRes = beforeCan.w / width;
		low = (1 - (beforeCan.w / width)) * 0.9;
		high = (curCanWidth / width) - 1;

		high *= Math.pow(curRes, 1.3);

		return high - low < 0;
	}

	function getConstrainedSrcSet(data, width){
		var i, can, take;

		for(i = data.index + 1; i < data.cands.length; i++){
			can = data.cands[i];
			take = false;
			if(!can.w && can.x){
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

			if(lazyData.isImg && attr == 'srcset' && !window.HTMLPictureElement && window.respimage && !respimage._.observer){
				imageData = elem[respimage._.ns];
				if(imageData){
					imageData.srcset = undefined;
				}
				respimage({reparse: true, elements: [elem]});
			}
		}
	}

	document.addEventListener('lazybeforesizes', function(e){
		var maxdpr, lazyData, width, data, attr, parent, sources, i, len;
		if((!window.respimage && !window.parseSrcset) ||
			e.defaultPrevented ||
			!(maxdpr = e.target.getAttribute('data-optimumx') || e.target.getAttribute('data-maxdpr')) ||
			maxdpr > (window.devicePixelRatio || 1) ||
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

})(window, document);
