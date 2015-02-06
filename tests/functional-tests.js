window.isTrident = /rident/.test(navigator.userAgent);
window.lazyTests = {
	simpleView: ['lazyloads simple image in view', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var initialSrc = 'data:initial';
			var lazySrc = 'data:lazysrc';
			var $topImage = $('<img />')
					.attr({
						src: initialSrc,
						'data-src': lazySrc,
						'class': 'lazyload'
					}).appendTo('body')
				;

			assert.equal($topImage.attr('src'), initialSrc);

			setTimeout(function(){
				assert.equal($topImage.attr('src'), lazySrc);
				done();
			}, 70);
		});
	}],
	simpleScrollView: ['lazyloads simple image after it scrolls near to view', function(assert){
		if(/mobi/i.test(navigator.userAgent)){
			assert.ok(true);
			return;
		}
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var initialSrc = 'data:initial';
			var lazySrc = 'data:lazysrc';
			var $topImage = $('<img />')
					.attr({
						src: initialSrc,
						'data-src': lazySrc,
						'class': 'lazyload'
					})
					.css({
						position: 'absolute',
						top: 999
					})
					.appendTo('body')
				;

			assert.equal($topImage.attr('src'), initialSrc);

			setTimeout(function(){
				assert.equal($topImage.attr('src'), initialSrc);
			}, 70);

			setTimeout(function(){
				$(frameWindow).scrollTop(900);
			}, 70);
			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					assert.equal($topImage.attr('src'), lazySrc);
					done();
				}, 9);
			});
		});
	}],
	simpleAnimateView: ['lazyloads simple image after it animates near to view', function(assert){
		if(/mobi/i.test(navigator.userAgent)){
			assert.ok(true);
			return;
		}
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var initialSrc = 'data:initial';
			var lazySrc = 'data:lazysrc';
			var $topImage = $('<img />')
					.attr({
						src: initialSrc,
						'data-src': lazySrc,
						'class': 'lazyload'
					})
					.css({
						position: 'absolute',
						top: 999
					})
					.appendTo('body')
				;

			assert.equal($topImage.attr('src'), initialSrc);

			setTimeout(function(){
				assert.equal($topImage.attr('src'), initialSrc);
			}, 70);

			setTimeout(function(){
				$topImage.animate({top: 0}, {duration: 50});
			}, 70);

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					assert.equal($topImage.attr('src'), lazySrc);
					done();
				}, 9);
			});
		});
	}],
	simpleAutoSizes: ['takes width of image and adds it to the sizes attribute', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var $topImage = $('<div style="width: 200px;">' +
			'<img data-sizes="auto" style="width: 50%;" class="lazyload" />' +
			'</div>')
				.appendTo('body')
				.find('img');

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					assert.equal($topImage.attr('sizes'), '100px');
					done();
				}, 9);
			});
		});
	}],
	autoSizesEvent: ['lazybeforesizes event allows modifying sizes attribute', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var $topImage = $('<div style="width: 200px;">' +
			'<img data-sizes="auto" style="width: 50%;" class="lazyload" />' +
			'</div>')
				.appendTo('body')
				.find('img');

			$topImage.on('lazybeforesizes', function(e){
				e.originalEvent.details.width = 12;
				setTimeout(function(){
					assert.equal($topImage.attr('sizes'), '12px');
					done();
				}, 9);
			});
		});
	}],
	autoSizesResize: ['lazysizes reacts on resize', function(assert){
		var done = assert.async();
		var $iframe = this.$iframe;

		this.promise.always(function($, frameWindow){
			var viewport;
			var $topImage;
			var respimgCalls = 0;
			var repimgExpectedCalls = window.HTMLPictureElement ?
				0 : 3;

			var viewportTests = [
				['300', 150],
				['400', 200],
				['200', 100],
				['400', 200]
			];
			var run = function(){
				if(viewportTests.length){
					viewport = viewportTests.shift();
					$iframe.css('width', viewport[0]);
				} else {
					setTimeout(function(){
						assert.equal(respimgCalls, repimgExpectedCalls);
						done();
					}, 90);
				}
			};
			run();

			frameWindow.respimage = function(){
				respimgCalls++;
			};
			frameWindow.picturefill = function(){
				respimgCalls++;
			};

			$topImage = $('<div style="width: 100%;">' +
			'<img data-sizes="auto" style="width: 50%;" class="lazyload" />' +
			'</div>')
				.appendTo('body')
				.find('img');

			$topImage.on('lazybeforesizes', function(e){
				setTimeout(function(){
					assert.equal($topImage.attr('sizes'), viewport[1]+'px');
					run();
				}, 9);
			});
		});
	}],
	parentAutoSizes: ['takes width of parent of image and adds it to the sizes attribute2', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var $topImage = $('<div style="width: 200px; min-width: 200px;">' +
			'<img data-sizes="auto" style="width: 1px; display: inline; margin: 5px;" class="lazyload" alt="" />' +
			'</div>').find('img');

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					assert.equal($topImage.attr('sizes'), '200px');
					done();
				}, 9);
			});
			$topImage.parent().appendTo('body');
		});
	}],
	simplePicture: ['lazyloads srcset on picture', function(assert){
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var $picture = createPicture($, [
				{
					'data-srcset': 'data:lazysource 200w'
				},
				{
					'data-srcset': 'data:lazyimg 200w',
					'class': 'lazyload'
				}
			]);
			var $source = $picture.find('source');
			var $image = $picture.find('img');

			$picture.appendTo('body');

			assert.equal($source.attr('srcset'), null);
			assert.equal($image.attr('srcset'), null);

			$image.on('lazybeforeunveil', function(){
				setTimeout(function(){

					assert.equal($source.attr('srcset'), 'data:lazysource 200w');
					assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg 200w');
					assert.equal($image.prop('src'), window.HTMLPictureElement || !frameWindow.respimage ?  '' : 'data:lazysource');
					done();
				}, 9);
			});
		});
	}],
	simpleAutoSizesPicture: ['lazyloads srcset on picture', function(assert){
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var lazySrcset = 'data:lazysrcset 300w';
			var $picture = createPicture($, [
				{
					'data-srcset': 'data:lazysource 200w'
				},
				{
					'data-srcset': 'data:lazyimg 200w',
					'class': 'lazyload',
					'data-sizes': 'auto'
				}
			]);
			var $source = $picture.find('source');
			var $image = $picture.find('img');

			$picture.appendTo('body');

			assert.equal($source.attr('srcset'), null);
			assert.equal($image.attr('srcset'), null);
			assert.equal($image.attr('sizes'), null);

			$image.on('lazybeforeunveil', function(){
				setTimeout(function(){
					var haspolyfill = frameWindow.respimage || frameWindow.picturefill || (frameWindow.lazySizes.cfg.rias && frameWindow.lazySizes.pWS);

					assert.equal($source.attr('srcset'), 'data:lazysource 200w');
					assert.equal($source.attr('sizes'), $image.attr('sizes'));
					assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg 200w');
					assert.equal($image.prop('src'), window.HTMLPictureElement || !haspolyfill ?  '' : 'data:lazysource');
					assert.equal($image.attr('sizes'), '300px');
					done();
				}, 9);
			});
		});
	}],
	simpleSrcset: ['lazyloads srcset', function(assert){
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var initialSrc = 'data:initial';
			var lazySrcset = 'data:lazysrcset 300w';
			var $topImage = $('<img />')
					.attr({
						src: initialSrc,
						'data-srcset': lazySrcset,
						'class': 'lazyload'
					}).appendTo('body')
				;

			assert.equal($topImage.attr('src'), initialSrc);
			assert.equal($topImage.attr('srcset'), null);

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					var nowSrc =  window.HTMLPictureElement || !(frameWindow.respimage || frameWindow.picturefill) ?
						initialSrc :
						'data:lazysrcset';

					assert.equal($topImage.attr('srcset') || $topImage.attr('data-risrcset') || $topImage.attr('data-pfsrcset'), lazySrcset);
					assert.equal($topImage.prop('src'), nowSrc);
					done();
				}, 9);
			});
		});
	}],
	simpleSrcsetSrc: ['lazyloads srcset or src', function(assert){
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var initialSrc = 'data:initial';
			var lazySrcset = 'data:lazysrcset 300w';
			var lazySrc = 'data:lazysrc';
			var $topImage = $('<img />')
					.attr({
						src: initialSrc,
						'data-srcset': lazySrcset,
						'data-src': lazySrc,
						'class': 'lazyload'
					}).appendTo('body')
				;

			assert.equal($topImage.prop('src'), initialSrc);
			assert.equal($topImage.attr('srcset'), null);

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					var nowSrc =  window.HTMLPictureElement ?
						initialSrc :
						(frameWindow.respimage || frameWindow.picturefill) ?
							'data:lazysrcset' :
							lazySrc;

					assert.equal($topImage.attr('srcset') || $topImage.attr('data-risrcset') || $topImage.attr('data-pfsrcset'), lazySrcset);
					assert.equal($topImage.prop('src'), nowSrc);
					done();
				}, 9);
			});
		});
	}],
	nestedOverflow: ['lazyload detects nested overflow with [data-expand]', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var initialSrc = 'data:initial';
			var lazySrc = 'data:lazysrc';
			var $topImage = $('<div style="position: relative; overflow: scroll; height: 40px;">' +
				'<img /></div>')
					.appendTo('body')
					.find('img')
					.attr({
						src: initialSrc,
						'data-src': lazySrc,
						'class': 'lazyload',
						'data-expand': -1,
						style: 'position: relative; top: 100px;'
					})
				;

			assert.equal($topImage.prop('src'), initialSrc);

			setTimeout(function(){
				assert.equal($topImage.prop('src'), initialSrc);
				$topImage.css({top: 50});
			}, 70);
			setTimeout(function(){
				assert.equal($topImage.prop('src'), initialSrc);
				$topImage.css({top: 0});
			}, 140);

			$topImage.on('lazybeforeunveil', function(){
				setTimeout(function(){
					assert.equal($topImage.prop('src'), lazySrc);
					done();
				});
			});
		});
	}]
};


