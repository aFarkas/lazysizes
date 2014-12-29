(function(window, document){

	if ( window.HTMLPictureElement ) {
		$('html').addClass('resp-supported');
	}

	if ( (window.devicePixelRatio || 1) < 1.4 ) {
		$('html').addClass('no-retina');
	}

	webshim.setOptions('forms-ext', {
		replaceUI: 'auto'
	});


	webshim.polyfill('forms forms-ext');


	$(function(){
		var oninput;

		$('#vw-input')
			.on('change.smooth-vwchange', function(){
				oninput = $.prop(this, 'checked');
			})
			.trigger('change.smooth-vwchange')
		;
		$('#viewport').each(function(){
			var onChange = function(e){
				if (!e || (oninput && e.type == 'input') || (e.type == 'change' && !oninput)){
					var val = $(this).val();
					$('#arena').width(val+'%');
				}
			};
			$(this).on('input change', onChange).each(onChange);
		});
		$('#arena').removeAttr('src').prop('src', 'javascript:false');



		$('.arena-config')
			.on('submit', function(){
				var data = $(this).serialize();
				$('#arena').prop('src', 'child.html?' + data);
				return false;
			})
		;

		$('.btn-optimum').on('click', function(){
			$('#arena').prop('src', 'child.html?'+ (new Date().getTime()));
			return false;
		});
		$('.btn-auto').on('click', function(){
			$('#arena').prop('src', 'child.html?optimumx=auto');
			return false;
		});
		$('#arena').prop('src', 'child.html');
	})

})(window, document);
