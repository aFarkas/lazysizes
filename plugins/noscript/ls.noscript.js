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

	var dummyParent = {nodeName: ''};
	var supportPicture = !!window.HTMLPictureElement && ('sizes' in document.createElement('img'));
	var config = (window.lazySizes && lazySizes.cfg) || window.lazySizesConfig;

	var handleLoadingElements = function(e){
		var i, isResponsive, hasTriggered, onload, loading;

		var loadElements = e.target.querySelectorAll('img, iframe');

		for(i = 0; i < loadElements.length; i++){
			isResponsive = loadElements[i].getAttribute('srcset') || (loadElements[i].parentNode || dummyParent).nodeName.toLowerCase() == 'picture';

			if(!supportPicture && isResponsive){
				lazySizes.uP(loadElements[i]);
			}

			if(!loadElements[i].complete && (isResponsive || loadElements[i].src)){
				e.detail.firesLoad = true;

				if(!onload || !loading){
					loading = 0;
					/*jshint loopfunc:true */
					onload = function(evt){
						loading--;
						if((!evt || loading < 1) && !hasTriggered){
							hasTriggered = true;
							e.detail.firesLoad = false;
							lazySizes.fire(e.target, '_lazyloaded', {}, false, true);
						}

						if(evt && evt.target){
							evt.target.removeEventListener('load', onload);
							evt.target.removeEventListener('error', onload);
						}
					};

					setTimeout(onload, 3500);
				}

				loading++;

				loadElements[i].addEventListener('load', onload);
				loadElements[i].addEventListener('error', onload);
			}
		}
	};

	if(!config){
		config = {};
		window.lazySizesConfig = config;
	}

	config.getNoscriptContent =  function(noScript){
		return noScript.textContent || noScript.innerText;
	};

	window.addEventListener('lazybeforeunveil', function(e){
		if(e.detail.instance != lazySizes || e.defaultPrevented || e.target.getAttribute('data-noscript') == null){return;}

		var noScript = e.target.querySelector('noscript, script[type*="html"]') || {};
		var content = config.getNoscriptContent(noScript);

		if(content){
			e.target.innerHTML = content;
			handleLoadingElements(e);
		}
	});
}));
