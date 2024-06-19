const $win = $(window);

const $sliderImages = $('.js-slider-images');
const $sliderThumbs = $('.js-slider-thumbs');

const $formSelect = $('.form-product select[name="id"]');
const $priceHolder = $('.section-product .section__price span:first-child');
const $comparePriceHolder = $('.section-product .section__price del');
const $productFormAccessories = $('.form-product--accessories select');
const $addToCartBtn = $('.form-product input[type="submit"]');
var firstLoading = true; // To set first image of when productFormAccessories is loaded first.

// For use within normal web clients 
var isiPad = navigator.userAgent.match(/iPad/i) != null;

/**
 * Set new slide index
 * @param  { Object } $selector DOM Element - slider holder
 * @return { Void }
 */
function sliderIndexing($selector) {
  $selector.find('.slick-slide').each(function(index, slide) {
    $(slide).attr('data-slick-index', index);
  });

  var index = $('.slider__slide.slider__slide--default').length;

  if (firstLoading) {
    index = 0;
  }
  
  if ($('.slider-thumbs .slider__slide.slider__slide--default').length < 4) {
    $('.slider-thumbs .slick-track').addClass("slickThumbsFixed");
    $('.slider-thumbs .slick-track').css("-webkit-transition", "all 1s");
    $('.slider-thumbs .slick-track').css("-moz-transition", "all 1s");
    $('.slider-thumbs .slick-track').css("-o-transition", "all 1s");
    $('.slider-thumbs .slick-track').css("transition", "all 1s");
  }

  $selector.slick('slickGoTo', index, true);
}

/**
 * Filtering the sliders
 * @param  { String } currentColor Current color
 * @return { Void }
 */
function filteringSliders(currentColor, currentSize) {
  $sliderImages.slick('slickUnfilter');
  $sliderThumbs.slick('slickUnfilter');

  $sliderImages.slick('slickFilter', filteringSlidersCallback(currentColor, currentSize));
  $sliderThumbs.slick('slickFilter', filteringSlidersCallback(currentColor, currentSize));

  sliderIndexing($sliderImages);
  sliderIndexing($sliderThumbs);

  $sliderThumbs.slick('setPosition');

  const $link = $('.link-zoom');
  const $zoomIcon = $('.link-zoom > span');

  if ($win.width() > 767 && !isiPad) {
    $link.zoom({
      on: 'click'
    });
  } else {
    $zoomIcon.on('click', function(event) {
      event.preventDefault();

      var productImageSource = $(this).parent().find('img').data('original-src');
      var productImageWidth = $(this).parent().find('img').data('original-width');
      var productImageHeight = $(this).parent().find('img').data('original-height');

      var productOverlay = $('.slider-zoom-popup');
      var productOverlayImage = $('.slider-zoom-popup img');
      productOverlayImage.attr('src', productImageSource).css('width', productImageWidth + 'px');
      productOverlay.fadeIn(100);
      $('.slider-zoom-popup-close').show();
      $('body').css('overflow', 'hidden');

      var scrolltoLeft = $(productOverlayImage).offset().left + (productImageWidth / 2) - ($win.width() / 2);
      var scrolltoTop = $(productOverlay).offset().top + (productImageHeight / 2) - ($win.height() / 2);
      $(productOverlay).animate({ scrollLeft:  scrolltoLeft, scrollTop:  scrolltoTop}, 500);

      $('.slider-zoom-popup-close').click(function () {
          $(productOverlay).animate({ scrollLeft:  0, scrollTop:  0}, 50);
          productOverlay.fadeOut(100);
          $(this).hide();
          $('body').css('overflow', 'auto');
      });
    });
  }
}

function filteringSlidersCallback(currentColor, currentSize) {
  var option_str = currentColor + '-' + currentSize;
  // var color_size_customizer = option_str + '-customizer';
  var color_size_customizer = option_str;
  if($('.slider__slide.slider__slide--' + option_str).length > 0 || $('.slider__slide.slider__slide--' + color_size_customizer).length > 0) {
    return $('.slider__slide.slider__slide--' + option_str + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_size_customizer).closest('.slick-slide');
  } else {
    // var color_customizer = currentColor + '-customizer';
    var color_customizer = currentColor;
    return $('.slider__slide.slider__slide--' + currentColor + ', .slider__slide.slider__slide--default, .slider__slide.slider__slide--' + color_customizer).closest('.slick-slide');
  }
}

