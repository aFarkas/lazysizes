(function(){
	'use strict';
	var source = document.createElement('source');
	var requestAnimationFrame = window.requestAnimationFrame || setTimeout;
	window.createBeforeEach = function(params){
		params = $.param(params || {});
		return function(){
			var that = this;
			this.promise = $.Deferred();
			this.$iframe = $('#test-iframe');


			this.$iframe.css({width: 300, height: 300});

			this.$iframe.one('load', function(){
				that.promise.resolveWith(that, [that.$iframe.prop('contentWindow').jQuery, that.$iframe.prop('contentWindow')]);
			});

			this.$iframe.prop('src', 'test-files/content-file.html?'+params);
		};
	};

	window.createPicture = function($, srces){
		var $picture = $('<picture />');
		$.each(srces, function(i, attrs){
			var $elem;
			if(i >= srces.length -1){
				$elem = 'img';
			} else {
				$elem = 'source';
			}
			$elem = $('<' + $elem + '/>');
			$picture.append($elem);
			$elem.attr(attrs);
		});
		return $picture;
	};
	window.cleanUpDensity = function(ar){
		(ar || []).forEach(function(obj){
			if(obj.d){
				delete obj.d;
			}
			if(obj.cached){
				delete obj.cached;
			}
		});
		return ar;
	};

	window.isTrident = /rident/.test(navigator.userAgent);
	window.bustedSrcset = (('srcset' in document.createElement('img')) && !('sizes' in document.createElement('img')));
	window.supportsPicture = !window.bustedSrcset && window.HTMLPictureElement;
	window.afterUnveil = (function(){
		return function(fn, delay){
			setTimeout(function(){
				requestAnimationFrame(function(){
					setTimeout(fn,0);
				});
			}, delay || 9);
		};
	})();
})();
