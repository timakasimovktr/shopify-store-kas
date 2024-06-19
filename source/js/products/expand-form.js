// Expand quick add form
const $btnExpandForm = $('.js-expand-form');
const $product = $('.product');

$btnExpandForm.on('click', function(event) {
  event.preventDefault();

  // check if only one variant
  if($(this).next().find('input[type="radio"]').length == 1) {
    $(this)
      .addClass('is-hidden');

    var oneVariant = $(this).next().find('input[type="radio"]')[0];
    $(oneVariant).trigger('click');
  } else {
    $(this)
      .addClass('is-hidden')
      .next()
      .addClass('is-expanded');
  }
});
