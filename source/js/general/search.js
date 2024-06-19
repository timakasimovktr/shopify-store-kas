// Header Slider
var $header_bar_wrapper = $('.header__bar-slider');
  if ($header_bar_wrapper.length > 0 ) {
  var header_bar_options = {
    arrows: false,
    dots: false,
    autoplay: true,
      autoplaySpeed: 6000,
      speed: 3000
  }
  $header_bar_wrapper.slick(header_bar_options);
}


$('.form-search .search__btn').on('click', function(){
  $('.form-search').submit();
});

$('.form-search .search__field').on('keyup keydown copy', function(event){
  var key = window.event ? event.keyCode : event.which;
  if(key == 13) {
    event.preventDefault();
    var q = $('.form-search input[name="q"]').val().trim();
    if( q != '') {
      location.href = '/search?type=product&q=' + q;
    }
    return false; 
  }
});

$('.search__close').on('click', function(event){
  location.href = '/';
});



var header_bar_height = 0;
$(window).on('load resize', function() {
  if ($('#search').length > 0) {
    if ($('header.header .header__bar').length > 0) {
      header_bar_height = $('header.header .header__bar').height();
    }

    $('#search').css('top', header_bar_height);
  }
});