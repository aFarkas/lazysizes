var createBeforeEach = function(params){
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

var createPicture = function($, srces){
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
