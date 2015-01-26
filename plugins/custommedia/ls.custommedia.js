/*

*/
(function(window){
	/*jshint eqnull:true */
	'use strict';

	var create = function(){
		if(!window.lazySizes || window.lazySizes.getCustomMedias){return;}
		window.lazySizes.getCustomMedias = (function(){
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
				element = element || document.querySelector('html');
				object = object || {};
				parse(getStyle(element, ':before'), object);
				parse(getStyle(element, ':after'), object);
				return object;
			};
		})();

		lazySizes.getCustomMedias(lazySizes.cfg.customMedia);
		removeEventListener('lazybeforesizes', extendCustomMedia);
	};

	if(window.addEventListener){
		addEventListener('lazybeforesizes', create);
	}
	create();
	setTimeout(create);

})(window);
