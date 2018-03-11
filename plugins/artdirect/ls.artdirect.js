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
	'use strict';

	if(!window.addEventListener){return;}
	var lazySizesConfig = lazySizes.cfg;

	var  ElementPrototype = (window.Element || Node || window.HTMLElement).prototype;
	var regArtDirect = /artdirect/;
	var regDescriptors = /\s+(\d+)(w|h)\s+(\d+)(w|h)/;
	var regArtDirectTags = /artdirect["']*\s*:\s*["']*(.+?)(?=($|'|"|;))/;
	var regPicture = /^picture$/i;
	var regSplit = /[\s,]+/g;
	var slice = [].slice;

	function getCandidatesAspectRatio(element){
		var match;
		var ratio = parseFloat(element.getAttribute('data-aspectratio'));
		var srcset = element.getAttribute(lazySizesConfig.srcsetAttr) || element.getAttribute('srcset');

		if(!ratio && (match = srcset.match(regDescriptors))){
			if(match[2] == 'w'){
				ratio = match[1] / match[3];
			} else {
				ratio = match[3] / match[1];
			}
		}

		return ratio;
	}

	function getLayoutAspectRatio(element){
		return element.offsetWidth / element.offsetHeight;
	}

	function toTagSelector(tag){
		return 'source[data-tag~="' + tag + '"]';
	}

	function getArtDirectConfig(img){
		var picture = img.parentNode;
		var isPicture = regPicture.test(picture.nodeName || '');
		var content = (window.getComputedStyle(img) || {}).fontFamily;
		var config = null;

		if(isPicture && (lazySizesConfig.autoArtDirect || regArtDirect.test(content || ''))){
			config = {
				picture: picture,
				img: img,
				tags: content.match(regArtDirectTags)
			};

			if(config.tags){
				config.selector = config.tags[1].split(regSplit).map(toTagSelector).join(',');
			}
		}

		return config;
	}

	function toSourceObj(source){
		var media = source.getAttribute('media');

		return {
			source: source,
			aspectRatio: getCandidatesAspectRatio(source),
			isSelected: !media || window.matchMedia(media).matches,
		};
	}

	function sortAspectRatio(source1, source2){
		return source1.aspectRatio < source2.aspectRatio;
	}

	function getClosestSource(sources, aspecRatio){
		var i, len;
		var closest = sources[0];

		for(i = 1, len = sources.length; i < len; i++){
			if(Math.abs(closest.aspectRatio - aspecRatio) > Math.abs(sources[i].aspectRatio - aspecRatio)){
				closest = sources[i];
			}
		}

		return closest;
	}

	function setMedia(source, media){
		source._lsMedia = media;
		lazySizes.rAF(function(){
			if(source._lsMedia){
				delete source._lsMedia;
			}
			source.setAttribute('media', media);
		});
	}

	function selectSource(imgCfg){
		var imgAspectRatio = getLayoutAspectRatio(imgCfg.img);
		var sources = slice.call(imgCfg.picture.getElementsByTagName('source'))
			.map(toSourceObj)
			.sort(sortAspectRatio)
		;
		var matchedSources = imgCfg.selector ?
			sources.filter(function(source){
				return source.source.matches(imgCfg.selector);
			}) :
			sources
		;
		var closestSource = getClosestSource(matchedSources, imgAspectRatio);

		if(!closestSource.isSelected){
			setMedia(closestSource.source, '(min-width: 1px)');
		}

		sources
			.filter(function(source){
				return (source != closestSource && source.isSelected);
			})
			.forEach(function (source) {
				setMedia(source.source, '(x)');
			})
		;
	}

	function addAutoArtDirection(e){

		if(e.detail.instance != lazySizes){return;}

		var img = e.target;
		var imgCfg = getArtDirectConfig(img);

		if(imgCfg){
			selectSource(imgCfg);
		}
	}

	if(!ElementPrototype.matches){
		ElementPrototype.matches = ElementPrototype.matchesSelector ||
			ElementPrototype.webkitMatchesSelector ||
			ElementPrototype.msMatchesSelector ||
			ElementPrototype.oMatchesSelector;
	}

	window.addEventListener('lazybeforesizes', addAutoArtDirection, true);
}));
