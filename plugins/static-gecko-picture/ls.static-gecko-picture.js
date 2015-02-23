/**
 * FF's first picture implementation is static and does not react to viewport changes, this tiny script fixes this.
 * But be aware, it's a little bit obtrusive: It switches the img element inside of a picture element with a cloned img element, so event listeners and custom properties will be removed.
 */
(function(){
	/*jshint eqnull:true */
	var ua = navigator.userAgent;

	if(window.HTMLPictureElement && ((/ecko/).test(ua) && ua.match(/rv\:(\d+)/) && RegExp.$1 < 41)){
		addEventListener('resize', (function(){
			var timer;

			var props = ['_lazybgset', '_lazyOptimumx', '_lazyrias'];
			var switchImg = function(img){
				var clone;
				var i = 0;
				var parent = img.parentNode;
				var src = img.getAttribute('src');
				var srcset = img.getAttribute('srcset');

				img.removeAttribute('src');
				img.removeAttribute('srcset');

				clone = img.cloneNode();

				parent.removeChild(img);

				for(; i < 3; i++){
					if(img[props[i]]){
						Object.defineProperty(clone, props[i], {
							value: img[props[i]],
							writable: true
						});
					}
				}

				parent.appendChild(clone);

				if(srcset != null){
					clone.setAttribute('srcset', srcset);
				}
				if(src != null){
					clone.setAttribute('src', src);
				}
			};

			var findPictureImgs = function(){
				var i;
				var imgs = document.querySelectorAll('picture > img');
				for(i = 0; i < imgs.length; i++){
					if(imgs[i].complete){
						if(imgs[i].currentSrc){
							switchImg(imgs[i]);
						}
					} else if(imgs[i].currentSrc){
						removeEventListener('resize', onResize);
						break;
					}
				}
			};
			var onResize = function(){
				clearTimeout(timer);
				timer = setTimeout(findPictureImgs, 66);
			};
			return onResize;
		})());
	}
})();
