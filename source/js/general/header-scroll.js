const $win = $(window);
const $header = $('.header');

$win.on('load scroll', function() {
  const winScrollTop = $(this).scrollTop();

  if (winScrollTop > 0) {
    $header.addClass('is-fixed');
    adjustHeaderWhenScroll($header, true);
  } else {
    $header.removeClass('is-fixed');
    adjustHeaderWhenScroll($header, false);
  }
});

$('nav > ul> li > a, .nav .nav__dropdown, .header .header__aside .nav__dropdown--accounts').on('mouseover', function(){
  if(!$header.hasClass('hovered')) {
    $header.addClass('hovered');
  }
});

$('nav > ul> li > a, .nav .nav__dropdown, .header .header__aside .nav__dropdown--accounts').on('mouseout', function(){
  if($header.hasClass('hovered')) {
    $header.removeClass('hovered');
  } 
});

$('.cart').on('mouseover', function(){
  if(!$header.hasClass('hovered')) {
    $header.addClass('hovered');
  }

  if(!$header.hasClass('bordered')) {
    $header.addClass('bordered');
  }
});

$('.cart').on('mouseout', function(){
  $header.removeClass('hovered');
  $header.removeClass('bordered');

  if($win.width() > 767) {
    $(this).find('.cart__inner').removeClass('is-expanded');
  }
});

function adjustHeaderWhenScroll($header, scrolled) {
  if ($header.find('.header__bar').length > 0) {
    if (scrolled) {
      $header.css('margin-top', (0 - $header.find('.header__bar').height()));
    } else {
      $header.css('margin-top', 0);
    }
  }
}