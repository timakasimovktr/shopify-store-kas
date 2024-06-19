const $pageNav = $('.page-navigation-wrapper');
const $generalNav = $('header.header .nav');
var pageUrl = "";

const $doc = $(document);
$doc.ready(function () {
  if (($pageNav.length > 0) && ($generalNav.length > 0)) {
    pageUrl = $pageNav.attr('data-nav-url');
    var $headerNavItem = $generalNav.find('.has-dropdown > a[href="' + pageUrl + '"]');
    if ($headerNavItem.length > 0) {
      var $navTemplate = $headerNavItem.closest('.has-dropdown').find('.nav__dropdown-cols');
      if ($navTemplate.length > 0) {
        $pageNav.html($navTemplate.html());
        /* Adjust */
        $pageNav.find('.has-dropdown > a').append('<span></span>');
      }
    }

    const mobileDropdownLinks = document.querySelectorAll('.visible-xs-block a[data-mobile-link]')
    const desktopPageNavigation = document.querySelectorAll('[data-nav-desktop] a[data-mobile-link]')
    const header = document.querySelector('header')

    const clickHandler = (link, scrollTop, isDesktop, e) => {
      e.preventDefault()
      let element = isDesktop
          ? document.querySelector(`#${link.dataset.mobileLink}.hidden-xs`)
          : document.querySelector(`#${link.dataset.mobileLink}.visible-xs-block`)
      if (element) {
        const top = element.offsetTop - scrollTop
        window.scrollTo(0, top <= 0 ? 0 : top)
      } else {
        window.location.href = link.href
      }
    }

    mobileDropdownLinks.forEach(link => {
      link.addEventListener('click', (e) => clickHandler(link, 80, false, e))
    })
    desktopPageNavigation.forEach(link => {
      link.addEventListener('click', (e) => clickHandler(link, header.offsetHeight + 80, true, e))
    })

  }
});

$doc.on('click', '.page-navigation-wrapper .has-dropdown > a', function (e) {
  e.preventDefault();
  var $parent = $(this).closest('.has-dropdown');

  $('.page-navigation-wrapper .has-dropdown').not($parent).removeClass('is_visible');
  $('.page-navigation-wrapper .has-dropdown').not($parent).find('.nav__dropdown').slideUp();

  if ($parent.hasClass('is_visible')) {
    $parent.removeClass('is_visible')
    $parent.find('.nav__dropdown').slideUp();
  } else {
    $parent.addClass('is_visible')
    $parent.find('.nav__dropdown').slideDown();
  }
});