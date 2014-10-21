(function(window){
	'use strict';
	var config, elements, sizesAttr, onprint, printMedia;
	// see also: http://tjvantoll.com/2012/06/15/detecting-print-requests-with-javascript/
	if(window.addEventListener){
		config = window.lazySizesConfig || {};
		elements = config.lazyClass || 'lazyload';
		sizesAttr = config.sizesAttr || 'data-sizes';
		onprint = function(){
			var i, len;
			if(typeof elements == 'string'){
				elements = document.getElementsByClassName(elements);
			}

			for(i = 0, len = elements.length; i < len; i++){
				lazySizes.unveilLazy(elements[i]);
			}
		};

		addEventListener('beforeprint', onprint, false);

		if(!('onbeforeprint' in window) && window.matchMedia && (printMedia = matchMedia('print')) && printMedia.addListener){
			printMedia.addListener(function(){
				if(printMedia.matches){
					onprint();
				}
			});
		}
	}
})(window);
