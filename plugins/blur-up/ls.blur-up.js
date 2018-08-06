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
	'use strict';

	var slice = [].slice;
	var regBlurUp = /blur-up["']*\s*:\s*["']*(always|auto|unobtrusive)/;
	var regType = /image\/(jpeg|png|gif|svg\+xml)/;

	var matchesMedia = function (source) {
		var media = source.getAttribute('data-media') || source.getAttribute('media');
		var type = source.getAttribute('type');

		return (!type || regType.test(type)) && (!media || window.matchMedia(lazySizes.cfg.customMedia[media] || media).matches);
	};

	var getLowSrc = function (picture, img) {
		var sources = picture ? slice.call(picture.querySelectorAll('source, img')) : [img];
		var element = sources.find(function (src) {
			return src.getAttribute('data-lowsrc') && matchesMedia(src);
		});

		return element && element.getAttribute('data-lowsrc');
	};

	var createBlurup = function(picture, img, src, blurUp){
		var blurImg;
		var isBlurUpLoaded = false;
		var isForced = false;
		var start = blurUp == 'always' ? 0 : Date.now();
		var isState = 0;
		var parent = (picture || img).parentNode;

		var createBlurUpImg = function () {

			if(!src){return;}

			var onloadBlurUp = function(){
				isBlurUpLoaded = true;

				lazySizes.rAF(function () {
					lazySizes.aC(blurImg, 'ls-blur-up-loaded');
				});

				blurImg.removeEventListener('load', onloadBlurUp);
			};

			blurImg = document.createElement('img');

			blurImg.addEventListener('load', onloadBlurUp);

			blurImg.className = 'ls-blur-up-img';
			blurImg.src = src;

			blurImg.className += ' ls-inview';

			parent.insertBefore(blurImg, (picture || img).nextSibling);

			if(blurUp != 'always'){
				blurImg.style.visibility = 'hidden';

				setTimeout(function(){
					lazySizes.rAF(function () {
						if(!isForced){
							blurImg.style.visibility = '';
						}
					});
				}, 20);
			}
		};

		var remove = function () {
			if(blurImg){
				lazySizes.rAF(function() {
					try {
						blurImg.parentNode.removeChild(blurImg);
					} catch(er){}
					blurImg = null;
				});
			}
		};

		var setStateUp = function(force){
			isState++;

			isForced = force || isForced;

			if(force){
				remove();
			} else if(isState > 1) {
				setTimeout(remove, 5000);
			}
		};

		var onload = function() {
			img.removeEventListener('load', onload);
			img.removeEventListener('error', onload);

			if(blurImg){
				lazySizes.rAF(function(){
					lazySizes.aC(blurImg, 'ls-original-loaded');
				});
			}

			if(!isBlurUpLoaded || Date.now() - start < 66){
				setStateUp(true);
			} else {
				setStateUp();
			}
		};

		createBlurUpImg();

		img.addEventListener('load', onload);
		img.addEventListener('error', onload);


		if(blurUp == 'unobtrusive'){
			setStateUp();
		} else {
			var parentUnveil = function (e) {
				if(parent != e.target){
					return;
				}

				lazySizes.aC(blurImg || img, 'ls-inview');

				setStateUp();

				parent.removeEventListener('lazybeforeunveil', parentUnveil);
			};

			if(!parent.getAttribute('data-expand')){
				parent.setAttribute('data-expand', -1);
			}

			parent.addEventListener('lazybeforeunveil', parentUnveil);

			lazySizes.aC(parent, lazySizes.cfg.lazyClass);
		}

	};

	window.addEventListener('lazybeforeunveil', function (e) {
		var detail = e.detail;

		if(detail.instance != lazySizes || !detail.blurUp){return;}

		var img = e.target;
		var picture = img.parentNode;

		if(picture.nodeName != 'PICTURE'){
			picture = null;
		}

		createBlurup(picture, img, getLowSrc(picture, img), detail.blurUp);
	});

	window.addEventListener('lazyunveilread', function (e) {
		var detail = e.detail;

		if(detail.instance != lazySizes){return;}

		var img = e.target;
		var match = (getComputedStyle(img, null) || {fontFamily: ''}).fontFamily.match(regBlurUp);

		if(!match && !img.getAttribute('data-lowsrc')){return;}

		detail.blurUp = match && match[1] || 'always';
	});
}));