QUnit.module( "clean lazySizes", {
	beforeEach: createBeforeEach()
});
QUnit.test.apply(QUnit, lazyTests.simpleView);
QUnit.test.apply(QUnit, lazyTests.simpleScrollView);
QUnit.test.apply(QUnit, lazyTests.simpleAnimateView);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizes);
QUnit.test.apply(QUnit, lazyTests.parentAutoSizes);
QUnit.test.apply(QUnit, lazyTests.simpleSrcset);
QUnit.test.apply(QUnit, lazyTests.simpleSrcsetSrc);
QUnit.test.apply(QUnit, lazyTests.nestedOverflow);
QUnit.test.apply(QUnit, lazyTests.autoSizesEvent);
QUnit.test.apply(QUnit, lazyTests.autoSizesResize);
QUnit.test.apply(QUnit, lazyTests.simplePicture);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizesPicture);


QUnit.module( "lazySizes with respimage", {
	beforeEach: createBeforeEach({libs: ['respimage']})
});
QUnit.test.apply(QUnit, lazyTests.simpleView);
QUnit.test.apply(QUnit, lazyTests.simpleScrollView);
QUnit.test.apply(QUnit, lazyTests.simpleSrcset);
QUnit.test.apply(QUnit, lazyTests.simpleSrcsetSrc);
QUnit.test.apply(QUnit, lazyTests.autoSizesResize);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizesPicture);


QUnit.module( "lazySizes + options + respimage + respmutation", {
	beforeEach: createBeforeEach({libs: ['respimage', 'respmutation']})
});
QUnit.test.apply(QUnit, lazyTests.simpleView);
QUnit.test.apply(QUnit, lazyTests.simpleScrollView);
QUnit.test.apply(QUnit, lazyTests.simpleSrcset);
QUnit.test.apply(QUnit, lazyTests.simpleSrcsetSrc);
QUnit.test.apply(QUnit, lazyTests.autoSizesEvent);
QUnit.test.apply(QUnit, lazyTests.autoSizesResize);
QUnit.test.apply(QUnit, lazyTests.simplePicture);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizesPicture);

