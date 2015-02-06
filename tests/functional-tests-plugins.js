$.extend(window.lazyTests, {
	optimumxPictureResize: ['lazyloads constraints srcset on picture', function(assert){
		var done = assert.async();
		var $iframe = this.$iframe;

		this.promise.always(function($, frameWindow){
			var viewport;
			var $picture = createPicture($, [
				{
					'data-srcset': 'data:lazysource150 150w, data:lazysource100 100w, data:lazysource280 280w',
					media: '(min-width: 0.5em)'
				},
				{
					'data-srcset': 'data:lazyimg100 100w, data:lazyimg200 200w, data:lazyimg150 150w',
					'data-optimumx': '0.5',
					'data-sizes': 'auto',
					'class': 'lazyload'
				}
			]);
			var $source = $picture.find('source');
			var $image = $picture.find('img');
			var initialTest = function(){
				var haspolyfill = frameWindow.respimage || frameWindow.picturefill || (frameWindow.lazySizes.cfg.rias && frameWindow.lazySizes.pWS);
				var nowSrc = window.HTMLPictureElement || !haspolyfill ?
					'' : 'data:lazysource150';
				assert.equal($source.attr('srcset'), 'data:lazysource100 100w, data:lazysource150 150w');
				assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg100 100w, data:lazyimg150 150w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var endTest = function(){
				var haspolyfill = frameWindow.respimage || frameWindow.picturefill || (frameWindow.lazySizes.cfg.rias && frameWindow.lazySizes.pWS);
				var nowSrc = window.HTMLPictureElement || !haspolyfill ?
					'' : 'data:lazysource280';
				assert.equal($source.attr('srcset'), 'data:lazysource100 100w, data:lazysource150 150w, data:lazysource280 280w');
				assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg100 100w, data:lazyimg150 150w, data:lazyimg200 200w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var viewportTests = [
				['300', initialTest],
				['200', initialTest],
				['500', endTest]
			];
			var run = function(){
				if(viewportTests.length){
					viewport = viewportTests.shift();
					$iframe.css('width', viewport[0]);
				} else {
					done();
				}
			};

			if(!window.devicePixelRatio){
				assert.ok(true);
				done();
				return;
			}
			run();

			$picture.appendTo('body');

			assert.equal($source.attr('srcset'), null);
			assert.equal($image.attr('srcset'), null);

			$image.on('lazybeforesizes', function(e){
				setTimeout(function(){
					assert.equal($source.attr('src'), null);
					assert.equal($source.attr('data-src'), null);
					viewport[1]();
					run();
				}, 9);
			});

		});
	}],
	optimumxRiasPictureResize: ['lazyloads constraints rias generated srcset on picture', function(assert){
		var done = assert.async();
		var $iframe = this.$iframe;

		this.promise.always(function($, frameWindow){
			var viewport;
			var $picture = createPicture($, [
				{
					'data-srcset': 'data:lazysource{width}',
					media: '(min-width: 0.5em)'
				},
				{
					'data-srcset': 'data:lazyimg{width}',
					'data-optimumx': '0.5',
					'data-sizes': 'auto',
					'data-widths': '[100, 150, 280]',
					'class': 'lazyload'
				}
			]);
			var $source = $picture.find('source');
			var $image = $picture.find('img');
			var initialTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:lazysource150';
				assert.equal($source.attr('srcset'), 'data:lazysource100 100w, data:lazysource150 150w');
				assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg100 100w, data:lazyimg150 150w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var endTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:lazysource280';
				assert.equal($source.attr('srcset'), 'data:lazysource100 100w, data:lazysource150 150w, data:lazysource280 280w');
				assert.equal($image.attr('srcset') || $image.attr('data-risrcset') || $image.attr('data-pfsrcset'), 'data:lazyimg100 100w, data:lazyimg150 150w, data:lazyimg280 280w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var viewportTests = [
				['300', initialTest],
				['200', initialTest],
				['500', endTest]
			];
			var run = function(){
				if(viewportTests.length){
					viewport = viewportTests.shift();
					$iframe.css('width', viewport[0]);
				} else {
					done();
				}
			};

			if(!window.devicePixelRatio){
				assert.ok(true);
				done();
				return;
			}
			run();

			$picture.appendTo('body');

			assert.equal($source.attr('srcset'), null);
			assert.equal($image.attr('srcset'), null);

			$image.on('lazybeforesizes', function(e){
				setTimeout(function(){
					assert.equal($source.attr('src'), null);
					assert.equal($source.attr('data-src'), null);
					viewport[1]();
					run();
				}, 9);
			});

		});
	}],
	riasResize: ['lazysizes rias reacts on resize', function(assert){
		var done = assert.async();
		var $iframe = this.$iframe;

		this.promise.always(function($, frameWindow){
			var viewport, $image;
			var initTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:img-small-yo';
				assert.equal($image.attr('srcset'), 'data:img-1-yo 1w, data:img-small-yo 500w, data:img-large-yo 1200w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var largerTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:img-large-yo';
				assert.equal($image.attr('srcset'), 'data:img-1-yo 1w, data:img-small-yo 500w, data:img-large-yo 1200w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var viewportTests = [
				['300', initTest],
				['400', initTest],
				['1200', largerTest],
				['600', largerTest]
			];
			var run = function(){
				if(viewportTests.length){
					viewport = viewportTests.shift();
					$iframe.css('width', viewport[0]);
				} else {
					done();
				}
			};
			run();

			frameWindow.document.addEventListener('lazyriasmodifyoptions', function(e){
				// change available widths and widthmap for .special-widths elements
				e.details.widthmap = {
					500: 'small',
					1200: 'large'
				};

				//add new custom property with value 'foo'
				e.details.foo = 'yo';
			});

			$image = $('<div style="width: 100%;">' +
			'<img data-sizes="auto" style="width: 90%;" data-widths="[1, 500, 1200]" data-src="data:img-{width}-{foo}" class="lazyload" />' +
			'</div>')
				.appendTo('body')
				.find('img');

			$image.on('lazybeforesizes', function(e){
				setTimeout(function(){
					viewport[1]();
					run();
				}, 9);
			});
		});
	}],
	riasPictureResize: ['lazysizes rias reacts on resize and allows art direction', function(assert){
		var done = assert.async();
		var $iframe = this.$iframe;

		this.promise.always(function($, frameWindow){
			var viewport;
			var initTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:lazysource780';
				assert.equal($image.attr('srcset'), 'data:lazyimg780 780w, data:lazyimg1300 1300w');
				assert.equal($source.attr('srcset'), 'data:lazysource780 780w, data:lazysource1300 1300w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var largerTest = function(){
				var nowSrc = window.HTMLPictureElement ?
					'' : 'data:lazyimg1300';
				assert.equal($image.attr('srcset'), 'data:lazyimg780 780w, data:lazyimg1300 1300w');
				assert.equal($source.attr('srcset'), 'data:lazysource780 780w, data:lazysource1300 1300w');
				assert.equal($image.prop('src'), nowSrc);
			};
			var viewportTests = [
				['300', initTest],
				['400', initTest],
				['1200', largerTest],
				['520', largerTest],
				['450', initTest]
			];
			var run = function(){
				if(viewportTests.length){
					viewport = viewportTests.shift();
					$iframe.css('width', viewport[0]);
				} else {
					done();
				}
			};
			var $picture = createPicture($, [
				{
					'data-srcset': 'data:lazysource{width}',
					media: '(max-width: 500px)'
				},
				{
					'data-srcset': 'data:lazyimg{width}',
					'data-sizes': 'auto',
					'data-widths': '[780, 1300]',
					'class': 'lazyload'
				}
			]);
			var $source = $picture.find('source');
			var $image = $picture.find('img');

			run();


			$picture.appendTo('body');

			$image.on('lazybeforesizes', function(e){
				setTimeout(function(){
					viewport[1]();
					run();
				}, 9);
			});
		});
	}],
	riasReinit: ['lazysizes rias can be re-initialized', function(assert){
		var done = assert.async();

		this.promise.always(function($, frameWindow){
			var placeholderSrc, $image;
			var initTest = function(){
				var success = [
					{
						u: 'data:img1-1',
						w: 1,
						c: 'data:img1-1 1w'
					},
					{
						u: 'data:img1-500',
						w: 500,
						c: 'data:img1-500 500w'
					},
					{
						u: 'data:img1-1200',
						w: 1200,
						c: 'data:img1-1200 1200w'
					}
				];
				assert.propEqual($image.prop('_lazyrias'), success);
				assert.equal($image.attr('srcset'), 'data:img1-1 1w, data:img1-500 500w, data:img1-1200 1200w');
			};
			var reinitTest = function(){
				var success = [
					{
						u: 'data:img2-1',
						w: 1,
						c: 'data:img2-1 1w'
					},
					{
						u: 'data:img2-500',
						w: 500,
						c: 'data:img2-500 500w'
					},
					{
						u: 'data:img2-1200',
						w: 1200,
						c: 'data:img2-1200 1200w'
					}
				];
				assert.propEqual($image.prop('_lazyrias'), success);
				assert.equal($image.attr('srcset'), 'data:img2-1 1w, data:img2-500 500w, data:img2-1200 1200w');
			};
			var test = [
				['data:img1-{width}', initTest],
				['data:img2-{width}', reinitTest]
			];
			var run = function(){
				if(test.length){
					placeholderSrc = test.shift();

					if(window.isTrident){
						$image.addClass('lazyerror');
					}

					$image
						.attr('data-src', placeholderSrc[0])
						.addClass('lazyload')
					;
				} else {
					done();
				}
			};
			$image = $('<img data-sizes="auto" style="width: 90%;" data-widths="[1, 500, 1200]" class="lazyload" />');

			$image.on('lazybeforeunveil', function(e){
				setTimeout(function(){
					placeholderSrc[1]();
					run();
				}, 9);
			});

			$image.appendTo('body');

			run();
		});
	}],
	optimumxReinit: ['lazysizes optimumx can be re-initialized', function(assert){

		if(!window.devicePixelRatio){
			assert.ok(true);
			return;
		}
		var done = assert.async();

		this.promise.always(function($){
			var placeholderSrc, $image;
			var initTest = function(){
				var success = [
					{
						u: 'data:img1-5000',
						w: 5000,
						c: 'data:img1-5000 5000w'
					},
					{
						u: 'data:img1-50000',
						w: 50000,
						c: 'data:img1-50000 50000w'
					},
					{
						u: 'data:img1-500000',
						w: 500000,
						c: 'data:img1-500000 500000w'
					}
				];
				assert.propEqual($image.prop('_lazyOptimumx').cands, success);
				assert.equal($image.prop('_lazyOptimumx').cSrcset.length, 1);
				assert.equal($image.prop('_lazyOptimumx').cSrcset[0], 'data:img1-5000 5000w');
				assert.equal($image.attr('srcset'), 'data:img1-5000 5000w');
			};
			var reinitTest = function(){
				var success = [
					{
						u: 'data:img2-50',
						w: 50,
						c: 'data:img2-50 50w'
					},
					{
						u: 'data:img2-100',
						w: 100,
						c: 'data:img2-100 100w'
					},
					{
						u: 'data:img2-500000',
						w: 500000,
						c: 'data:img2-500000 500000w'
					}
				];
				assert.propEqual($image.prop('_lazyOptimumx').cands, success);
				assert.equal($image.prop('_lazyOptimumx').cSrcset.length, 2);
				assert.equal($image.prop('_lazyOptimumx').cSrcset[0], 'data:img2-50 50w');
				assert.equal($image.prop('_lazyOptimumx').cSrcset[1], 'data:img2-100 100w');
				assert.equal($image.attr('srcset'), 'data:img2-50 50w, data:img2-100 100w');
			};
			var test = [
				['data:img1-50000 50000w, data:img1-5000 5000w, data:img1-500000 500000w', initTest],
				['data:img2-100 100w, data:img2-500000 500000w, data:img2-50 50w', reinitTest]
			];
			var run = function(){
				if(test.length){
					placeholderSrc = test.shift();
					$image
						.attr('data-srcset', placeholderSrc[0])
						.attr('data-optimumx', '0.6')
						.addClass('lazyload')
					;
				} else {
					done();
				}
			};


			$image = $('<img data-sizes="auto" style="width: 90%;" data-optimumx="0.6" class="lazyload" />')
				.appendTo('body')
			;

			run();

			$image.on('lazybeforeunveil', function(e){
				setTimeout(function(){
					placeholderSrc[1]();
					run();
				}, 9);
			});
		});
	}],
	riasAutoSizes: ['lazysizes rias works with autosizes simple sizes', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var $image;



			$image = $('<img data-sizes="auto" style="width: 100%;" data-widths="[900, 1200]" class="lazyload" />')
				.attr('data-src', 'data:image-{width}')
				.appendTo('body')
			;

			$image.on('lazybeforeunveil', function(e){
				setTimeout(function(){
					assert.equal($image.prop('currentSrc') || $image.attr('src'), 'data:image-900');
					done();
				}, 9);
			});
		});
	}],
	riasSimpleSizes: ['lazysizes rias works with simple sizes', function(assert){
		var done = assert.async();

		this.promise.always(function($){
			var $image;



			$image = $('<img data-sizes="1200px" style="width: 100%;" data-widths="[300, 500, 1200]" class="lazyload" />')
				.attr('data-src', 'data:image-{width}')
				.appendTo('body')
			;

			$image.on('lazybeforeunveil', function(e){
				setTimeout(function(){
					assert.equal($image.prop('currentSrc') || $image.attr('src'), 'data:image-1200');
					done();
				}, 9);
			});
		});
	}]
});


