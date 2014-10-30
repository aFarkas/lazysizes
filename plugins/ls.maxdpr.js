/*
 This lazySizes extension helps to use responsive images, but to opt-out from high retina support in case the w descriptor is used (for x descriptor this is not needed!),
 - data-sizes="auto" has to be used in conjunction
 - respimage.js needs to be loaded even if the browser supports responsive images

 <img src="100.jpg"
 	data-maxdpr="1.8"
 	data-sizes="auto"
 	data-srcset="100.jpg 100w,
 	300.jpg 300w,
 	600.jpg 600w,
 	900.jpg 900w,
 	1200.jpg 1200w"
 	/>
 */


(function(window, document, undefined){
	'use strict';
	var regPicture = /^picture$/i;
	if(!window.addEventListener){
		return;
	}

	function ascendingSort( a, b ) {
		return a.res - b.res;
	}

	function parseSets(elem){
		var lazyData = {srcset: elem.getAttribute(lazySizes.cfg.srcsetAttr)} || '';
		var cands = respimage._.parseSet(lazyData);
		elem._lazySrcset = lazyData;

		cands.sort( ascendingSort );
		lazyData.index = 0;
		lazyData.dirty = false;
		if(cands[0]){
			lazyData.cSrcset = [cands[0].url +' '+ cands[0].desc.val + cands[0].desc.type];
		} else {
			lazyData.cSrcset = [];
		}

		return lazyData;
	}

	function parseImg(elem){
		var sources, i, len;
		var parent = elem.parentNode || {};
		var lazyData = parseSets(elem);
		lazyData.isImg = true;
		if(regPicture.test(parent.nodeName) || ''){
			lazyData.picture = true;
			sources = parent.getElementsByTagName('source');
			for(i = 0, len = sources.length; i < len; i++){
				parseSets(sources[i]).isImg = false;
			}
		}

		return lazyData;
	}

	function getConstrainedSrcSet(data, width){
		var i, can;

		for(i = data.index + 1; i < data.cands.length; i++){
			can = data.cands[i];
			if(can.desc.type != 'w' || can.desc.val <= width){
				data.cSrcset.push(can.url +' '+ can.desc.val + can.desc.type);
				data.index = i;
			} else {
				break;
			}
		}
	}

	function constrainSrces(elem, width, attr){
		var imageData;
		var lazyData = elem._lazySrcset;
		var curIndex = lazyData.index;

		getConstrainedSrcSet(lazyData, width);

		if(!lazyData.dirty || curIndex != lazyData.index){
			elem.setAttribute(attr, lazyData.cSrcset.join(', '));
			lazyData.dirty = true;

			if(lazyData.isImg && attr == 'srcset' && !window.HTMLPictureElement && !respimage._.observer){
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
		if(!window.respimage ||
			e.defaultPrevented ||
			!(maxdpr = e.target.getAttribute('data-maxdpr')) ||
			maxdpr > (window.devicePixelRatio || 1) ||
			(e.target._lazysizesWidth && e.target._lazysizesWidth > e.details.width)){return;}

		lazyData = e.target._lazySrcset || parseImg(e.target);
		width = e.details.width * maxdpr;

		if(width){
			attr = e.details.polyfill ? 'srcset' : lazySizes.cfg.srcsetAttr;

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
