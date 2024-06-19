import { isTouchDevice } from './detect-touch-device';

const $win = $(window);
const $doc = $(document);
const $navDropdownParent = $('.nav .has-dropdown');

/**
 * Show nav dropdowns for mobile devices
 * @param  { Object } $clickedElement DOM Element - clicked element
 * @return { Void }
 */
function showNavDropdownsForMobile(clickedElement) {
  var expanded = $(clickedElement).find('span').attr('aria-expanded');
  if(expanded == "true") {
    $(clickedElement).find('span').attr('aria-expanded', false);
    $(clickedElement)
      .removeClass('is-active')
      .next('.nav__dropdown')
      .slideUp()
  } else {
    $(clickedElement)
      .closest('li')
      .siblings()
      .find('span')
      .attr('aria-expanded', false);

    $(clickedElement).find('span').attr('aria-expanded', true);

    $(clickedElement)
      .addClass('is-active')
      .next('.nav__dropdown')
      .slideDown()
      .closest('li')
      .siblings()
      .find('.is-active')
      .removeClass('is-active')
      .next('.nav__dropdown')
      .slideUp();

    $(clickedElement)
      .closest('.nav__dropdown-col')
      .siblings()
      .find('.is-active')
      .removeClass('is-active')
      .next('.nav__dropdown')
      .slideUp();
  }
}

/**
 * Hide nav dropdowns for mobile devices
 * @param  { Object } event Event on page
 * @return { Void }
 */
function hideNavDropdownsForMobile(event) {
  const $element = $(event.target);

  if (!$element.parents().hasClass('nav')) {
      $navDropdownParent.find('.nav__dropdown[style="display: block;"]').slideUp();
      $navDropdownParent
        .removeClass('is-active')
        .find('.is-active')
        .removeClass('is-active');
  }
}

$navDropdownParent.find('> a > span').on('click', function(event) {
  event.preventDefault();
  showNavDropdownsForMobile($(this).parent());
});

// $doc.on('click', function(event) {
//   if (isTouchDevice || $win.width() < 1024) {
//     hideNavDropdownsForMobile(event);
//   }
// });

$win.on('load resize', function() {
  if ($win.width() > 1024) {
    $navDropdownParent.find('.nav__dropdown').removeAttr('style');
  }
});

$('.nav .nav__dropdown .nav__dropdown-col > ul .nav__dropdown a')
  .on('mouseover', function() {
    const $this = $(this);
    const image = $this.data('image');
    const $productImage = $this.closest('.nav__dropdown-inner').find('.nav__dropdown-image');

    $productImage.css('background-image', `url(${image})`);
  })
  .on('mouseleave', function() {
    const $this = $(this);
    const $productImage = $this.closest('.nav__dropdown-inner').find('.nav__dropdown-image');

    var image = $productImage.data('image');
    $productImage.css('background-image', `url(${image})`);
  });