function filteringCompleteTheLook(currentColor) {
  var _options_by_color = window.options_by_color;
  var _vanity_colors_list = window.vanity_colors_list || [];

  var _colors = null;
  var _color_obj = null;
  var _color = null;
  var _color_vals = [];
  var _color_index = -1;
  for(var i=0; i<_vanity_colors_list.length; i++) {
    _colors = _vanity_colors_list[i].split('||');
    for(var j=0; j<_colors.length; j++) {
      _color_obj = _colors[j].split('|');
      _color = _color_obj[0];
      if(currentColor == _color) {
        _color_vals = _colors;
        _color_index = i;
      }
    }
  }

  var done = false;
  if(_color_vals.length > 0) {
    if($('.product-complete-the-look').length > 0) {
      $('.product-complete-the-look').each(function(i){
        done = false;

        if($(this).find('.complete-the-look-color').length > 0) {
          $(this).find('.complete-the-look-color').each(function(j){
            var color_val = $(this).val();
            for(var m=0; m<_color_vals.length; m++) {
              var _vanity_color = _color_vals[m].split('|');
              if(_vanity_color[0] == color_val) {
                $(this).trigger('click');
                done = true;
              }
            }
          });
        }

        if(done == false) {
          if($(this).find('.complete-the-look-color:checked').length > 0) {
            $(this).find('.complete-the-look-color:checked').prop('checked', false);

            $(this).find('.product_info .form__label').html('');

            var img = $(this).find('.product__image-inner--first').data('original-image');
            $(this).find('.product__image-inner--first').css('background-image', 'url(' + img + ')');

            $(this).find('.complete-the-look-btn').prop('disabled', true);
          }
        }
      });
    }
  }
}

/**
 * Change select option
 * @param  { String } selectorOption Selector for options
 * @param  { Number } checkedRadiosNumber Number of checked radios
 * @return { Void }
 */
function changeSelectValue(selectorOption, checkedRadiosNumber) {
  $('.form-product .options-container input:checked').each(function(index) {
    const $this = $(this);
    const selectedValue = $this.val();
    const selectedName = $this.attr('name');

    selectorOption = selectorOption + `[data-${selectedName}="${selectedValue}"]`;

    if (checkedRadiosNumber == index + 1) {
      const currentValue = $formSelect.find(selectorOption).val();

      const price = $formSelect.find(selectorOption).data('price');
      const comparePrice = $formSelect.find(selectorOption).data('compare-price');
      var q_price = $formSelect.find(selectorOption).attr('data-q-price');
      $priceHolder.html(price);
      afterPayChange(price, q_price);

      if (comparePrice !== '') {
        $comparePriceHolder.removeClass('hidden').html(comparePrice);
      } else {
        $comparePriceHolder.addClass('hidden');
      }

      $formSelect.val(currentValue).trigger('change');
    }
  });
}

