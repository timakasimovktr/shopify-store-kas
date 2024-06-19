// Close popup

const $closeElement = $('.js-close-popup');

$closeElement.on('click', function(event) {
	event.preventDefault();

	$(this)
		.closest('.popup')
		.removeClass('is-expanded');

	$('body').css({'overflow': 'auto', 'position': 'initial'});
});
