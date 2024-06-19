const $link = $('.link-zoom');
const $zoomIcon = $('.link-zoom > span');
const $win = $(window);

// For use within normal web clients 
var isiPad = navigator.userAgent.match(/iPad/i) != null;

$link.on('click', function(event) {
  event.preventDefault();
});

if ($win.width() > 767 && !isiPad) {
  $link.zoom({
    on: 'click'
    // onZoomIn: function() {
    //   if ($win.width() < 768) {
    //     $('.js-slider-images').slick('slickPause');
    //   }
    // },
    // onZoomOut: function() {
    //   if ($win.width() < 768) {
    //     $('.js-slider-images').slick('slickPlay');
    //   }
    // }
  });
}

$zoomIcon.on('click', function(event) {
  event.preventDefault();

  if ($win.width() < 768 || isiPad) {
    var productImageSource = $(this).parent().find('img').data('original-src');
    var productImageWidth = $(this).parent().find('img').data('original-width');
    var productImageHeight = $(this).parent().find('img').data('original-height');

    var productOverlay = $('.slider-zoom-popup');
    var productOverlayImage = $('.slider-zoom-popup img');
    productOverlayImage.attr('src', productImageSource).css('width', productImageWidth + 'px');
    productOverlay.fadeIn(100);
    $('.slider-zoom-popup-close').show();
    $('body').css('overflow', 'hidden');

    var scrolltoLeft = $(productOverlayImage).offset().left + (productImageWidth / 2) - ($win.width() / 2);
    var scrolltoTop = $(productOverlay).offset().top + (productImageHeight / 2) - ($win.height() / 2);
    $(productOverlay).animate({ scrollLeft:  scrolltoLeft, scrollTop:  scrolltoTop}, 500);

    $('.slider-zoom-popup-close').click(function () {
        $(productOverlay).animate({ scrollLeft:  0, scrollTop:  0}, 50);
        productOverlay.fadeOut(100);
        $(this).hide();
        $('body').css('overflow', 'auto');
    });
  }
});