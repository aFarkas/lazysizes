/*
This lazySizes extension removes scroll events implements a more lazier scrollintent event instead.
*/
(function(window, document){
	'use strict';
	var config, afterScrollTimer, update, checkElem, checkFn, checkTimer, top, left;
	if(window.addEventListener){
		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;
		if(config){
			try {
				config.scroll = false;
			} catch (e){}
		} else {
			config = {scroll: false};
			window.lazySizesConfig = config;
		}
		if(config.scroll){return;}

		update = function(){
			if(window.lazySizes){
				lazySizes.updateAllLazy();
				clearTimeout(afterScrollTimer);
				clearTimeout(checkTimer);
				checkElem = null;
			}
		};
		checkFn = function(){
			var nTop = checkElem.scrollTop || checkElem.pageYOffset;
			var nLeft = checkElem.scrollLeft || checkElem.pageXOffset;
			checkElem = null;
			if(Math.abs(top - nTop) < 50 && Math.abs(left - nLeft) < 50){
				update();
			}
		};

		addEventListener('scroll', function(e){

			var elem = e.target == document ? window : e.target;

			clearTimeout(afterScrollTimer);
			afterScrollTimer = setTimeout(update, 99);

			if(!checkElem){
				checkElem = elem;
				top = checkElem.scrollTop || checkElem.pageYOffset;
				left = checkElem.scrollLeft || checkElem.pageXOffset;
				clearTimeout(checkTimer);
				checkTimer = setTimeout(checkFn, 99);
			} else if(elem != checkElem){
				update();
			}

		}, true);
	}
})(window, document);
