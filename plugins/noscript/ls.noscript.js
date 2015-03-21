(function(){
	/*jshint eqnull:true */
	'use strict';

	if(window.addEventListener){
		var dummyParent = {nodeName: ''};
		var supportPicture = !!window.HTMLPictureElement;

		var handleLoadingElements = function(e){
			var i, srcset, hasTriggered, onload, loading;


			var loadElements = e.target.querySelectorAll('img, iframe');


			for(i = 0; i < loadElements.length; i++){
				srcset = loadElements[i].getAttribute('srcset');

				if(!supportPicture &&
					(srcset || (loadElements[i].parentNode || dummyParent).toLowerCase() == 'picture')){
					lazySizes.uP(loadElements[i]);
				}

				if(!loadElements[i].complete && (srcset || loadElements[i].src)){
					e.details.firesLoad = true;

					if(!onload || !loading){
						loading = 0;
						/*jshint loopfunc:true */
						onload = function(evt){
							loading--;
							if(loading < 1 && !hasTriggered){
								hasTriggered = true;
								e.details.firesLoad = false;
								lazySizes.fire(e.target, '_lazyloaded', {}, false, true);
							}

							if(evt && evt.target){
								evt.target.removeEventListener('load', onload);
								evt.target.removeEventListener('error', onload);
							}
						};

						setTimeout(onload, 3000);
					}

					loading++;
					loadElements[i].addEventListener('load', onload);
					loadElements[i].addEventListener('error', onload);
				}
			}
		};

		addEventListener('lazybeforeunveil', function(e){
			if(e.defaultPrevented || e.target.getAttribute('data-noscript') == null){return;}

			var noScript = e.target.querySelector('noscript, script[type*="html"]') || {};
			var content = noScript.textContent || noScript.innerText;

			if(content){
				e.target.innerHTML = content;
				handleLoadingElements(e);
			}
		});
	}
})();