QUnit.module( "optimumx", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.optimumxPictureResize);
QUnit.test.apply(QUnit, lazyTests.simplePicture);
QUnit.test.apply(QUnit, lazyTests.optimumxReinit);

QUnit.module( "optimumx + respimage + respmutation", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx']
		},
		{
			libs: ['respimage', 'respmutation']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.optimumxPictureResize);

QUnit.module( "optimumx + rias", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.optimumxPictureResize);
QUnit.test.apply(QUnit, lazyTests.optimumxRiasPictureResize);
QUnit.test.apply(QUnit, lazyTests.riasResize);
QUnit.test.apply(QUnit, lazyTests.riasPictureResize);
QUnit.test.apply(QUnit, lazyTests.simplePicture);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizesPicture);
QUnit.test.apply(QUnit, lazyTests.riasReinit);
QUnit.test.apply(QUnit, lazyTests.riasSimpleSizes);
QUnit.test.apply(QUnit, lazyTests.riasAutoSizes);

QUnit.module( "optimumx + rias + respimage", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		},
		{
			libs: ['respimage']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.optimumxPictureResize);
QUnit.test.apply(QUnit, lazyTests.riasResize);
QUnit.test.apply(QUnit, lazyTests.riasPictureResize);
QUnit.test.apply(QUnit, lazyTests.simpleAutoSizesPicture);
QUnit.test.apply(QUnit, lazyTests.riasReinit);
QUnit.test.apply(QUnit, lazyTests.riasSimpleSizes);
QUnit.test.apply(QUnit, lazyTests.riasAutoSizes);

QUnit.module( "rias", {
	beforeEach: createBeforeEach(
		{
			plugins: ['rias']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.riasResize);
QUnit.test.apply(QUnit, lazyTests.riasPictureResize);
QUnit.test.apply(QUnit, lazyTests.simplePicture);
QUnit.test.apply(QUnit, lazyTests.riasReinit);
QUnit.test.apply(QUnit, lazyTests.riasSimpleSizes);
QUnit.test.apply(QUnit, lazyTests.riasAutoSizes);

QUnit.module( "rias + respimage", {
	beforeEach: createBeforeEach(
		{
			plugins: ['optimumx', 'rias']
		},
		{
			libs: ['respimage']
		}
	)
});
QUnit.test.apply(QUnit, lazyTests.riasResize);
QUnit.test.apply(QUnit, lazyTests.riasPictureResize);
QUnit.test.apply(QUnit, lazyTests.riasReinit);
QUnit.test.apply(QUnit, lazyTests.riasSimpleSizes);
QUnit.test.apply(QUnit, lazyTests.riasAutoSizes);
