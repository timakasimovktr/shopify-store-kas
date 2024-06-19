// Video play on click

const $playBtn = $('.js-play-btn');

$playBtn.on('click', function(event) {
  event.preventDefault();

  const $this = $(this);
  const $video = $this.parent().find('video');

  if (!$video.length) {
    return;
  }

  $this.addClass('is-hidden');
  document.getElementById('product_video').play();
});

var once_touched = false;

$(document).on('touchstart click', function() {
  if ($('.bundle-image-tutorial .item__video video').length > 0) {
    if (!once_touched) {
      $('.bundle-image-tutorial .item__video video').get(0).play();
      once_touched = true;
    }
  }
});