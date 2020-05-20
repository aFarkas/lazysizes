(function(window, factory) {
	if(!window) {return;}
	var globalInstall = function(){
		factory(window.lazySizes);
		window.removeEventListener('lazyunveilread', globalInstall, true);
	};

	factory = factory.bind(null, window, window.document);

	if(typeof module == 'object' && module.exports){
		factory(require('lazysizes'));
	} else if (typeof define == 'function' && define.amd) {
		require(['lazysizes'], factory);
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(typeof window != 'undefined' ?
	window : 0, function(window, document, lazySizes) {
	/*
	 @example
	 <blockquote class="lazyload" data-twitter="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">Nothing Twitter is doing is working <a href="https://t.co/s0FppnacwK">https://t.co/s0FppnacwK</a> <a href="https://t.co/GK9MRfQkYO">pic.twitter.com/GK9MRfQkYO</a></p>&mdash; The Verge (@verge) <a href="https://twitter.com/verge/status/725096763972001794">April 26, 2016</a></blockquote>

	 <a class="lazyload"
	 data-twitter="twitter-timeline"
	 data-widget-id="600720083413962752"
	 href="https://twitter.com/TwitterDev"
	 width="300"
	 height="300">
	 Tweets by @TwitterDev
	 </a>
	 */
	'use strict';
	var scriptadded;

	function loadExecuteTwitter(){
		if(window.twttr && twttr.widgets){
			twttr.widgets.load();
			return;
		}

		if(scriptadded){
			return;
		}

		var elem = document.createElement('script');
		var insertElem = document.getElementsByTagName('script')[0];

		elem.src = '//platform.twitter.com/widgets.js';

		scriptadded = true;
		insertElem.parentNode.insertBefore(elem, insertElem);
	}

	document.addEventListener('lazybeforeunveil', function(e){
		if(e.detail.instance != lazySizes){return;}

		var twttrWidget = e.target.getAttribute('data-twitter');

		if(twttrWidget){
			lazySizes.aC(e.target, twttrWidget);
			loadExecuteTwitter();
		}
	});

}));