$formSelect.on('change', function(event){
  var $parent = $(this).parents('.form-product'),
  qty = parseInt($parent.find('input#field-qty').val()),
  variantVal = $(this).val(),
  selOption = $(this).find('option[value="' + variantVal + '"]'),
  inventory_qty = parseInt($(selOption).data('inventory')),
  q_price = selOption.attr('data-q-price'),
  klaviyoBtn = $parent.find('.klaviyo-bis-trigger');

  if($('.section-included-products').length > 0) {
    var options = $(this).data('options');
    options = options.split(",");

    var variantOptions = [];
    for(var i=0; i<options.length;i++) {
      variantOptions.push({ name: options[i], value: $(selOption).data(options[i]) });
    }

    if(variantOptions.length > 0) {
      var price = 0;
      var comparePrice = 0;

      var total_included_cnts = 0;
      var total_matched_cnts = 0;
      for(var i=1; i<9;i++) {
        if($('#id_included_product_'+i).length > 0) {
          total_included_cnts += 1;
          var variant_selOptValue = '';
          var _color_name = $('#id_included_product_'+i).data('color-name');

          $('#id_included_product_'+i + ' option').each(function(j){
            var _counts = 0;
            for(var m in variantOptions) {
              var variantOptionsItem = variantOptions[m];
              if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
                _counts++;
              }
            }

            if(_color_name != '') {
              _counts = 0;
              if(typeof $(this).data('color') == 'undefined') {
                _counts = 1;
                _color_name = $parent.find('.list-radios-boxes input:checked').val();
                for(var m in variantOptions) {
                  var variantOptionsItem = variantOptions[m];
                  switch(variantOptionsItem.name) {
                    case 'size':
                      if(_color_name == $(this).data(variantOptionsItem.name)) {
                        _counts++;
                      }
                      break;
                  }
                }
              } else {
                for(var m in variantOptions) {
                  var variantOptionsItem = variantOptions[m];
                  switch(variantOptionsItem.name) {
                    case 'color':
                      if($(this).data(variantOptionsItem.name) == _color_name) {
                        _counts++;
                      }
                      break;
                    case 'size':
                      if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
                        _counts++;
                      }
                      break;
                  }
                }
              }
            }

            if(_counts == variantOptions.length) {
              variant_selOptValue = $(this).val();
              price += parseFloat($(this).data('price'));
              if($(this).data('compare-price') != "") {
                comparePrice += parseFloat($(this).data('compare-price'));
              } else {
                comparePrice += parseFloat($(this).data('price'));
              }

              total_matched_cnts += 1;
            }
          });

          if(variant_selOptValue != "") {
            $('#id_included_product_'+i).val(variant_selOptValue);
          }
        }
      }

      price = price / 100;
      price = price.toFixed(2);

      $priceHolder.html('$' + price);

      q_price = Number(price.replace(/[^0-9.-]+/g,""));
      q_price = (q_price / 4).toFixed(2);
      q_price = `$${q_price}`;

      afterPayChange(price, q_price);

      if (price < comparePrice) {
        comparePrice = comparePrice / 100;
        comparePrice = comparePrice.toFixed(2);
        $comparePriceHolder.removeClass('hidden').html('$' + comparePrice);
      } else {
        $comparePriceHolder.addClass('hidden');
      }
    }
  }
  
  if(((inventory_qty < qty && inventory_qty > 0) || inventory_qty <= 0)) {
    if (is_preorder) {
      $addToCartBtn.attr('disabled', false).val(cartbtn_status.pre_order);
      $parent.find('.preorder--message').show();
    } else {
      $addToCartBtn.attr('disabled', true).val(cartbtn_status.out_of_stock);
      if(inventory_qty <= 0) {
        setTimeout(function() {
          klaviyoBtn.show().attr('data-variant-id', variantVal);
        }, 100);
        $parent.find('.form__row--available').hide();
      } else {
        $parent.find('.form__row--available').show();
      }
    }
  } else {
    $addToCartBtn.val(cartbtn_status.add_to_cart);
    if(qty > 0) {
      $addToCartBtn.attr('disabled', false)
    } else {
      $addToCartBtn.attr('disabled', true)
    }
    
    $parent.find('.preorder--message').hide();
    $parent.find('.form__row--available').show();
  }

  if($('.template-accessories').length > 0) {
    window.scrollTo(0, 0);
  }

  updateOptionsSectionLabels($(event.currentTarget));

  validateExistantOptions();
});

// Set text in element of current element
$('.form-product input').on('click', function() {

  const $this = $(this);
  const text = $this.data('text');
  const holderIsColor = $this.closest('.list-radios-colors').length;
  const holderIsBox = $this.closest('.list-radios-boxes').length;
  const checkedRadiosNumber = $('.form-product .options-container input:checked').length;
  let selectorOption = '';

  if (holderIsColor) {
    $this
      .closest('.form__controls')
      .prev('.form__label')
      .text(text);
    
    const currentColor = $this.val();

    var size_val = '';
    if($('.form-product .list-radios-boxes').length > 0) {
      size_val = $('.form-product .list-radios-boxes input:checked').val();
    }
    
    filteringSliders(currentColor, size_val);

    filteringCompleteTheLook(currentColor);
  }

  if (holderIsBox) {
    // Only if variant option and not bundle option like add/remove insert,
    // this will handle correct image display on slider
    if(!$this.prop('id').includes('field-options-')){
      const size_val = $this.val();
  
      var currentColor = '';
      if($('.form-product .list-radios-colors').length > 0) {
        currentColor = $('.form-product .list-radios-colors input:checked').val();
      }
  
      filteringSliders(currentColor, size_val);
    }
  }

  changeSelectValue(selectorOption, checkedRadiosNumber);

});

