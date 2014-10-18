(function(window, document){
	'use strict';

	if(document.addEventListener){
		//add simple support for background images:
		document.addEventListener('lazybeforeunveil', function(e){
			var bg = e.target.getAttribute('data-bg');
			if(bg){
				e.target.style.backgroundImage = bg;
				e.target.removeAttribute('data-bg');
				e.preventDefault();
			}
		}, false);

		//add simple support for video elements
		document.addEventListener('lazybeforeunveil', function(e){
			var poster = e.target.getAttribute('data-poster');
			if(poster){
				e.target.poster = poster;
				e.target.removeAttribute('data-poster');
				e.preventDefault();
			}
			if(e.target.preload == 'none'){
				e.target.preload = 'auto';
				e.preventDefault();
			}
		}, false);
	}

})(window, document);
