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
		define(['lazysizes'], factory);
	} else if(window.lazySizes) {
		globalInstall();
	} else {
		window.addEventListener('lazyunveilread', globalInstall, true);
	}
}(typeof window != 'undefined' ?
	window : 0, function(window, document, lazySizes) {
	/*jshint eqnull:true */
	'use strict';
	if(!document.getElementsByClassName){return;}
	var protocol = location.protocol == 'https:' ?
		'https:' :
		'http:'
	;
	var idIndex = Date.now();
	var regId = /\{\{id}}/;
	var regYtImg = /\{\{hqdefault}}/;
	var regAmp = /^&/;
	var regValidParam = /^[a-z0-9-_&=]+$/i;
	var youtubeImg = protocol + '//img.youtube.com/vi/{{id}}/{{hqdefault}}.jpg';
	var youtubeIframe = protocol + '//www.youtube.com/embed/{{id}}?autoplay=1';
	var vimeoApi = protocol + '//vimeo.com/api/oembed.json?url=https%3A//vimeo.com/{{id}}';
	var vimeoIframe = protocol + '//player.vimeo.com/video/{{id}}?autoplay=1';

	function getJSON(url, callback){
		var id = 'vimeoCallback' + idIndex;
		var script = document.createElement('script');
		url += '&callback='+id;

		idIndex++;

		window[id] = function(data){
			script.parentNode.removeChild(script);
			delete window[id];
			callback(data);
		};

		script.src = url;

		document.head.appendChild(script);
	}

	function embedVimeoImg(id, elem){
		getJSON(vimeoApi.replace(regId, id), function(data){
			if(data && data.thumbnail_url){
				elem.style.backgroundImage = 'url('+ data.thumbnail_url +')';
			}
		});
		elem.addEventListener('click', embedVimeoIframe);
	}

	function embedVimeoIframe(e){
		var elem = e.currentTarget;
		var id = elem.getAttribute('data-vimeo');
		var vimeoParams = elem.getAttribute('data-vimeoparams') || '';

		elem.removeEventListener('click', embedVimeoIframe);

		if (!id || !regValidParam.test(id) || (vimeoParams && !regValidParam.test(vimeoParams))) {
			return;
		}

		if(vimeoParams && !regAmp.test(vimeoParams)){
			vimeoParams = '&'+ vimeoParams;
		}

		e.preventDefault();

		elem.innerHTML = '<iframe src="' + (vimeoIframe.replace(regId, id)) + vimeoParams +'" ' +
			'frameborder="0" allowfullscreen="" width="640" height="390"></iframe>'
		;

	}

	function embedYoutubeImg(id, elem){
		var ytImg = elem.getAttribute('data-thumb-size') || lazySizes.cfg.ytThumb || 'hqdefault';

		elem.style.backgroundImage = 'url('+ youtubeImg.replace(regId, id).replace(regYtImg, ytImg) +')';
		elem.addEventListener('click', embedYoutubeIframe);
	}

	function embedYoutubeIframe(e){
		var elem = e.currentTarget;
		var id = elem.getAttribute('data-youtube');
		var youtubeParams = elem.getAttribute('data-ytparams') || '';

		elem.removeEventListener('click', embedYoutubeIframe);

		if (!id || !regValidParam.test(id) || (youtubeParams && !regValidParam.test(youtubeParams))) {
			return;
		}

		if(youtubeParams && !regAmp.test(youtubeParams)){
			youtubeParams = '&'+ youtubeParams;
		}

		e.preventDefault();

		elem.innerHTML = '<iframe src="' + (youtubeIframe.replace(regId, id)) + youtubeParams +'" ' +
			'frameborder="0" allowfullscreen="" width="640" height="390"></iframe>'
		;
	}

	document.addEventListener('lazybeforeunveil', function(e){
		if(e.detail.instance != lazySizes){return;}

		var elem = e.target;
		var youtube = elem.getAttribute('data-youtube');
		var vimeo = elem.getAttribute('data-vimeo');

		if(youtube && elem){
			embedYoutubeImg(youtube, elem);
		}
		if(vimeo && elem){
			embedVimeoImg(vimeo, elem);
		}
	});
}));
