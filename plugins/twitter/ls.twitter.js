(function(){
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
		var twttrWidget = e.target.getAttribute('data-twitter');

		if(twttrWidget){
			lazySizes.aC(e.target, twttrWidget);
			loadExecuteTwitter();
		}
	});

})();
