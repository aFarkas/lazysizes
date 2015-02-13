/*
 This lazySizes extension removes scroll events implements a more lazier scrollintent event instead.
 */
(function(window, document){
	/*jshint eqnull:true */
	'use strict';
	var config, index;
	if(window.addEventListener){
		config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;
		index = 0;
		if(!config){
			config = {};
			window.lazySizesConfig = config;
		}

		if(window.lazySizes && lazySizes.init.i){return;}

		config.scroll = false;

		if(!config.expand){
			config.expand = 250;
		}

		if(!('scrollLoadMode' in config)){
			config.scrollLoadMode = 1;
		}

		addEventListener('scroll', (function(){
			var afterScrollTimer, checkElem, checkTimer, top, left;
			var checkFn = function(){
				var nTop = Math.abs(top - (checkElem.scrollTop || checkElem.pageYOffset || 0));
				var nLeft = Math.abs(left - (checkElem.scrollLeft || checkElem.pageXOffset || 0));
				checkElem = null;

				if(nTop < 400 && nLeft < 400){
					if(lazySizes.loader.m < 2){
						lazySizes.loader.m = 2;
					}
					if(nTop < 180 && nLeft < 180){
						update();
					}
				}
			};
			var afterScroll = function(){
				lazySizes.loader.m = 3;
				index = 0;
				update();
				clearTimeout(afterScrollTimer);
			};
			var update = function(){
				lazySizes.loader.checkElems();
				clearTimeout(checkTimer);
				checkElem = null;
			};

			return function(e){

				var elem = e.target == document ? window : e.target;

				clearTimeout(afterScrollTimer);
				afterScrollTimer = setTimeout(afterScroll, 99);
				lazySizes.loader.m = config.scrollLoadMode;

				if(index === 0){
					lazySizes.loader.checkElems();
				} else if(index > 40){
					index = -1;
				}

				index++;

				if(!checkElem){
					checkElem = elem;
					top = checkElem.scrollTop || checkElem.pageYOffset || 0;
					left = checkElem.scrollLeft || checkElem.pageXOffset || 0;
					clearTimeout(checkTimer);
					checkTimer = setTimeout(checkFn, 150);
				} else if(elem != checkElem){
					update();
				}
				elem = null;
			};
		})(), true);
	}
})(window, document);
