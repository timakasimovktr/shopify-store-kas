// Tabs functionality

const $tabNavButton = $('.tabs__nav a');
const $tabsDropdown = $('.tabs__dropdown');
const $win = $(window);

const updateSelectedDropdownTab = () => {
  $tabsDropdown.text($('.tabs__nav .current a').text());
};

$tabNavButton.on('click', function(event) {
  event.preventDefault();

  const $this = $(this);
  if ($this.closest('.tabs-sizes').length > 0) {

    const tabLink = $this.attr('href');
    const $tabBody = $this.closest('.tabs-sizes').find('.tabs__body');

    /* Tab Links */
      $this
        .closest('ul').find('> li')
        .removeClass('current');
      $this
        .closest('li')
        .addClass('current');

    /* Tab Body */
      $tabBody.find('.tab').removeClass('current');
      $tabBody.find(tabLink).addClass('current');

  } else {
    const $tab = $this.closest('.tabs').find($this.attr('href'));
    const $tabsDropdown = $this.closest('.tabs__nav').prev('.tabs__dropdown');
    const text = $this.text();
    const $tab_products = $tab.find('.products');

    if (!$tab.length) {
      return;
    }

    $this
      .parent()
      .addClass('current')
      .siblings('.current')
      .removeClass('current');

    $tab
      .addClass('current')
      .siblings('.current')
      .removeClass('current');

    if ($tabsDropdown.length && $win.width() < 768) {
      $tabsDropdown
        .text(text)
        .next()
        .slideUp();
    }

    /* Refresh tab products slider */
    if ($tab_products.length > 0) {
      if ($tab_products.hasClass('slick-initialized')) {
        $tab_products.slick('setPosition');
      }
    }
  }

  updateSelectedDropdownTab();
});

$tabsDropdown.on('click', function(event) {
  event.preventDefault();

  $(this)
    .next()
    .stop()
    .slideToggle();
});

$win.on('resize', function(event) {
  if ($win.width() > 767) {
    $tabsDropdown.next().removeAttr('style');
  }
});

$(function() {
  const $liTabs = $('.tabs-sizes ul li');
  let doesSizeChartExist = false;
  
  for (let i = 0; i < $liTabs.length; i++) {
    const $tab = $($liTabs[i]);

    if($tab.data('size-name').includes('-size-chart')){
      doesSizeChartExist = true;
      break;
    }
  }
  
  if(doesSizeChartExist){
    $liTabs.each((i, tabElem) => {
      const $tabElem = $(tabElem);
      if($tabElem.data('size-name').includes('-size-chart')){
        $tabElem.addClass('show-as-first-tab');
        $tabElem.find('a')[0].click();
      } else {
        $tabElem.removeClass('current');
      }
    });
  }

  updateSelectedDropdownTab();
});