/*
 html:after {
 	display: none;
 	content: '--small: (max-width: 500px) | --medium: (max-width: 1100px) | --large: (min-width: 1100px)';
 }
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
	var docElem = document.documentElement;

	lazySizes.getCustomMedias = (function(){
		var regCleanPseudos = /['"]/g;
		var regSplit = /\s*\|\s*/g;
		var regNamedQueries = /^([a-z0-9_-]+)\s*:\s*(.+)$/i;

		var getStyle = function(elem, pseudo){
			return ((getComputedStyle(elem, pseudo) || {getPropertyValue: function(){}}).getPropertyValue('content') || 'none').replace(regCleanPseudos, '').trim();
		};
		var parse = function(string, object){
			string.split(regSplit).forEach(function(query){
				var match = query.match(regNamedQueries);

				if(match){
					object[match[1]] = match[2];
				}
			});
		};
		return function(object, element){
			object = object || lazySizes.cfg.customMedia;
			element = element || document.querySelector('html');
			parse(getStyle(element, ':before'), object);
			parse(getStyle(element, ':after'), object);
			return object;
		};
	})();

	lazySizes.updateCustomMedia = function(){
		var i, len, customMedia;
		var elems = docElem.querySelectorAll('source[media][data-media][srcset]');

		lazySizes.getCustomMedias();

		for(i = 0, len = elems.length; i < len; i++){
			if( (customMedia = lazySizes.cfg.customMedia[elems[i].getAttribute('data-media') || elems[i].getAttribute('media')]) ){
				elems[i].setAttribute('media', customMedia);
			}
		}

		elems = docElem.querySelector('source[media][data-media][srcset] ~ img');
		for(i = 0, len = elems.length; i < len; i++){
			lazySizes.uP(elems[i]);
		}

		lazySizes.autoSizer.checkElems();
	};

	lazySizes.getCustomMedias();

}));