$productFormAccessories.on('change', function(event) {
  const $this = $(this);
  const currentAccessory = $this.find(':selected').data('accessories');
  const optionPrice = $this.find(':selected').data('price');
  var q_price = $this.find(':selected').attr('data-q-price');

  const optionComparePrice = $this.find(':selected').data('compare-price');
  $priceHolder.html(optionPrice);
  afterPayChange(optionPrice, q_price);

  if (optionComparePrice !== '') {
    $comparePriceHolder.removeClass('hidden').html(optionComparePrice);
  } else {
    $comparePriceHolder.addClass('hidden');
  }

  if (currentAccessory !== '') {
    filteringSliders(currentAccessory, '');
  }
});

function initializeBundlePrice() {
  if($('.section-included-products').length > 0) {
    var qty = parseInt($('.form-product input#field-qty').val());

    var options = $formSelect.data('options');
    var variantVal = $formSelect.val();
    options = options.split(",");
    var selOption = $formSelect.find('option[value="' + variantVal + '"]');

    var variantOptions = [];
    for(var i=0; i<options.length;i++) {
      variantOptions.push({ name: options[i], value: $(selOption).data(options[i]) });
    }

    if(variantOptions.length > 0) {
      var bundleAvailable = true;
      var price = 0;
      var comparePrice = 0;

      var total_included_cnts = 0;
      var total_matched_cnts = 0;
      for(var i=1; i<9;i++) {
        if($('#id_included_product_'+i).length > 0) {
          total_included_cnts += 1;
          var variant_selOptValue = '';
          var _color_name = $('#id_included_product_'+i).data('color-name');

          $('#id_included_product_'+i + ' option').each(function(j){
            var _counts = 0;
            for(var m in variantOptions) {
              var variantOptionsItem = variantOptions[m];
              if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
                _counts++;
              }
            }

            if(_color_name != '') {
              _counts = 0;
              if(typeof $(this).data('color') == 'undefined') {
                _counts = 1;
                _color_name = $('.form-product .list-radios-boxes input:checked').val();
                for(var m in variantOptions) {
                  var variantOptionsItem = variantOptions[m];
                  switch(variantOptionsItem.name) {
                    case 'size':
                      if(_color_name == $(this).data(variantOptionsItem.name)) {
                        _counts++;
                      }
                      break;
                  }
                }
              } else {
                for(var m in variantOptions) {
                  var variantOptionsItem = variantOptions[m];
                  switch(variantOptionsItem.name) {
                    case 'color':
                      if($(this).data(variantOptionsItem.name) == _color_name) {
                        _counts++;
                      }
                      break;
                    case 'size':
                      if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
                        _counts++;
                      }
                      break;
                  }
                }
              }
            }

            if(_counts == variantOptions.length) {
              variant_selOptValue = $(this).val();
              price += parseFloat($(this).data('price'));
              if($(this).data('compare-price') != "") {
                comparePrice += parseFloat($(this).data('compare-price'));
              } else {
                comparePrice += parseFloat($(this).data('price'));
              }

              var inventory_qty = parseInt($(this).data('inventory'));
              if(inventory_qty < qty && inventory_qty > 0) {
                bundleAvailable = false;
              }

              total_matched_cnts += 1;
            }
          });

          if(variant_selOptValue != "") {
            $('#id_included_product_'+i).val(variant_selOptValue);
          }
        }
      }

      if(total_included_cnts > total_matched_cnts) {
        bundleAvailable = false;
      }

      price = price / 100;
      price = price.toFixed(2);
      $priceHolder.html('$' + price);

      if (price < comparePrice) {
        comparePrice = comparePrice / 100;
        comparePrice = comparePrice.toFixed(2);
        $comparePriceHolder.removeClass('hidden').html('$' + comparePrice);
      } else {
        $comparePriceHolder.addClass('hidden');
      }

      if(bundleAvailable) {
        $addToCartBtn.val(cartbtn_status.add_to_cart);
        if(qty > 0) {
          $addToCartBtn.attr('disabled', false)
        } else {
          $addToCartBtn.attr('disabled', true)
        }
      } else {
        $addToCartBtn.attr('disabled', true).val(cartbtn_status.out_of_stock);
      }
    }
  }
}

/**
 * This function will look for tags starting
 * with "discontinued:" and hide the right option
 * in the PDP
 */
