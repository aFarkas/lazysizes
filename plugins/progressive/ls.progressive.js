/*
This lazySizes extension adds better support for browser rendering of progressive jpgs/pngs.
Needs a proper low quality src, so use it with the LQIP pattern.
When the lazysizes detects the image gets visible, the src will be inserted as background image until the image from srcset is completely loaded.
*/
(function(document){
	/*jshint eqnull:true */
	'use strict';
	var regImg, onload;

	if(document.addEventListener){
        regImg = /^img$/i;

        onload = function(e){
            e.target.style.backgroundSize = '';
            e.target.style.backgroundImage = '';
            e.target.removeEventListener(e.type, onload);
        };

        document.addEventListener('lazybeforeunveil', function(e){
            var img = e.target;
            if(!regImg.test(img.nodeName)){
                return;
            }
            var src = img.getAttribute('src');
            if(src) {
                img.style.backgroundSize = '100% 100%';
                img.style.backgroundImage = 'url(' + src + ')';
                img.removeAttribute('src');
                img.addEventListener('load', onload);
            }
        }, false);
	}
})(document);
