$(document).ready(function() {
  if ($('.banner').length > 0) {
    $('.banner').click(function() {
      if (typeof $(this).attr('data-link') != 'undefined') {
        location.href=$(this).attr('data-link');
      }
    });
  }

  adjustBannersHeight();
});

var productHeight = 0;

$(window).resize(function() {
  adjustBannersHeight();
});

function adjustBannersHeight() {
  if (($('.products').length > 0) && ($('.products .product').length > 0) && ($('.banner').length > 0)) {
    productHeight = $('.products .product .product__image').height();
    $('.banner').each(function(index, template) {
      if ($(window).width() > 767) {
        $(template).css('height', productHeight + "px");
      } else {
        $(template).css('height', (productHeight * 0.9) + "px");
      }
    });
  }
}