function hideDiscontinuedOptions(){

  const discontinuedOptions = window.product.tags.filter((tag) => {
    const regexMatches = tag.match(/:/g);
    return regexMatches && regexMatches.length == 2;
  })
  .map((tag) => {
    let optionName = handleize(tag.split(':')[1]);
    let optionValue = tag.split(':')[2];
    
    return new DiscontinuedOption(optionName, optionValue);
  });

  discontinuedOptions.forEach((option) => {
    let targetOptionElem = document.querySelector(`.form-product [name="${option.optionName}"][value="${handleize(option.optionValue)}"]`);

    if(targetOptionElem){
      targetOptionElem = targetOptionElem.closest('li');
      targetOptionElem.classList.add('hidden');
      targetOptionElem.querySelector('input').setAttribute('disabled', true);
    }
  });
}

const handleizeValue = (value) => {
  if (typeof value === 'string') {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  return '';
};

const selectOption = (value, bool) => {
  let targetElem = document.querySelector(`.form-product li:not(.hidden) input[value="${bool ? value : handleizeValue(value)}"]:not(:disabled)`);
  if (targetElem) {
    targetElem = targetElem.closest('li').querySelector('label');
    targetElem.click();
  }
};

const preselectOptions = (options) => {
  options.forEach((option) => {
    selectOption(option);
  });
};

function preselectFirstAvailableOptions() {
  const urlParams = new URLSearchParams(window.location.search);
  const variantId = urlParams.get('variant');
  const extraOption = urlParams.get('extraOption');

  if (variantId) {
    const variant = window.product.variants.find((variant) => variant.id == variantId);
    if (variant) {
      const options = variant.options;
      preselectOptions(options);
    }
  } else {
    const options = window.product.options.map(option => [option, option]);
    preselectOptions(options);
    const extraoption = document.querySelector(".form__row.options-container li:first-of-type label");
    if(extraoption){
      extraoption.click();
    }
  }

  if (extraOption) {
    selectOption(extraOption, true);
  }

  const formProduct = document.querySelector('.form-product');
  const radiosColors = formProduct.querySelectorAll('.list-radios-colors input:checked');
  const radiosBoxes = formProduct.querySelectorAll('.list-radios-boxes input:checked');
  const currentColor = radiosColors.length > 0 ? radiosColors[0].value : null;
  const currentSize = radiosBoxes.length > 0 ? radiosBoxes[0].value : null;
  filteringSliders(currentColor, currentSize);
}

initializeBundlePrice();

$(document).ready(function(){
  let optionsContainer = document.querySelector('.options-container');

  $('.form-product .list-radios-colors input').each(function(){
    if($(this).prop('checked')) {
      var currentColor = $(this).val();
      filteringCompleteTheLook(currentColor);
    }
  });
  if ($productFormAccessories.length > 0) {
    $productFormAccessories.trigger('change');
  }  
  firstLoading = false;
  
  hideDiscontinuedOptions();
  preselectFirstAvailableOptions();

  optionsContainer.style.visibility = '';
});

$(window).on('load', function() {

  /* To trigger change values */
    if($formSelect.length > 0) {
      if ($formSelect.closest('.form-product--accessories').length < 1) {
        $formSelect.trigger('change');
      }
    }

    $('.section__images').addClass('loaded');
    
    repositionKlaviyoBtn();
});

var intPrice = 0;

function afterPayChange(product_price, q_price) {
  if(product_price == undefined && q_price == undefined){
    return;
  }
  
  /* convert currency */
    intPrice = Number(product_price.replace(/[^0-9.-]+/g,""));

  if ((intPrice < 35) || (intPrice > 1200)) {
    window.updateAfterpayTemplate(false, q_price);
  } else {
    window.updateAfterpayTemplate(true, q_price);
  }
}

const updateVariantId = (variantSelect) => {
  let variantId = variantSelect.val();
  let variantUrl = window.location.origin + window.location.pathname + '?variant=' + variantId;
  window.history.replaceState(null, null, variantUrl);
};

function updateOptionsSectionLabels($variantSelect){
  var options = $variantSelect.data('options').split(','),
    $extraOptions = $('.form__row.options-container .optionFilter'),
    $selectedOption, selectedOptionTex

  for (let i = 0; i < options.length; i++) {
    $selectedOption = $(`.js-form-ajax input[name=${options[i]}]:checked`);
    selectedOptionText = $selectedOption.data('text');

    $selectedOption.closest('.form__row').find('.form__label:nth-child(2)').text(selectedOptionText);
    $selectedOption.on('change', function(){
      updateVariantId($variantSelect);
    });
  }

  if ($extraOptions.length > 0) {
    $selectedOption = $extraOptions.closest('.options-container').find('input:checked');
    selectedOptionValue = $selectedOption.val();
    $selectedOption.on('change', function(){
      updateVariantId($variantSelect);
    });
    setTimeout(() => {
      if (!new URLSearchParams(window.location.search).has('extraOption') && selectedOptionValue) {
        let ExtraoptionsUrl = window.location.href + '&extraOption=' + selectedOptionValue;
        window.history.replaceState(null, null, ExtraoptionsUrl);
      }
    }, 10);
  }
}


/**
 * This function will move the klaviyo sold out
 * btn before the wishlist container on all templates
 * except the bat-accessories template
 * @returns 
 */
function repositionKlaviyoBtn(){
  if(document.querySelector('body').dataset.template == 'product.accessories'){
    return;
  }
  
  var $klaviyoBtn = $('.klaviyo-bis-trigger'),
  $wishlistBtnContainer = $('.container-btn-wishlist');

  if(document.querySelector('body').dataset.template.includes('bundle')){
    // Klaviyo btn will be managed in product.bundle.liquid (klaviyo-bis-trigger-bundle)
    // $klaviyoBtn.remove();
    return;
  }
  
  if($klaviyoBtn){
    if($wishlistBtnContainer){
      $klaviyoBtn.attr('style', 'display:none;'); // Overrides default Klaviyo style attr injection
      $wishlistBtnContainer.before($klaviyoBtn);
    }
  }
}

/**
* Disabled all PDP size options based on
* product.disabledSizesforColors metafield
*/
function validateExistantOptions(){
  if(!document.querySelector('body').classList.contains('template-product')){
    return;
  }

  var inputSelectedColor = document.querySelector('input[name="color"]:checked'),
  selectedColor, targetDisabledSizesForColors, sizeInputToDisable;

  if(inputSelectedColor){
    selectedColor = handleize(inputSelectedColor.value);
  }
  
  document.querySelectorAll(`input[name="size"]`).forEach(function(sizeOptionInput){
    sizeOptionInput.removeAttribute('disabled');
  })

  targetDisabledSizesForColors = window.disabledSizesforColors.filter(ds => ds.color == selectedColor);

  if(!targetDisabledSizesForColors){
    return;
  }

  targetDisabledSizesForColors.forEach((targetDisabledSizeForColor) => {
    if(targetDisabledSizeForColor && targetDisabledSizeForColor.disabledSize){
      sizeInputToDisable = document.querySelector(`input[name="size"][value="${ targetDisabledSizeForColor.disabledSize }"]`);
      sizeInputToDisable.setAttribute('disabled', true);
    }
  });

  let selectedDisabledOption = document.querySelector('input[name="size"]:checked:disabled'),
    newAvailableOption = document.querySelector(`input[name="size"]:first-child:not(:disabled)`);

    if(selectedDisabledOption && newAvailableOption){
      setTimeout(() => {
        newAvailableOption.click();
      }, 150);
    }
}

function handleize(str){
  var handle;
  if(!str){
    return str;
  }

  handle = str.replace(/\W+/g, "-");

  while(handle.endsWith('-')){
    handle = handle.substring(0, handle.length-1);
  }

  return handle.toLowerCase();
}

window.updateAfterpayTemplate = function(isAfterpay, price=0) {
  var afterpayParagraph = $(".afterpay-paragraph ")
  var afterpayParagraph1 = afterpayParagraph.find('.afterpay-text1')
  var afterpayParagraph2 = afterpayParagraph.find('.afterpay-text2')

    if (afterpayParagraph.length > 0) {
      var text = "";
      if (isAfterpay) {
       afterpayParagraph1.remove();
        afterpayParagraph2.remove();
        text = `<span class="afterpay-text1"> or 4 interest-free installment
         of ${price} by </span>`;
        afterpayParagraph.prepend(text);
      } else {
        afterpayParagraph1.remove();
        afterpayParagraph2.remove();
        text = `<span class="afterpay-text1">Available on orders $35.00-$1200.00 by </span>`;
        afterpayParagraph.prepend(text);
      }
      $(".afterpay-paragraph .afterpay-link").html('More Info');
    
  }
 
}

class DiscontinuedOption {
  optionName;
  optionValue;

  constructor(optionName, optionValue){
    this.optionName = optionName;
    this.optionValue = optionValue;
  }
}