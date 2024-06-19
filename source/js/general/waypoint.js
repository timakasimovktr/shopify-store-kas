const $waypoint = $('.js-waypoint');

$waypoint.on('click', function(event) {
  event.preventDefault();

  const $this = $(this);

  if ($this.attr('href') != '' && $this.attr('href') != '#') {
    // Scroll to element
    const $element = $($this.attr('href'));

    $('html, body').animate(
      {
        scrollTop: $element.offset().top - $('.header').outerHeight()
      },
      1000
    );
  } else {
    // If $element doesn't exist scroll to top
    $('html, body').animate(
      {
        scrollTop: 0
      },
      1000
    );
  }
});

/*Scroll to top when arrow up clicked BEGIN*/
$(window).scroll(function() {
    var height = $(window).scrollTop();

    if (height > 400) {
        $('.scroll-to-top').fadeIn();
    } else {
        $('.scroll-to-top').fadeOut();
    }
});
 /*Scroll to top when arrow up clicked END*/
