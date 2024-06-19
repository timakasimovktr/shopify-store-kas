const btnExpand = '.js-btn-expand';
const $doc = $(document);
const $win = $(window);
const wrapper = '.wrapper';

$doc.on('click', btnExpand, function(event) {
  event.preventDefault();

  const $this = $(this);
  const href = $this.attr('href');
  const $element = $(href);

  if (!$element.length) {
    return;
  }

  if(href == '#cart-inner' && $win.width() > 767) {
    return;
  }

  $element.toggleClass('is-expanded');
  $this.toggleClass('is-active');

  if(href == '#nav') {
    const $header = $('.header');

    if($this.hasClass('is-active')) {
      $header.addClass('hovered');
      $('body').css({'overflow': 'hidden', 'position': 'fixed', 'width': '100%', 'height': '100%', 'top': 0, 'left': 0});
      $('#nav > ul > li > a').removeClass('is-active').next('.nav__dropdown').slideUp();
      $('#nav > ul > li > a > span').attr('aria-expanded', false)
    } else {
      $header.removeClass('hovered');
      $('body').css({'overflow': 'auto', 'position': 'initial'});
    }

    $('.nav-bg').toggleClass('is-expanded');
  } else if(href == '#popup') {
    $('body').css({'overflow': 'hidden', 'position': 'fixed', 'width': '100%', 'height': '100%', 'top': 0, 'left': 0});
  }
});

$doc.on('click', wrapper, function(event) {

  const $target = $(event.target)

  if ($target.parents('.cart').length == 0) {
  	if($('.cart__inner').hasClass('is-expanded')) {
  		$('.cart__inner').removeClass('is-expanded');
  		$('.cart__link').removeClass('is-active');
  	}

    $('.header').removeClass('bordered');
  }
});

$doc.on('click', '.nav-bg', function(event) {
  $('.btn-menu.js-btn-expand').trigger('click');
});
