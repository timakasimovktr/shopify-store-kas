// Append banners in products

const $win = $(window);
const $products = $('.products');
const $banners = $('.banners .banner[data-insert-after]');
var $examProduct = $('.section-collections.banners-adjust .products .product .product__image .product__image-inner');
var $adjustBanners = $('.section-collections.banners-adjust .products .banner');
var normalHeight = 0;

$win.on('load', function() {
  var isChanged = isReseted();
  $banners.each(function(index) {
    const $this = $(this);
    const insertAfter = parseInt($this.data('insert-after'));
    var order_no = insertAfter + 1;

    $this.css('order', order_no);

    if(insertAfter == 0) {
      $this.insertBefore($products.find(`.product:nth-child(${order_no})`));
    } else {
      $this.insertAfter($products.find(`.product:nth-child(${insertAfter})`));
    }

    if (isChanged) {
      $banners.show();
    } else {
      $banners.hide();
    }
  });
  adjustBanner();
});

$win.on('resize', function() {
  adjustBanner();
});

  function adjustBanner() {
    $examProduct = $('.section-collections.banners-adjust .products .product .product__image .product__image-inner');
    $adjustBanners = $('.section-collections.banners-adjust .products .banner');
    if (($examProduct.length > 0) && ($adjustBanners.length > 0)) {
      adjustBannerHeight($examProduct, $adjustBanners);
    }
  }

/* Adjust Collection Banner Height */
  function adjustBannerHeight($examProduct, $adjustBanners) {
    $examProduct.each(function(index, template) {
      if ($(template).height() != 0) {
        normalHeight = $(template).height();
      }
    });

    if (normalHeight != 0) {
      $adjustBanners.each(function(index, banner) {
        $(banner).outerHeight(normalHeight);
      });
    }
  }
function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function isReseted() {
  if(
    getUrlParameter('colorFilter') == '' &&
    getUrlParameter('sizeFilter') == '' &&
    getUrlParameter('materialFilter') == '' &&
    getUrlParameter('fabricFilter') == '' &&
    getUrlParameter('weightFilter') == '' &&
    getUrlParameter('styleFilter') == ''
  ) {
    return true;
  } else {
    return false;
  }
}