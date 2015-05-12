/**
 * FF's first picture implementation is static and does not react to viewport changes, this tiny script fixes this.
 */
(function(){
	/*jshint eqnull:true */
	var ua = navigator.userAgent;

	if(window.HTMLPictureElement && ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 < 41)){
		addEventListener('resize', (function(){
			var timer;

			var dummySrc = document.createElement('source');

			var fixPicture = function(img){
				var picture = img.parentNode;
				var source = dummySrc.cloneNode();
				picture.insertBefore(source, picture.firstElementChild);
				setTimeout(function(){
					picture.removeChild(source);
				});
			};

			var findPictureImgs = function(){
				var i;
				var imgs = document.querySelectorAll('picture > img');
				for(i = 0; i < imgs.length; i++){
					if(imgs[i].complete){
						if(imgs[i].currentSrc){
							fixPicture(imgs[i]);
						}
					} else if(imgs[i].currentSrc){
						removeEventListener('resize', onResize);
						break;
					}
				}
			};
			var onResize = function(){
				clearTimeout(timer);
				timer = setTimeout(findPictureImgs, 99);
			};

			dummySrc.srcset = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

			return onResize;
		})());
	}
})();
