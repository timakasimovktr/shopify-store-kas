var _timeOut = setInterval(function(){ 
	if($('.spr-badge-caption').length) {
		let text = $('.spr-badge-caption').text();
		if(text != "No reviews") {
			$('.section__content .rating').show();
		}

		clearInterval(_timeOut);
	}
}, 1000);