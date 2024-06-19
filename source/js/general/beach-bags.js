import { initSlider } from '../sliders/init-slider';
import { getReviews } from '../helpers/reviews';
import '../helpers/jstars';

let carouselPrev = '<svg width="50" height="96" viewBox="0 0 50 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M49 1L2 48L49 95" stroke="currentColor" stroke-width="3"/></svg>';
let carouselNext = '<svg width="50" height="96" viewBox="0 0 50 96" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L48 48L1 95" stroke="currentColor" stroke-width="3"/></svg>';

var ourFavSliderOptions = {
  slidesToShow: 3,
  slidesToScroll: 3,
  arrows: false,
  dots: true,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1
      }
    }
  ]
};
var $ourFavWrapper = '';

$(document).ready(function() {
  adjustPageTop();
  $(window).on('load resize', function() {
    adjustPageTop();
    adjustFavSlider();
  });

  /*Product Slider*/
    $ourFavWrapper = $('.our-fav .our-fav--inner .products');

    if ($('.our-fav .our-fav--inner .products .product').length > 3) {
      initSlider($ourFavWrapper, ourFavSliderOptions);
    } else {
      $ourFavWrapper.addClass('less-than-3');
    }

  /* 
  *  Page: Beach Bags 
  *
  *  Quote Slider
  */
    const $quoteSliderContents = $('.quote-slider .quote-slider--contents');
    const $quoteSliderImages = $('.quote-slider .quote-slider--images');
    if (($quoteSliderContents.length > 0) && ($quoteSliderImages.length > 0)) {
      const quoteContentOptions = {
        infinite: true,
        dots: false,
        arrows: false,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: true,
        asNavFor: '.quote-slider .quote-slider--images'
      };
      const quoteImageOptions = {
        dots: false,
        arrows: true,
        prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">'+ carouselPrev +'</button>',
        nextArrow: '<button class="slick-next" aria-label="Next" type="button">'+ carouselNext +'</button>',
        slidesToShow: 1,
        slidesToScroll: 1,
        asNavFor: '.quote-slider .quote-slider--contents',
        responsive: [
          {
            breakpoint: 768,
            settings: {
              dots: true,
              arrows: false
            }
          }
        ]
      };
      initSlider($quoteSliderContents, quoteContentOptions);
      initSlider($quoteSliderImages, quoteImageOptions);

      $quoteSliderImages.on('setPosition', function(event, slick) {
        verticalMiddleQuoteSlider($quoteSliderImages);
      });

    }


    /*Reviews*/
    var $reviewsTemplate = $('#common-reviews--content');
    const reviewTemplateOptions = {
      infinite: false,
      dots: false,
      arrows: false,
      slidesToShow: 3,
      slidesToScroll: 1,
      fade: false,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            dots: true,
            arrows: false
          }
        }
      ]
    };
    if ($reviewsTemplate.length > 0) {
      if (typeof $reviewsTemplate.attr('data-products') != 'undefined') {

        var $reviewTemplateContent = $reviewsTemplate.find('.common-reviews--content');
        initSlider($reviewTemplateContent, reviewTemplateOptions);
        
        var productsData = JSON.parse($reviewsTemplate.attr('data-products'));
        getReviews(productsData, function(data) {
          makeReviewTemplate(
            $reviewTemplateContent,
            data
          );
        });
      }
    }

    /*Scroll Down*/
      $('.page-beach-bags a.btn[data-scrolldown]').click(function(e) {
        e.preventDefault();

        var toElem = $(this).attr('data-scrolldown');
        
        if ($(toElem).length > 0) {

          var elemTop = $(toElem).offset().top - parseInt($(toElem).css('margin-top'));
          var headerHeight = $('header.header .header__inner').outerHeight(true);

          $("html, body").animate({
            scrollTop: (elemTop - headerHeight) 
          }, 600);
        }
      });
});

function verticalMiddleQuoteSlider($quoteSliderContents) {
  
  var maxHeight = 0;
  var autoHeight = 0;

  $quoteSliderContents.find('.quote-item').each(function(index, template) {
    if (maxHeight < $(template).height()) {
      maxHeight = $(template).height();
    }
  });

  $quoteSliderContents.find('.quote-item').each(function(index, template) {
    autoHeight = (maxHeight - $(template).height()) / 2;
    if (autoHeight > 0) {
      $(template).css('padding-top', autoHeight);
    }
  });
}

function adjustFavSlider() {
  $ourFavWrapper = $('.our-fav .our-fav--inner .products');
  if ($ourFavWrapper.length > 0) {
    if ($ourFavWrapper.hasClass('less-than-3')) {
      if ($ourFavWrapper.hasClass('slick-initialized')) {
        $ourFavWrapper.slick('setPosition');
      }
      if ($(window).width() > 768) {
        if ($ourFavWrapper.hasClass('slick-initialized')) {
          $ourFavWrapper.slick('unslick');
        }
      } else {
        if (!$ourFavWrapper.hasClass('slick-initialized')) {
          initSlider($ourFavWrapper, ourFavSliderOptions);
        }
      }
    }
  }
}

function adjustPageTop() {
  // document.body.scrollTop = 0; // For Safari
  // document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  // $('.page-beach-bags, .template-collection .main').css({
  //   'padding-top': $('header.header').outerHeight(true) - 30
  // });
}

function makeReviewTemplate($reviewTemplateContent, reviews) {
  if (reviews != 'none') {
    var reviewTemp = '';
    var reviewItem;

    for(var i=0; i<reviews.length; i++) {
      reviewItem = reviews[i];

      /* Template */

        reviewTemp = '<div><div>';
        reviewTemp += '<div class="review--item">';
          reviewTemp += '<div class="review--score">' + reviewItem.score + '</div>';
          reviewTemp += '<div class="review--title">' + reviewItem.title + '</div>';
          reviewTemp += '<div class="review--content">' + reviewItem.content + '</div>';
          reviewTemp += '<div class="review--author">' + '<b>' +reviewItem.user.display_name + '</b> Verified Buyer' + '</div>';
        reviewTemp += '</div></div></div>';

        /* Add Element to the Carousel */
          $reviewTemplateContent.slick('slickAdd', reviewTemp);

    }

    /* Star Rating */

      $reviewTemplateContent.find('.review--score').each(function() {
        $(this)
        .empty()
        .jstars({
          size: '1.5rem',
          value: parseInt($(this).html()),
          stars: 5,
          color: '#646463',
          emptyColor: '#eee'
        });
      });
  }
}

