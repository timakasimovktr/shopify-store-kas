import { initSlider } from './init-slider';

const $win = $(window);

// Default slider
const $sliderDefault = $('.js-slider');
const sliderDefaultOptions = {
  dots: true,
  arrows: false,
  infinite: true,
  autoplay: true,
  autoplaySpeed: 5000
};

initSlider($sliderDefault, sliderDefaultOptions);

// Slider center mode
const $sliderCenter = $('.js-slider-center');
const sliderCenterOptions = {
  centerMode: true,
  focusOnSelect: true,
  infinite: true,
  arrows: false,
  dots: false,
  draggable: false,
  slidesToShow: 1,
  initialSlide: 1,
  centerPadding: '22vw',
  responsive: [
    {
      breakpoint: 768,
      settings: {
        dots: true,
        autoplay: true,
        centerMode: false,
        infinite: true,
        focusOnSelect: false,
        autoplaySpeed: 5000,
        initialSlide: 0,
        centerPadding: '0'
      }
    }
  ]
};

initSlider($sliderCenter, sliderCenterOptions);

// Slider images

/**
 * Set new slide index
 * @param  { Object } $selector DOM Element - slider holder
 * @return { Void }
 */
function sliderIndexing($selector) {
  $selector.find('.slick-slide').each(function(index, slide) {
    $(slide).attr('data-slick-index', index);
  });

  var index = $('.slider__slide.slider__slide--default').length;

  $selector.slick('slickGoTo', 0, true);
}

const randomSlickId = Math.floor(Math.random() * 11000000);
const $sliderImages = $('.js-slider-images');
const $sliderThumbs = $('.js-slider-thumbs');
$sliderImages.attr('id', randomSlickId)
$sliderThumbs.data('slick-id', randomSlickId)

const sliderImagesOptionsDesktop = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: false,
  swipe: false,
  infinite: false,
  fade: true,
  asNavFor: '.js-slider-thumbs'
};

const sliderImagesOptionsMobile = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: true,
  infinite: true
};

const sliderImagesOptionsTablet = {
  slidesToShow: 1,
  slidesToScroll: 1,
  arrows: false,
  dots: false,
  infinite: true
};

// For use within normal web clients 
var isiPad = navigator.userAgent.match(/iPad/i) != null;

var sliderImagesOptions = sliderImagesOptionsDesktop;
if($win.width() < 768) {
  sliderImagesOptions = sliderImagesOptionsMobile;
} else if(isiPad) {
  sliderImagesOptions = sliderImagesOptionsTablet;
} else {
  sliderImagesOptions = sliderImagesOptionsDesktop;
}

const sliderThumbsOptions = {
  slidesToShow: 4,
  slidesToScroll: 1,
  arrows: true,
  dots: false,
  infinite: false,
  focusOnSelect: true,
  useTransform: false,
  asNavFor: '.js-slider-images'
};

initSlider($sliderImages, sliderImagesOptions);
initSlider($sliderThumbs, sliderThumbsOptions, true);

if (!$sliderImages.hasClass('js-slider-without-filter')) {
  var option_str = $sliderImages.data('color') + '-' + $sliderImages.data('size');
  // var color_size_customizer = option_str + '-customizer';
  var color_size_customizer = option_str;
  if($('.slider__slide.slider__slide--' + option_str).length > 0 || $('.slider__slide.slider__slide--' + color_size_customizer).length > 0) {
    $sliderImages.slick('slickFilter', $('.slider__slide.slider__slide--' + option_str + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_size_customizer).closest('.slick-slide'));
    $sliderThumbs.slick('slickFilter', $('.slider__slide.slider__slide--' + option_str + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_size_customizer).closest('.slick-slide'));
  } else {
    // var color_customizer = $sliderImages.data('color') + '-customizer';
    var color_customizer = $sliderImages.data('color');
    $sliderImages.slick('slickFilter', $('.slider__slide.slider__slide--' + $sliderImages.data('color') + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_customizer).closest('.slick-slide'));
    $sliderThumbs.slick('slickFilter', $('.slider__slide.slider__slide--' + $sliderImages.data('color') + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_customizer).closest('.slick-slide'));
  }

  sliderIndexing($sliderImages);
  sliderIndexing($sliderThumbs);
}

// Slider with products

let carouselPrev = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 16"><path d="M30.72,62.52l6.58,7.55a.39.39,0,0,0,.56,0l.6-.55a.42.42,0,0,0,0-.58L32.61,62.2l5.87-6.76a.42.42,0,0,0,0-.58l-.6-.55a.39.39,0,0,0-.56,0l-6.58,7.55a.45.45,0,0,0,0,.64Z" transform="translate(-30.58 -54.2)"></path></svg>';
let carouselNext = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 16"><path d="M8,8a.43.43,0,0,0-.13-.32L1.29.13a.39.39,0,0,0-.56,0L.13.66a.42.42,0,0,0,0,.58L6,8,.1,14.76a.42.42,0,0,0,0,.58l.6.55a.39.39,0,0,0,.56,0L7.87,8.32A.43.43,0,0,0,8,8Z"></path></svg>';

const $sliderProducts = $('.js-product-slider');
const sliderProductsOptions = {
  infinite: false,
  slidesToShow: 2,
  slidesToScroll: 1,
  arrows: false,
  focusOnSelect: true,
  dots: true,
  draggable: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        dots: false,
        arrows: true,
        prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">'+ carouselPrev +'</button>',
        nextArrow: '<button class="slick-next" aria-label="Next" type="button">'+ carouselNext +'</button>',
        slidesToShow: 2,
        slidesToScroll: 1
      }
    }
  ]
};

const $tabsSlider = $('.section-sellers .tabs__body .tab .products');
const tabsSliderOptions = {
  slidesToShow: 2,
  slidesToScroll: 1,
  arrows: false,
  dots: true,
  fade: true,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        dots: true,
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
}

let isMobile = false;

$win.on('load resize', function(event) {
  if ($win.width() < 768) {
    if (isMobile) {
      return;
    }

    initSlider($sliderProducts, sliderProductsOptions);
    $tabsSlider.each(function(index,element) {
      initSlider($(element), tabsSliderOptions);
      $(element).find('.product').removeClass('hidden-xs');
      $(element).slick('setPosition')
    });

    isMobile = true;
  } else {
    if (!isMobile) {
      return;
    }

    if ($sliderProducts.hasClass('slick-initialized')) {
      $sliderProducts.slick('unslick');
    }

    $tabsSlider.each(function(index,element) {
      if ($(element).hasClass('slick-initialized')) {
        $(element).slick('unslick');
      }
    });

    isMobile = false;
  }
});
