(function(window, document){
	'use strict';

	if(document.addEventListener && document.documentElement.classList){
		var unblockTimer;
		var block = false;
		var blockedItems = [];
		var lazyClass = (window.lazySizesConfig || {}).lazyClass || 'lazyload';

		var unblock = function(){
			block = false;
			while(blockedItems.length){
				var item = blockedItems.shift();

				item.classList.add(lazyClass)
			}
		};

		addEventListener('scroll', function(){
			block = true;
			clearTimeout(unblockTimer);

			unblockTimer = setTimeout(unblock, 99);
		}, true);

		document.addEventListener('lazybeforeunveil', function(e){

			if(!e.defaultPrevented && block){
				blockedItems.push(e.target);
				e.preventDefault();
			}
		}, false);
	}

})(window, document);
