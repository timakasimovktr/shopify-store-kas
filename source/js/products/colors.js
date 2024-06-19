$(() => {
  const $win = $(window);
  const $doc = $(document);
  /* Set color on product option color */
  const $dataElement = $('[data-color-name]');
  const $listColorsLink = $('.list-colors a');
  const $listColorsAvailable = $('.list-colors-available');
  const $productOne = $('.products .product');
  const singleColorAvailableTranslation = $('#available-color-t').val();
  const colorAvailableTranslation = $('#available-colors-t').val();

  $productOne.on('mouseleave', function() {
    const $productImageFirst = $(this).find('.product__image-inner--first');
    $productImageFirst.removeClass('is-active');
    const $productImageOrigin = $(this).find('.product__image-inner--origin');
    $productImageOrigin.show();
  });

  $listColorsLink.on('click', function() {
    const $this = $(this);
    const url = $this.data('href');
    const $productUrl = $this.closest('.product').find('.product__image > a');
    const $selectedColor = $this.closest('.product').find('.list-colors--selected');
    const $productImageHover = $this.closest('.product').find('.product__image-inner--hover');
    const $productImageOrigin = $(this).closest('.product').find('.product__image-inner--origin');
    $productUrl.attr('href', url);
    $this.closest('ul.list-colors').find('li').removeClass('current');
    $this.parent().addClass('current');
    const image = $this.data('image');
    const $productImageFirst = $(this).closest('.product').find('.product__image-inner--first');
    
    if(image !== undefined){
      $productImageFirst.css('background-image', `url(${image})`).addClass('is-active');
    }
    
    $productImageOrigin.hide();
    var color_text = $this.data('color-text').replace(/ *\([^)]*\) */g, "");
    $selectedColor.text(color_text);
  });

  $listColorsAvailable.on('click', function() {
    var url = $(this).data('url');
    location.href = url;
  });

  if ($win.width() < 1025) {
    $('.product .product__image a').on('click', function(event) {
      const $this = $(this);
      if (!$this.closest('.product').hasClass('is-active')) {
        // event.preventDefault();
      }
      $this.closest('.product').addClass('is-active');
    });
    $doc.on('click', function(event) {
      const $element = $(event.target);
      if (!$element.closest('.product').hasClass('is-active') && !$element.hasClass('product is-active')) {
        $('.product.is-active').removeClass('is-active');
      }
    });
  }

  if(singleColorAvailableTranslation && colorAvailableTranslation){
    $('main .products .product').each((i, product) => {
      let $product = $(product);
      let $availableColorsContainer = $product.find('.list-colors-available');
      const availableColors = $product.find('.list-colors li').length;
      let availableColorsText = '';
  
      if(availableColors == 1){
        availableColorsText = singleColorAvailableTranslation;
      } else {
        availableColorsText = colorAvailableTranslation.replace('{{counts}}', availableColors);
      }
  
      $availableColorsContainer.text(availableColorsText);
    });
  }
});