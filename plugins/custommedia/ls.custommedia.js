/*
 html:after {
 	display: none;
 	content: '--small: (max-width: 500px) | --medium: (max-width: 1100px) | --large: (min-width: 1100px)';
 }
*/
(function(window){
	/*jshint eqnull:true */
	'use strict';
	var docElem = document.documentElement;

	var create = function(){
		if(!window.lazySizes || lazySizes.getCustomMedias){return;}
		lazySizes.getCustomMedias = (function(){
			var regCleanPseudos = /['"]/g;
			var regSplit = /\s*\|\s*/g;
			var regNamedQueries = /^([a-z0-9_-]+)\s*:\s*(.+)$/i;

			var getStyle = function(elem, pseudo){
				return (getComputedStyle(elem, pseudo).getPropertyValue('content') || 'none').replace(regCleanPseudos, '').trim();
			};
			var parse = function(string, object){
				string.split(regSplit).forEach(function(query){
					if(query.match(regNamedQueries)){
						object[RegExp.$1] = RegExp.$2;
					}
				});
			};
			return function(object, element){
				object = object || {};
				element = element || document.querySelector('html');
				parse(getStyle(element, ':before'), object);
				parse(getStyle(element, ':after'), object);
				return object;
			};
		})();

		lazySizes.getCustomMedias(lazySizes.cfg.customMedia);
		docElem.removeEventListener('lazybeforeunveil', create);
	};

	if(window.addEventListener){
		docElem.addEventListener('lazybeforeunveil', create);
	}
	create();
	setTimeout(create);

})(window);
