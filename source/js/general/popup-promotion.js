const $popupTemplate = $('.popup-promotion');

var PromotionPopup = function() {

  this.options = {
    template: $popupTemplate
  };

  var self = this;

  this.init = function () {
    if (localStorage.getItem('onceOpenedFull') == 'true') {
      self.onceFull = true;
    } else {
      self.onceFull = false;
    }
    this.events();
  }

  this.events = function() {
    $(document).on('click', '.popup-promotion .popup-promotion--close, .popup-promotion .popup-promotion--cancel', function() {
      self.closePopup();
      self.delayTime(function() {
        self.openPopup(true);
      });
    });
    $(document).on('click', '.popup-promotion .popup-promotion--result-btn', function() {
      self.preventNextOpen();
    });
  }

  this.delayTime = function(callback) {
    var delay = 60000;
    if (!self.onceFull) {
      setTimeout(function() {
        self.onceFull = true;
        callback();
      }, delay);
    }
  }

  this.openPopup = function(small=false) {

    self.options.template.removeClass('small-popup');
    self.options.template.find('.popup-promotion--inner').removeClass('full-width').removeClass('full-height').removeClass('small-popup');

    if (small) {
      self.options.template.addClass('small-popup');
      self.options.template.find('.popup-promotion--inner').addClass('small-popup');
    } else {
      self.options.template.find('.popup-promotion--inner').addClass('full-width').addClass('full-height');
    }

    self.options.template.fadeIn(function() {
      $('body').css({
        'position': "fixed",
        'top': (0 - $(window).scrollTop()),
        'max-width': '100%'
      });
      $('body').attr('data-top', $(window).scrollTop());
    });

  }
  this.closePopup = function() {
    self.options.template.fadeOut(function() {
      var currentScrollTop = $('body').attr('data-top');
      $('body').css({
        "position": "initial",
        'top': 'auto',
        'max-width': 'auto'
      });
      $(window).scrollTop(currentScrollTop);
    });
    if (self.onceFull != true) {
      localStorage.setItem('onceOpenedFull', 'true');
    } else {
      localStorage.setItem('onceOpenedSmall', 'true');
    }

    if ($('.slick-initialized').length > 0) {
      if (typeof $('.slick-initialized').slick('setPosition') != 'undefined') {
        setTimeout(function() {
          $('.slick-initialized').slick('setPosition');
        }, 200);
      }
    }
  }
  this.preventNextOpen = function() {
    localStorage.setItem('prevent-promotion-repopup', 'true');
  }
}

$(document).ready(function() {
  if ($('.popup-promotion').length > 0) {
    var delay = 60000;

    // localStorage.removeItem('prevent-promotion-repopup');
    // localStorage.removeItem('onceOpenedSmall');
    // localStorage.removeItem('onceOpenedFull');
    
    // localStorage.removeItem('promotion_once_submitted');
    // localStorage.removeItem('promotion_result_set_header');
    // localStorage.removeItem('promotion_result_set_header_template');

    if (localStorage.getItem('prevent-promotion-repopup') != 'true') {
      var promotionPopup = new PromotionPopup();
      promotionPopup.init();
      if (localStorage.getItem('onceOpenedSmall') != 'true') {
        if (localStorage.getItem('onceOpenedFull') == 'true') {
          setTimeout(function() {
            promotionPopup.openPopup(true);
          }, delay);
        } else {
          promotionPopup.openPopup();
        }
      }
    }
    convertToResult();
  }
  // convertAnnouncementBar();
});

function convertToResult() {
  if (localStorage.getItem('promotion_once_submitted') == 'true') {
    $popupTemplate.find('.popup-promotion--content-wrapper').addClass('promotion-result');
    $popupTemplate.find('.popup-promotion--content-wrapper').find('.popup-promotion--content').remove();
  }
}
function convertAnnouncementBar() {
  if (localStorage.getItem('promotion_result_set_header') == 'true') {
    if ($popupTemplate.find('.popup-promotion--content-wrapper').find('.popup-promotion--result-announcement').length > 0) {
      var announcement_text = localStorage.getItem('promotion_result_set_header_template');
      if ($('header.header .header__bar .shell').length > 0) {
        $('header.header .header__bar .shell').html(announcement_text);
      }
    }
  }
}