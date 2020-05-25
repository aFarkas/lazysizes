/*
This lazySizes extension adds better support for print.
In case the user starts to print lazysizes will load all images.
*/
(function(window, factory) {
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if (typeof define == 'function' && define.amd) {
		define(['lazysizes'], factory);
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(window, function(window, document, lazySizes) {
	/*jshint eqnull:true */
	'use strict';
	var config, elements, onprint, printMedia;
	// see also: http://tjvantoll.com/2012/06/15/detecting-print-requests-with-javascript/
	if(window.addEventListener){
		config = lazySizes && lazySizes.cfg;
		elements = config.lazyClass || 'lazyload';
		onprint = function(){
			var i, len;
			if(typeof elements == 'string'){
				elements = document.getElementsByClassName(elements);
			}

			if(lazySizes){
				for(i = 0, len = elements.length; i < len; i++){
					lazySizes.loader.unveil(elements[i]);
				}
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
}));
