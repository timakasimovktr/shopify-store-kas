/*
This scripts manages all the cart updates.

-----PROMOS-----
All promos add gifts to an array so backend functions are called just once (add and remove).

Look for
BEGIN [GENERAL FUNCTIONS - CUSTOM CODE]
END [GENERAL FUNCTIONS - CUSTOM CODE]
to find functions that are shared between holiday and bogo.

Then you will find 
BEGIN [HOLIDAY GIFT FUNCTIONS - CUSTOM CODE]
END [HOLIDAY GIFT FUNCTIONS - CUSTOM CODE]
and
BEGIN [BUY ONE GET ONE FUNCTIONS - CUSTOM CODE]
END [BUY ONE GET ONE FUNCTIONS - CUSTOM CODE]
for specific promo logics.

Holiday:
Adds only one gift when HOLIDAY_MIN_SUBTOTAL reached.

Buy One Get One (BOGO):
Three promotions where if one item in cart belongs to a n number of collections, a gift (limited to three) is added.
Currently there are three promotions like:
Buy one Robe/Solid Towel get one slipper
Buy one Beach Bag get one turban
Buy one Pajama get one gift box

*/

const formWithoutBtnClass = '.js-form-without-btn';
const $formProduct = $('.form-product form').length ? $('.form-product form') : $('.js-form-ajax');
var $tdWrapper = ''; // cartOutStockErrorHandle

if ($(formWithoutBtnClass).length) {
  $(formWithoutBtnClass)
    .find('input[type="radio"]')
    .prop('checked', false);
}

$('input[type="radio"]').on('change', function(event) {
  const $this = $(this);
  const $form = $this.closest(formWithoutBtnClass);
  const rowsNumber = $form.find('.form__row').length;
  const $radioHolder = $this.closest('ul');
  const $select = $form.find('select');

  if (!$radioHolder.hasClass('is-active')) {
    $radioHolder.addClass('is-active');
    const $activedRadios = $form.find('ul.is-active');
    const $checkedInputs = $activedRadios.find('input:checked');
    const activedRadios = $activedRadios.length;

    if (activedRadios === rowsNumber) {
      let optionSelector = '';

      $checkedInputs.each(function(index) {
        const $this = $(this);

        optionSelector = optionSelector + `[data-${$this.data('preffix')}="${$this.val()}"]`;

        if (index + 1 === rowsNumber) {
          selectOptionAndSubmitForm($form, $select, $(optionSelector), $radioHolder);
        }
      });
    }
  }
});

$formProduct.on('submit', function(event) {
  event.preventDefault();

  if($('.section-included-products').length > 0) {
    ajaxSubmitBundled($(this));
  } else {
    ajaxSubmit($(this));
  }
});

/**
 *
 * @param  { Object } $form           DOM Element - form tag
 * @param  { Object } $select         DOM Element - select with different variants
 * @param  { Object } $optionSelector DOM Element - select option with current variant
 * @param  { Object } $radioHolder   DOM Element - radio holder
 * @return { Void }
 */
function selectOptionAndSubmitForm($form, $select, $optionSelector, $radioHolder) {
  $select
    .find($optionSelector)
    .prop('selected', true)
    .trigger('change');

  ajaxSubmit($form, $radioHolder);
}

/**
 * Ajax add to cart
 * @param  { Object } $form DOM Element - form product with ajax
 * @param  { Object } $radioHolder DOM Element - radio holder
 * @return { Void }
 */
export function ajaxSubmit($form, $radioHolder) {
    const $cartDropdown = $('.cart .cart__inner');
    const $cart_popup = $( '.cart-popup__overlay' )
    const $cart_popup_slide = $( '.cart-popup__slide' )

  let formData = $form.serializeArray();
  const extraProductVariantId = $form[0].dataset.packagingProductVariantId
  if (typeof is_preorder != 'undefined') {
    if (is_preorder) {
      var bundleID = $('.form-product select[name="id"]').val();
      var selOption = $('.form-product select[name="id"]').find('option[value="' + bundleID + '"]');
      if (typeof $(selOption).attr('data-preorder') != 'undefined') {
        formData += '&properties[preorder]=' + $(selOption).attr('data-preorder');
      }
    }
  }

  if (extraProductVariantId) {
    const mainProductId = +formData[0].value;
    const quantity = +formData[formData.length - 1].value;
  
    formData = {
      items: [
        { id: mainProductId, quantity: quantity, properties: { isBeachHatsCollection: true } },
        { id: +extraProductVariantId, quantity: quantity, properties: { isPackagingProduct: true }}
      ]
    };
  }  

  $.ajax({
    url: '/cart/add.js',
    type: 'POST',
    dataType: 'json',
    data: formData,
    success: function() {
      $.ajax({
        url: '/cart',
        success: function(response) {
          const $response = $(response);
          const $result = $response.find('.main > .hidden > form').length
            ? $response.find('.main > .hidden > form')
            : $response.find('.main > .hidden > .cart-empty');

          $cartDropdown.find('form, .cart-empty').remove();

          $result.appendTo($cartDropdown);
          $cartDropdown.addClass('is-expanded');
          $cart_popup.addClass('open');
          $cart_popup_slide.addClass('open-slide');

          $('body').css('overflow', 'hidden');

          if(typeof $radioHolder != 'undefined') {
            $radioHolder
              .removeClass('is-active')
              .find('input:checked')
              .prop('checked', false);
          }

          adjust_cart_with_bundles();
          
          $.ajax({
            dataType: "json",
            url: '/cart.js',
            success: (res) => {
              if(HOLIDAY_ACTIVE || BUYONEGETONE_ACTIVE) {
                checkAvailableGifts(res);
              }
            }
          });
        }
      });
    }
  });
}

export function ajaxSubmitBundled($form) {

    const $cartDropdown = $('.cart .cart__inner');
    const $cart_popup = $( '.cart-popup__overlay' )
    const $cart_popup_slide = $( '.cart-popup__slide' )

  var counts_included = 0;
  for(var i=1; i<9;i++) {
    if($('#id_included_product_'+i).length > 0) {
      counts_included += 1;
    }
  }

  var counts_loop = 0;
  for(var i=8; i>0;i--) {
    if($('#id_included_product_'+i).length > 0) {
      var options = $('.form-product select[name="id"]').data('options');
      options = options.split(",");
      var bundleID = $('.form-product select[name="id"]').val();
      var selOption = $('.form-product select[name="id"]').find('option[value="' + bundleID + '"]');
      var _color_name = $('#id_included_product_'+i).data('color-name');

      var variantOptions = [];
      for(var j=0; j<options.length;j++) {
        variantOptions.push({ name: options[j], value: $(selOption).data(options[j]) });
      }

      var variantId = 0;
      $('#id_included_product_'+i + ' option').each(function(j){
        var _cnt = 0;
        for(var m in variantOptions) {
          var variantOptionsItem = variantOptions[m];
          if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
            _cnt += 1;
          }
        }

        if(_color_name != '') {
          _cnt = 0;
          if(typeof $(this).data('color') == 'undefined') {
            _cnt = 1;
            _color_name = $('.list-radios-boxes input:checked').val();
            for(var m in variantOptions) {
              var variantOptionsItem = variantOptions[m];
              switch(variantOptionsItem.name) {
                case 'size':
                  if(_color_name == $(this).data(variantOptionsItem.name)) {
                    _cnt++;
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
                    _cnt++;
                  }
                  break;
                case 'size':
                  if(variantOptionsItem.value == $(this).data(variantOptionsItem.name)) {
                    _cnt++;
                  }
                  break;
              }
            }
          }
        }

        if(_cnt == variantOptions.length) {
          variantId = $(this).val();
        }
      });

      var qty = parseInt($('.form-product input[name="quantity"]').val());

      var params = {
        "id": variantId, 
        "quantity": qty, 
        "properties": {
          "Bundle Image": $(selOption).data('image'),
          "Bundle Title": $('.section-product .section__title').html(),
          "Bundle Variant Title": $(selOption).data('variant-title'),
          "Bundle Item Title": $('#id_included_product_'+i).data('title'),
          "Bundle URL": $(selOption).data('url')
        }
      };

      if (typeof $(selOption).attr('data-preorder') != 'undefined') {
        params['properties']['preorder'] = $(selOption).attr('data-preorder');
      }

      $.ajax({
        url: '/cart/add.js',
        type: 'POST',
        dataType: 'json',
        data: params,
        async: false,
        success: function() {
          counts_loop += 1;

          if(counts_loop == counts_included) {
            $.ajax({
              url: '/cart',
              success: function(response) {
                const $response = $(response);
                const $result = $response.find('.main > .hidden > form').length
                  ? $response.find('.main > .hidden > form')
                  : $response.find('.main > .hidden > .cart-empty');

                $cartDropdown.find('form, .cart-empty').remove();

                $result.appendTo($cartDropdown);

                $cartDropdown.addClass('is-expanded');
                $cart_popup.addClass('open');
                $cart_popup_slide.addClass('open-slide');
                $('body').css('overflow', 'hidden');
                adjust_cart_with_bundles();
              }
            });
          }
        }
      });
    }
  }
}

/**
 * This is a callback from monogram addToCart
 */
function monogramSubmit() {
  adjust_cart_with_bundles();
  if(HOLIDAY_ACTIVE)
  {
    $.ajax({
      dataType: "json",
      url: '/cart.js',
      success: (res) => {
        checkAvailableGifts(res)
      }
    });
  }
}
window.monogramSubmit = monogramSubmit;

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function adjust_cart_with_bundles() {
  if($('.section-cart').length > 0) {
    var bundled_titles = [];
    $('.section-cart tbody tr').each(function(i) {
      var bundle_title = $(this).data('bundle-title');
      if(bundle_title != "-") {
        bundled_titles.push(bundle_title);
      }
    });

    var bundled_titles = bundled_titles.filter(onlyUnique);

    for(var i=0; i < bundled_titles.length; i++) {
      if($('.section-cart tbody tr[data-bundle-title="' + bundled_titles[i] + '"]').length > 1) {
        var _cnts = $('.section-cart tbody tr[data-bundle-title="' + bundled_titles[i] + '"]').length;
        var first = $('.section-cart tbody tr[data-bundle-title="' + bundled_titles[i] + '"]')[0];
        var included_products_list = $(first).find('.cart-product__includes ul');
        for(var m=1; m < _cnts; m++) {
          var first_price = parseFloat($(first).find('.cart-product__price > span').html().replace('$',''));
          var item = $('.section-cart tbody tr[data-bundle-title="' + bundled_titles[i] + '"]')[m];
          var item_price = parseFloat($(item).find('.cart-product__price > span').html().replace('$',''));
          var new_price = first_price + item_price;
          $(first).find('.cart-product__price > span').html('$' + new_price.toFixed(2));

          var first_original_price = 0;
          if($(first).find('.cart-product__price del').length > 0) {
            first_original_price = parseFloat($(first).find('.cart-product__price del span').html().replace('$',''));

            var item_original_price = parseFloat($(item).find('.cart-product__price > span').html().replace('$',''));
            if($(item).find('.cart-product__price del').length > 0) {
              item_original_price = parseFloat($(item).find('.cart-product__price del span').html().replace('$',''));
            }
            var new_original_price = first_original_price + item_original_price;
            $(first).find('.cart-product__price del span').html('$' + new_original_price.toFixed(2));
          }

          var included_str = $(item).find('.cart-product__includes ul').html();
          $(included_products_list).append(included_str);

          $(item).hide();
        }
      }
    }
  }

  if($('.header__inner .cart__inner-body').length > 0) {
    var inner_bundled_titles = [];
    $('.header__inner .cart__inner-body .product').each(function(i) {
      var bundle_title = $(this).data('bundle-title');
      if(bundle_title != "-") {
        inner_bundled_titles.push(bundle_title);
      }
    });

    var inner_bundled_titles = inner_bundled_titles.filter(onlyUnique);
    
    for(var i=0; i < inner_bundled_titles.length; i++) {
      if($('.header__inner .cart__inner-body .product[data-bundle-title="' + inner_bundled_titles[i] + '"]').length > 1) {
        var _cnts = $('.header__inner .cart__inner-body .product[data-bundle-title="' + inner_bundled_titles[i] + '"]').length;
        var first = $('.header__inner .cart__inner-body .product[data-bundle-title="' + inner_bundled_titles[i] + '"]')[0];
        var included_products_list = $(first).find('.product__includes ul');

        for(var m=1; m < _cnts; m++) {
          var first_price = parseFloat($(first).find('.product__price > span').html().replace('$',''));
          var item = $('.header__inner .cart__inner-body .product[data-bundle-title="' + inner_bundled_titles[i] + '"]')[m];
          var item_price = parseFloat($(item).find('.product__price > span').html().replace('$',''));
          var new_price = first_price + item_price;
          $(first).find('.product__price > span').html('$' + new_price.toFixed(2));

          var first_original_price = 0;
          if($(first).find('.product__price del').length > 0) {
            first_original_price = parseFloat($(first).find('.product__price del span').html().replace('$',''));

            var item_original_price = parseFloat($(item).find('.product__price > span').html().replace('$',''));
            if($(item).find('.product__price del').length > 0) {
              item_original_price = parseFloat($(item).find('.product__price del span').html().replace('$',''));
            }
            var new_original_price = first_original_price + item_original_price;
            $(first).find('.product__price del span').html('$' + new_original_price.toFixed(2));
          }

          var included_str = $(item).find('.product__includes ul').html();
          $(included_products_list).append(included_str);
          
          $(item).hide();
        }
      }
    }
  }

  updateMenuCartIconQty();
}
adjust_cart_with_bundles();

function adjust_giftcard_lineitem() {

}

function adjust_afterpay_incart(response) {
  var $sectionAfterpay = $('.afterpay-variables-script');
  $sectionAfterpay.empty().html($(response).find('.afterpay-variables-script').html());
}

function changeCart($element) {
  const $cartForm = $element.closest('form');
  const $cartDropdown = $('.cart .cart__inner');
  const $sectionCart = $('.section-cart');
  var $eleParent = null;
  if($element.parents('tr.cart-product').length > 0) {
    $eleParent = $element.parents('tr.cart-product');
  } else if($element.parents('div.product').length > 0) {
    $eleParent = $element.parents('div.product');
  } 

  var variant_id = $eleParent.data('variant-id');

  // start - process monogram
  var $eleParentTop = null;
  if($element.parents('div.table-cart').length > 0) {
    var monogramProductID = '';
    var monogramProductQtys = 0;
    $eleParentTop = $element.parents('div.table-cart');
    $eleParentTop.find('tr.cart-product').each(function(i){
      var monogram_id = $(this).data('monogram');
      if(monogram_id != '') {
        var _qty = $(this).find('input.counter__field').val();
        monogramProductQtys += parseInt(_qty);
        monogramProductID = monogram_id;
      }
    });

    if(monogramProductID != '') {
      $eleParentTop.find('tr.cart-product[data-variant-id="' + monogramProductID + '"] input.counter__field').val(monogramProductQtys);
    }

  } else if($element.parents('div.products-simple').length > 0) {
    var monogramProductID = '';
    var monogramProductQtys = 0;
    $eleParentTop = $element.parents('div.products-simple');
    $eleParentTop.find('div.product').each(function(i){
      var monogram_id = $(this).data('monogram');
      if(monogram_id != undefined && monogram_id != '') {
        var _qty = $(this).find('input.counter__field').val();
        monogramProductQtys += parseInt(_qty);
        monogramProductID = monogram_id;
      }
    });

    if(monogramProductID != '') {
      $eleParentTop.find('div.product[data-variant-id="' + monogramProductID + '"] input.counter__field').val(monogramProductQtys);
    }
  }

  // end - process monogram

  var bundle_title = $eleParent.data('bundle-title');

  if(bundle_title == "-") {
    $.ajax({
      url: '/cart/update.js',
      data: $cartForm.serialize(),
      dataType: 'json'
    }).done(function(cartData) {
      function updateUI() {
        $.ajax({
          url: '/cart'
        }).done(function(response) {
          let $response = $(response);
          
          const $resultDropdown = $response.find('.main > .hidden > form').length
            ? $response.find('.main > .hidden > form')
            : $response.find('.main > .hidden > .cart-empty');
  
          const $resultCartContent = $response.find('.main > .section-cart > .shell');
  
          $cartDropdown.find('form, .cart-empty').remove();
  
          if ($sectionCart.length) {
            $sectionCart.empty().html($resultCartContent.clone(true));
          }
  
          $cartDropdown.find('form, .cart-empty').remove();
          $resultDropdown.appendTo($cartDropdown);
  
          adjust_cart_with_bundles();
  
          // process giftbox counts
          adjust_giftcard_lineitem();
  
          adjust_afterpay_incart($response);
  
          $cartDropdown.find('.product[data-variant-id="' + variant_id + '"] .product__image a').focus();
        });
      }

      if(HOLIDAY_ACTIVE || BUYONEGETONE_ACTIVE) {
        checkAvailableGifts(cartData, updateUI);
      } else {
        updateUI();
      }

      if($element[0].dataset.collectionName == 'beach-hats'){
        setTimeout(() => {
          let beachHatsQty = 0;
          let beachHatsContainer = $('.cart-items tr:not(.hidden)').length > 0 ? $('.cart-items tr:not(.hidden)') : $('.cart__inner-body .product:not(.hidden)'); 
          let beachHats = beachHatsContainer.find('[data-collection-name="beach-hats"]');
          let packagingProductVariantId = $('[data-is-packaging-product="true"]')[0].dataset.variantId;
          for(let i=0; i<beachHats.length; i++){
            beachHatsQty += parseInt($(beachHats[i]).val());  
          }
          fetch('/cart/update.js', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              updates: {
                [packagingProductVariantId]: beachHatsQty
              }
            })
          })
        }, 2000);
      }
    });
  } else {
    var qty = parseInt($element.parent().find('input').val());
    for(var j=1; j< $eleParent.parent().find('[data-bundle-title="' + bundle_title + '"]').length; j++) {
      var _pItem = $eleParent.parent().find('[data-bundle-title="' + bundle_title + '"]')[j];
      $(_pItem).find('input').val(qty);
    }

    $.ajax({
      url: '/cart/update.js',
      data: $cartForm.serialize(),
      dataType: 'json'
    }).done(function() {
      $.ajax({
        url: '/cart'
      }).done(function(response) {
        let $response = $(response);

        const $resultDropdown = $response.find('.main > .hidden > form').length
          ? $response.find('.main > .hidden > form')
          : $response.find('.main > .hidden > .cart-empty');

        const $resultCartContent = $response.find('.main > .section-cart > .shell');

        $cartDropdown.find('form, .cart-empty').remove();

        if ($sectionCart.length) {
          $sectionCart.empty().html($resultCartContent.clone(true));
        }

        $cartDropdown.find('form, .cart-empty').remove();
        $resultDropdown.appendTo($cartDropdown);

        adjust_cart_with_bundles();

        // process giftbox counts
        adjust_giftcard_lineitem();

        adjust_afterpay_incart($response);

        $cartDropdown.find('.product[data-variant-id="' + variant_id + '"] .product__image a').focus();
      });
    });

  }
}

// ====================== BEGIN [GENERAL FUNCTIONS - CUSTOM CODE]

var giftsToBeAddedArr = [];
var giftsToBeSubstractedArr = [];

/**
 * This function returns the right gift from front cart
 * based on properties like 'is-holiday-gift' or
 * 'is-bogo-gift' and 'promotion-number'
 * 
 * @param {number} giftVariantId 
 * @param {string} giftTargetDataName 
 * @param {number} bogoPromotionNumber
 * @param {boolean} fromMinicart 
 */
function getCartGift(giftVariantId, giftTargetDataName, fromMinicart = true, bogoPromotionNumber = -1){
  var isTargetGiftFound = false;
  var $cartGifts = [];
  var $cartGift = [];

  if(fromMinicart)
  $cartGifts = $("header .cart .product[data-variant-id='"+giftVariantId+"']");
  else
  $cartGifts = $(".table-cart .cart-product[data-variant-id='"+giftVariantId+"']");

  for (let i = 0; i < $cartGifts.length; i++) {
    $cartGift = $($cartGifts[i]);

    if($cartGift.data(giftTargetDataName))
    {
      if(bogoPromotionNumber != -1)
      {
        if($cartGift.data('bogo-promo-number') == bogoPromotionNumber){
          isTargetGiftFound = true;
          break;  
        }
      }
      else {
        isTargetGiftFound = true;
        break;
      }
    }
  }

  if(!isTargetGiftFound)
  $cartGift = [];

  return $cartGift;
}

/**
 * This function checks for available gifts in
 * this promotions:
 * - Holiday
 * - BOGO
 * 
 * Any other new promo must be included here as well.
 * 
 * Then, with the prepared arrays of additionsa and substractions,
 * calls each action in order add -> substract
 * 
 * @param {object} getCartRes
 * 
 */
function checkAvailableGifts(getCartRes, cb){
  cb = typeof cb === 'function' ? cb : () => {}

  new Promise((res) => {
    if(HOLIDAY_ACTIVE){
      holidayCheckAvailableGifts(getCartRes)
    }
    
    if(BUYONEGETONE_ACTIVE){
      prepareMiniCartCollectionsIds();
      bogoCheckAvailableGifts();
    }

    var addCallback;

    if(giftsToBeSubstractedArr.length > 0){
      addCallback = () => {
        substractGiftsFromCart(giftsToBeSubstractedArr, res)
      };
    }

    // Calls add and then substract
    if(giftsToBeAddedArr.length > 0){
      addGiftsToCart(giftsToBeAddedArr, addCallback);
    }
    else if(giftsToBeSubstractedArr.length > 0){
      substractGiftsFromCart(giftsToBeSubstractedArr, res);
    }
    else {
      res();
    }
  }).then(cb);
  updateMenuCartIconQty();
}

/**
 * Add gifts to cart.
 * 
 * @param {arr of objects} items {id:number, quantity:number, properties:obejct}
 * @param {function} onFinishCallback 
 */
function addGiftsToCart(items, onFinishCallback){
  var ajaxParams = {
    url: '/cart/add.js',
    type: 'POST',
    dataType: 'json',
    data: JSON.stringify({items: items}),
    contentType: "application/json"
  };
  
  $.ajax(ajaxParams)
  .done(onGiftsAdded)
  .fail((error) => {
    console.error('Some error occurred:', error);
  })
  .always(()=>{
    updateMenuCartIconQty();
    giftsToBeAddedArr = [];

    if(typeof onFinishCallback === 'function')
    onFinishCallback();
  });
}

/**
 * Callback called on addGiftsToCart success
 * 
 * @param {object} res 
 */
function onGiftsAdded(res){
  let holidayGiftLines = [];
  let bogoGiftLines = [];

  for (let i = 0; i < res.items.length; i++) {
    
    if(res.items[i].properties.isHolidayGift)
    holidayGiftLines.push(res.items[i]);

    if(res.items[i].properties.isBogoGift)
    bogoGiftLines.push(res.items[i]);
  }

  if(holidayGiftLines.length > 0)
  onHolidayGiftAdded(holidayGiftLines);
  if(bogoGiftLines.length > 0)
  onBogoGiftAdded(bogoGiftLines);
}

/**
 * 
 * Substracts 1 gift unit from backend using hash (unique key)
 * because of possible same gift between differents bogo
 * promotions or holiday gift.
 * 
 * Then, updates front.
 * 
 * @param {arr of objects} items {id:number, quantity:number, dataNameGiftTarget:string, bogoPromoNumber:number}
 */
function substractGiftsFromCart(items, onFinishCallback){
  let updateQueryArr = [];
  let $cartGiftProduct = [];
  let newGiftQty;
  
  let giftToBeSubstracted;
  for (let i = 0; i < items.length; i++) {
    giftToBeSubstracted = items[i];
    $cartGiftProduct = getCartGift(giftToBeSubstracted.id, giftToBeSubstracted.dataNameGiftTarget, true, giftToBeSubstracted.bogoPromoNumber);
    newGiftQty = giftToBeSubstracted.quantity;
    
    updateQueryArr.push("updates["+$cartGiftProduct.data('key')+"]="+newGiftQty);
  }
  
  jQuery.post('/cart/update.js', updateQueryArr.join('&'), res => {
    for (let i = 0; i < items.length; i++) {
      giftToBeSubstracted = items[i];
      $cartGiftProduct = getCartGift(giftToBeSubstracted.id, giftToBeSubstracted.dataNameGiftTarget, true, giftToBeSubstracted.bogoPromoNumber);
      newGiftQty = giftToBeSubstracted.quantity;
      
      // Update front-end qtys
      if(newGiftQty > 0){
        updateGiftQtyInCarts(giftToBeSubstracted.id, giftToBeSubstracted.dataNameGiftTarget, giftToBeSubstracted.bogoPromoNumber, giftToBeSubstracted.quantity);
      }
      // Remove gifts
      else{
        //MiniCart
        $cartGiftProduct = getCartGift(giftToBeSubstracted.id, giftToBeSubstracted.dataNameGiftTarget, true, giftToBeSubstracted.bogoPromoNumber).remove();
        // TableCart
        $cartGiftProduct = getCartGift(giftToBeSubstracted.id, giftToBeSubstracted.dataNameGiftTarget, false, giftToBeSubstracted.bogoPromoNumber);
        
        if($cartGiftProduct.length > 0)
        $cartGiftProduct.remove();
      }
    }

    // finish
    updateMenuCartIconQty();
    giftsToBeSubstractedArr = []; 
    
    if(typeof onFinishCallback === 'function')
    onFinishCallback(JSON.parse(res));
  });
}

/**
 * This function updates the subnumber on
 * the header's menu cart icon checking
 * front-end cart.
 * 
 * This was in this theme previously and was extracted
 * to a function for reutilization only.
 * 
 */
 function updateMenuCartIconQty(){
  // update item counts in mini cart
  var all_item_counts = 0;
  $('.header__inner .cart__inner-body .product').each(function(i){
    if($(this).css('display') != 'none') {
      var _qty = $(this).find('input.counter__field').val();
      all_item_counts += parseInt(_qty);
    }
  });
  if(all_item_counts > 0) {
    $('.cart__link span').text(all_item_counts);
  } else {
    $('.cart__link span').text('');
  }
}

/**
 * This function hides the counter control and
 * the remove btn of the gift cart item.
 * Changes the prices to zero and creates a label with
 * format 'Qty: X'.
 * 
 * @param {string} dataNameGiftTarget
 * @param {number} giftVariantId
 * @param {number} bogoPromoNumber
 * @param {number} giftQty
 * @param {string} giftText
 * @param {string} giftColor
 * 
 */
function prepareGiftControls(dataNameGiftTarget, giftVariantId, bogoPromoNumber, giftQty, giftText, giftColor){
  //----- TableCart -----
  // Price
  var $cartGift = getCartGift(giftVariantId, dataNameGiftTarget, false, bogoPromoNumber);

  let $giftPrice;
  let $customQtyField;
  let $giftDesc;
  
  let name;

  if($cartGift.length > 0){
    $giftPrice = $cartGift.find('.cart-product__price > span.money');
    $($giftPrice[0]).text(Shopify.formatMoney(0));
    $($giftPrice[0]).data('gip-original-value', 0);
    $($giftPrice[1]).text(Shopify.formatMoney(0)); // Price mobile
    $($giftPrice[1]).data('gip-original-value', 0); // Price mobile
    $giftPrice.css('display', 'none');
    
    $cartGift.find('.cart-product__inner').css('width', '100%');
  
    // Remove btn
    $cartGift.find('.cart__product-remove_item').css('display', 'none');
  
    // Counter
    if($cartGift.find('.cart-product__content .gift-desc').length == 0){
      $cartGift.find('.cart-product__counter .counter').css('display', 'none');
    
      $customQtyField = $('<label>');
      $customQtyField.text('Qty: ');
      $customQtyField.append('<span>'+giftQty+'</span>');
      
      $cartGift.find('.cart-product__counter').append($customQtyField);
      $giftDesc = $('<span>');
      $giftDesc.addClass('gift-desc');
      $giftDesc.text(giftText);
      $giftDesc.css('color', giftColor);
      $cartGift.find('.cart-product__content').append($giftDesc);
    }
  
    // Remove link to gift PDP page
    name = $cartGift.find('.cart-product__content h6 a').text();
    $cartGift.find('.cart-product__content h6 a').remove();
    $cartGift.find('.cart-product__content h6').text(name);
    
    $cartGift.find('.cart-product__image').append($cartGift.find('.cart-product__image img'));
    $cartGift.find('.cart-product__image a').remove();
  }

  //----- MiniCart -----
  $cartGift = getCartGift(giftVariantId, dataNameGiftTarget, true, bogoPromoNumber);

  if($cartGift.length > 0){
    // Price
    $giftPrice = $cartGift.find('.product__price > span.money');
    
    $($giftPrice[0]).text(Shopify.formatMoney(0));
    $($giftPrice[0]).data('gip-original-value', 0);
    $($giftPrice[1]).text(Shopify.formatMoney(0)); // Price mobile
    $($giftPrice[1]).data('gip-original-value', 0); // Price mobile
    $giftPrice.css('display', 'none');
  
    // Remove btn
    $cartGift.find('.cart__inner-remove_item').css('display', 'none');
  
    // Counter
    $cartGift.find('.product__counter .counter').css('display', 'none');

    // prevents qty label stacking
    if($cartGift.find('.custom-gift-qty').length == 0){
      $customQtyField = $('<label>');
      $customQtyField.addClass('custom-gift-qty');
      $customQtyField.text('Qty: ');
      $customQtyField.append('<span>'+giftQty+'</span>');

      $cartGift.find('.product__counter').append($customQtyField);
    }

    
    if($cartGift.find('.product__content .gift-desc').length == 0){
      $giftDesc = $('<span>');
      $giftDesc.addClass('gift-desc');
      $giftDesc.text(giftText);
      $giftDesc.css('color', giftColor);
      $cartGift.find('.product__content').append($giftDesc);
    }
    
    // Remove link to gift PDP page
    name = $cartGift.find('.product__content h6 a').text();
    $cartGift.find('.product__content h6 a').remove();
    $cartGift.find('.product__content h6').text(name);
    
    $cartGift.find('.product__image').append($cartGift.find('.product__image img'));
    $cartGift.find('.product__image a').remove();
  }
  
}
window.prepareGiftControls = prepareGiftControls;

/**
 * This function renders the new cart item
 * visually in the front.
 * Then, calls prepareGiftControls()
 * 
 * @param {object} cartItem
 * @param {string} targetCartGiftDataName
 * @param {number} bogoPromoNumber
 * @param {string} cartItemKey
 */
function generateVisualCartItem(cartItem, targetCartGiftDataName, bogoPromoNumber = -1, cartItemKey = ''){
  var $newCartItem;
  
  for(let i = 0; i < 2; i++){
    if(i == CART_TYPE.MINI_CART){
      $newCartItem = $('<div class="product"><figure class="product__image"><a href="#"><img src="" alt=""></a></figure><div class="product__content"><h6 class="product__title"><a href="#">Title</a></h6><p class="product__price"><span class="money">$0.00</span></p><ul><li>Dusk / Ivory</li><li>XS</li></ul><div class="product__counter_price"><div class="product__counter"><div class="counter js-counter js-counter-ajax"><span class="counter__minus js-counter-minus">&nbsp;</span><label class="hidden">Qty</label><input type="number" class="counter__field js-counter-field" name="updates[]" value="1" min="0"><span class="js-counter-plus counter__plus">&nbsp;</span></div></div><p class="product__price"><span class="money">$0.00</span></p></div></div><a class="cart__inner-remove_item"><i class="ico-close"></i></a><div class="cart-out-stock-error-message hidden">Current stock limit reached.</div></div>');
    }
    else {
      $newCartItem = $('<tr class="cart-product"><td><figure class="cart-product__image"><a href="#"><img src="" alt=""></a></figure></td><td colspan="2"><div class="cart-product__inner"><div class="cart-product__content"><h6><a href="#">Title</a></h6><p class="cart-product__price"><span class="money notranslate">$0.00</span></p><ul><li>Dusk / Ivory</li><li>XS</li></ul></div><div class="cart-product__counter"><div class="counter js-counter js-counter-ajax"><span class="counter__minus js-counter-minus">&nbsp;</span><label class="hidden">Qty</label><input type="number" class="counter__field js-counter-field" name="updates[]" value="1" min="0"><span class="js-counter-plus counter__plus">&nbsp;</span></div></div><p class="cart-product__price hidden-xs hidden-sm"><span class="money notranslate">$0.00</span></p><a class="cart__product-remove_item"><i class="ico-close"></i></a><div class="cart-out-stock-error-message hidden">Current stock limit reached.</div></div></td></tr>');
    }
  
    // Cart product
    $newCartItem.attr('data-id', cartItem.id);
    $newCartItem.attr('data-variant-id', cartItem.variant_id);
    
    $newCartItem.data(targetCartGiftDataName, true);
    
    if(bogoPromoNumber > -1){
      $newCartItem.data('bogo-promo-number', bogoPromoNumber);
    }

    $newCartItem.data('key', cartItemKey);
  
    // Featured image
    let $productImge = i == CART_TYPE.MINI_CART ? $newCartItem.find('.product__image') : $newCartItem.find('.cart-product__image');
    $productImge.find('> a').prop('href', cartItem.url);
    $productImge.find('> a img').prop('src', cartItem.featured_image.url);
    $productImge.find('> a img').prop('alt', cartItem.featured_image.alt);
  
    // Content
    let $productContent = i == CART_TYPE.MINI_CART ? $newCartItem.find('.product__content') : $newCartItem.find('.cart-product__content');
    if(i == CART_TYPE.MINI_CART){
      $productContent.find('h6 a').prop('href', cartItem.url);
      $productContent.find('h6 a').text(cartItem.product_title);
    } else {
      $productContent.find('h6').text(cartItem.product_title);
    }
    $productContent.find('ul').empty();
    $productContent.find('ul').append(cartItem.variant_options.map((val) => { return $('<li>'+val+'</li>'); }));
  
    // Qty data
    let $productCounter = i == CART_TYPE.MINI_CART ? $newCartItem.find('.product__counter') : $newCartItem.find('.cart-product__counter');
    $productCounter.find('.counter__field').val(cartItem.quantity);

    if(i == CART_TYPE.MINI_CART)
    {
      $('.cart .products-simple').prepend($newCartItem);
    }
    else {
      $('.table-cart table tbody').prepend($newCartItem);
    }
  }
}

// ====================== END [GENERAL FUNCTIONS - CUSTOM CODE]


// ====================== BEGIN [HOLIDAY GIFT - CUSTOM CODE]

var HOLIDAY_ACTIVE = false;
var CHECK_PRODUCT_TRIGGER_FOR_GIFT = false;

/* 
-----
All these "consts" and vars are populated in holidaySetupGiftInfo()
-----
*/
var HOLIDAY_GIFT_VARIANT_ID;
var HOLIDAY_GIFT_PRICE;
var HOLIDAY_MIN_SUBTOTAL;
var HOLIDAY_GIFT_DESCRIPTION_TEXT;
var HOLIDAY_GIFT_DESCRIPTION_COLOR;

var holidayTriggerProductVariantIds = [];
/* 
-----
-----
*/

var CART_TYPE = {
  MINI_CART: 0,
  TABLE_CART: 1
};

$(function(){
  HOLIDAY_ACTIVE = $('.cart-popup__slide').data('setting-holiday-active');
  BUYONEGETONE_ACTIVE = $('.cart-popup__slide').data('buyonegetone-active');

  if(HOLIDAY_ACTIVE || BUYONEGETONE_ACTIVE){
    Shopify.getCart((cartRes)=>{
      if(HOLIDAY_ACTIVE)
      holidaySetupGiftInfo();
      if(BUYONEGETONE_ACTIVE)
      bogoSetupGiftInfo();

      checkAvailableGifts(cartRes);
    });
  }
  
  checkYotpoReviewsScrollLink();
});

/**
 * This function loads configs from admin
 */
function holidaySetupGiftInfo(){
  var $cartDataContainer = $('.cart-popup__slide');
  
  HOLIDAY_GIFT_VARIANT_ID = $cartDataContainer.data('setting-gift-prod');
  HOLIDAY_GIFT_PRICE = parseFloat($cartDataContainer.data('setting-gift-price')) / 100;
  HOLIDAY_MIN_SUBTOTAL = $cartDataContainer.data('setting-min-subtotal');

  HOLIDAY_GIFT_DESCRIPTION_TEXT = $cartDataContainer.data('setting-gift-desc-text');
  HOLIDAY_GIFT_DESCRIPTION_COLOR = $cartDataContainer.data('setting-gift-desc-color');
}

/**
 * Chekcs and sets up the event for the scroll.
 * Timeout needed as anchor button origin unidewntified.
 */
function checkYotpoReviewsScrollLink(){
  setTimeout(() => {
    var $yotpoReviews = $('.section-product .yotpo-bottomline.star-clickable');
    if(window.location.href.includes('/products/') && $yotpoReviews.length > 0){
      $yotpoReviews.on('click', () => {
        $([document.documentElement, document.body]).animate({
          scrollTop: $('#shopify-product-reviews').offset().top - (parseInt(window.innerHeight)*.25)
        }, 150);
      })
    }
  }, 2000);
}

/**
 * Check condition of gift and add/substract it
 */
function holidayCheckAvailableGifts(cartData){
  // |-----Initialize Gift controls-----|
  setTimeout(() => {
    prepareGiftControls('is-holiday-gift', HOLIDAY_GIFT_VARIANT_ID, -1, 1, HOLIDAY_GIFT_DESCRIPTION_TEXT, HOLIDAY_GIFT_DESCRIPTION_COLOR);
  }, 1000);
  
  var triggerProductInCart = false;

  /*if(CHECK_PRODUCT_TRIGGER_FOR_GIFT){
    for (let i = 0; i < holidayTriggerProductVariantIds.length; i++)
    {
      for (let j = 0; j < cartData.items.length; j++) {
        if(cartData.items[j].variant_id == holidayTriggerProductVariantIds[i]){
          triggerProductInCart = true;
        }
      }
    }
  }*/

  /*
  Flag to bypass product trigger validation
  and validate HOLIDAY_MIN_SUBTOTAL only.
  */ 
  if(!CHECK_PRODUCT_TRIGGER_FOR_GIFT)
  {
    triggerProductInCart = true;
  }

  let giftConditionPassed = false, currentQty = 0, cartItem, hasHolidayGift = false;
  for (let i = 0; i < cartData.items.length; i++)
  {
    cartItem = cartData.items[i];
    if(cartItem.variant_id == HOLIDAY_GIFT_VARIANT_ID && cartItem.properties.addedAsGift && cartItem.properties.isHolidayGift)
    {
      currentQty = cartItem.quantity;
      hasHolidayGift = true;
      break;
    }
  }

  giftConditionPassed = triggerProductInCart && parseFloat(cartData.items_subtotal_price / 100 - (hasHolidayGift ? HOLIDAY_GIFT_PRICE : 0)) >= HOLIDAY_MIN_SUBTOTAL;

  // if gift condition and gift not in cart, add gift
  if(giftConditionPassed && currentQty == 0)
  {
    giftsToBeAddedArr.push({
      id: HOLIDAY_GIFT_VARIANT_ID,
      quantity: 1,
      properties: {
        'addedAsGift': true,
        'isHolidayGift': true
      }
    });
  }
  // delete gift
  else if(!giftConditionPassed){
    var $cartGiftProduct = getCartGift(HOLIDAY_GIFT_VARIANT_ID, 'is-holiday-gift');

    if($cartGiftProduct.length > 0){
      giftsToBeSubstractedArr.push({
        id: HOLIDAY_GIFT_VARIANT_ID,
        quantity: 0,
        dataNameGiftTarget: 'is-holiday-gift'
      });
    }
  }
  // calibrate to one qty
  else if(currentQty > 1){
    giftsToBeSubstractedArr.push({
      id: HOLIDAY_GIFT_VARIANT_ID,
      quantity: 1, // new qty update
      dataNameGiftTarget: 'is-holiday-gift'
    });
  }
}

/**
 * Callback invoked on addGiftsToCart() success.
 * 
 * Generates visual item and updates visual cart icon
 * qty.
 * 
 * @param {object} holidayGiftLines 
 * 
 */
function onHolidayGiftAdded(holidayGiftLines){
  for (let i = 0; i < holidayGiftLines.length; i++) { 
    generateVisualCartItem(holidayGiftLines[i], 'is-holiday-gift', -1, holidayGiftLines[i].key);
    prepareGiftControls('is-holiday-gift', holidayGiftLines[i].variant_id, -1, 1, HOLIDAY_GIFT_DESCRIPTION_TEXT, HOLIDAY_GIFT_DESCRIPTION_COLOR);
  }
}

/**
 * This functions removes the holiday 
 * gift  from cart in gifts that have older version of
 * properties ( {addedAsGift: true} only) .
 * 
 * If old gift found, remove and refresh preventing
 * normal gift process.
 */
function removeOldHolidayGift(cartData){
  var cartItem;
  for (let i = 0; i < cartData.items.length; i++) {
    cartItem = cartData.items[i];
    if(cartItem.properties.addedAsGift && cartItem.properties.isHolidayGift == undefined && cartItem.properties.isBogoGift == undefined){
      jQuery.post('/cart/update.js', "updates["+cartItem.key+"]=0", res => {
        window.location.reload();
      });
      return true;
    }
  }

  return false;
}
// ====================== END [HOLIDAY GIFT - CUSTOM CODE]


// ====================== BEGIN [BUY ONE GET ONE - CUSTOM CODE]

var BUYONEGETONE_ACTIVE = false;

var BUYONEGETONE_GIFT_DESC_TEXT;
var BUYONEGETONE_GIFT_DESC_COLOR;
var BUYONEGETONE_COLLECTIONS = [];
var BUYONEGETONE_GIFT = [];
var BUYONEGETONE_GIFT_LIMIT;
var $cartDataContainer;
var bogoGiftCounterArr = [];

function bogoSetupGiftInfo(){
  $cartDataContainer = $('.cart-popup__slide');
  
  BUYONEGETONE_COLLECTIONS.push($cartDataContainer.data('buyonegetone-collections-1'));
  BUYONEGETONE_COLLECTIONS.push($cartDataContainer.data('buyonegetone-collections-2'));
  BUYONEGETONE_COLLECTIONS.push($cartDataContainer.data('buyonegetone-collections-3')); 
  BUYONEGETONE_GIFT.push($cartDataContainer.data('buyonegetone-gift-prod-1'));
  BUYONEGETONE_GIFT.push($cartDataContainer.data('buyonegetone-gift-prod-2'));
  BUYONEGETONE_GIFT.push($cartDataContainer.data('buyonegetone-gift-prod-3'));
  BUYONEGETONE_GIFT_LIMIT = $cartDataContainer.data('buyonegetone-gift-limit');
  BUYONEGETONE_GIFT_DESC_TEXT = $cartDataContainer.data('buyonegetone-gift-desc-text');
  BUYONEGETONE_GIFT_DESC_COLOR = $cartDataContainer.data('buyonegetone-gift-desc-color');
  bogoSetupCounters();
}

function bogoSetupCounters(){
  for(let i = 0; i < BUYONEGETONE_COLLECTIONS.length; i++){
    bogoGiftCounterArr.push(0);
    var $gift = getCartGift(BUYONEGETONE_GIFT[i], 'is-bogo-gift', true, i);

    if($gift.length > 0){
      bogoGiftCounterArr[i] = parseInt($gift.find(".js-counter-field").val())
    }
  }
}

/**
 * Check condition of gift and add/substract it
 */
function bogoCheckAvailableGifts(){
  // |-----Initialize Gift controls-----|
  for(let i = 0; i < BUYONEGETONE_GIFT.length; i++){
    var $cartGiftProduct = getCartGift(BUYONEGETONE_GIFT[i], 'is-bogo-gift', true, i);
    if($cartGiftProduct.length > 0){
      var giftQty = $cartGiftProduct.find(".js-counter-field").val();
      prepareGiftControls('is-bogo-gift', BUYONEGETONE_GIFT[i], i, giftQty, BUYONEGETONE_GIFT_DESC_TEXT, BUYONEGETONE_GIFT_DESC_COLOR);
    }
  }
  
  var $cartProducts = $('header .cart .product');
  var promotionCollectionArray = [];
  var bogoTriggerProductCounterArr = [];

  for(let i = 0; i < BUYONEGETONE_COLLECTIONS.length; i++){
    bogoTriggerProductCounterArr.push(0);
  }

  // |-----Count trigger products-----|
  var $cartProduct = [];
  for (let i = 0; i < $cartProducts.length; i++)
  {
    $cartProduct = $($cartProducts[i]);
    var dataCollectionsId = $cartProduct.data('collections-id');
    if(dataCollectionsId == undefined)
    continue;

    // skip gift
    if($cartProduct.data('is-bogo-gift'))
    continue;

    var productCollectionIds = dataCollectionsId.toString().split(',');

    for (let j = 0; j < productCollectionIds.length; j++) {
      for(let k = 0; k < BUYONEGETONE_COLLECTIONS.length; k++){
        // Check promotion condition
        promotionCollectionArray = BUYONEGETONE_COLLECTIONS[k].toString().split(',');

        if(productCollectionIds[j] != "" && promotionCollectionArray.includes(productCollectionIds[j])){
          bogoTriggerProductCounterArr[k] += parseInt($cartProduct.find('.js-counter-field').val());
        }
      }// End for k
    }// End for j
  }// End for i
  
  // |-----Add/Removes gifts when needed-----|
  var qtyUpdate = 0;
  var $cartGift = [];
  for(let i = 0; i < BUYONEGETONE_COLLECTIONS.length; i++){
    $cartGift = getCartGift(BUYONEGETONE_GIFT[i], 'is-bogo-gift', true, i);

    if(bogoTriggerProductCounterArr[i] > bogoGiftCounterArr[i] && bogoGiftCounterArr[i] < BUYONEGETONE_GIFT_LIMIT) {
      qtyUpdate = bogoTriggerProductCounterArr[i] - bogoGiftCounterArr[i];
      if(bogoGiftCounterArr[i] + qtyUpdate > BUYONEGETONE_GIFT_LIMIT)
      {
        qtyUpdate = BUYONEGETONE_GIFT_LIMIT - bogoGiftCounterArr[i] ;
      }
      
      giftsToBeAddedArr.push({
        id: BUYONEGETONE_GIFT[i],
        quantity: qtyUpdate, // Qty difference (adds exactly the difference)
        properties: {
          'addedAsGift': true,
          'isBogoGift': true,
          'bogoPromoNumber': i
        }
      });
      bogoGiftCounterArr[i] += qtyUpdate;
    }
    else if(bogoTriggerProductCounterArr[i] < bogoGiftCounterArr[i]){
      qtyUpdate = bogoTriggerProductCounterArr[i];

      // If no existing gifts, ignore
      if($cartGift.length > 0){
        giftsToBeSubstractedArr.push({
          id: BUYONEGETONE_GIFT[i],
          quantity: qtyUpdate, // New Qty (updates qty to this)
          dataNameGiftTarget: 'is-bogo-gift',
          bogoPromoNumber: i
        });
        bogoGiftCounterArr[i] = qtyUpdate;
      }
    }

  }

}

/**
 * 
 * @param {object} res 
 */
function onBogoGiftAdded(bogoGiftLines){
  let bogoPromoNumber;
  let giftVariantId;
  let $cartGift = [];

  for (let i = 0; i < bogoGiftLines.length; i++) {
    bogoPromoNumber = bogoGiftLines[i].properties.bogoPromoNumber;
    giftVariantId = bogoGiftLines[i].variant_id;
    $cartGift = getCartGift(giftVariantId, 'is-bogo-gift', true, bogoPromoNumber);

    if($cartGift.length > 0)
    updateGiftQtyInCarts(bogoGiftLines[i].id, 'is-bogo-gift', bogoPromoNumber, bogoGiftLines[i].quantity);
    else {
      generateVisualCartItem(bogoGiftLines[i], 'is-bogo-gift', bogoPromoNumber, bogoGiftLines[i].key);
      prepareGiftControls('is-bogo-gift', giftVariantId, bogoPromoNumber, bogoGiftLines[i].quantity, BUYONEGETONE_GIFT_DESC_TEXT, BUYONEGETONE_GIFT_DESC_COLOR);
    }
  }
}

/**
 * Catch collection Ids from pdp and drops in product on minicart.
 * Thisis for detecting product cart items that belongs to triggers collections.
 * 
 * Must be called only when in PDP.
 */
function prepareMiniCartCollectionsIds(){
  var collectionsIds = $('.form-product').data('collections-id');
  $("header .cart .product[data-collections-id='']").data('collections-id',collectionsIds);
}

/**
 * This function will update the quantity number
 * and discounted price in generated
 * visual gift Cart and MiniCart
 * 
 * @param {number} variantId
 * @param {number} bogoPromoNumber
 * @param {number} qtyUpdate
 */
function updateGiftQtyInCarts(variantId, dataNameGiftTarget, bogoPromoNumber, qtyUpdate){
  var giftUnitPrice;
  var giftSubtotalPrice;

  // -----MiniCart-----
  var $cartGift = getCartGift(variantId, dataNameGiftTarget, true, bogoPromoNumber);

  giftUnitPrice = parseInt($cartGift.data('original-unit-price'));
  giftSubtotalPrice = Shopify.formatMoney(giftUnitPrice * qtyUpdate);

  var $inputQty = $cartGift.find(".js-counter-field");
  var $customQtyField = $cartGift.find('.product__counter label span');
  $inputQty.val(qtyUpdate);
  $customQtyField.html(qtyUpdate);
  
  // Update discounted price
  var $giftPriceDel = $cartGift.find('.product__price del');
  if($giftPriceDel.length > 0){
    $($giftPriceDel[0]).text(giftSubtotalPrice);
    $($giftPriceDel[1]).text(giftSubtotalPrice); // Mobile
  }

  
  // -----TableCart-----
  $cartGift = getCartGift(variantId, dataNameGiftTarget, false, bogoPromoNumber);
  if($cartGift.length > 0){
    $customQtyField = $cartGift.find('.cart-product__counter label span');
    $inputQty = $cartGift.find(".js-counter-field");
    $inputQty.val(qtyUpdate);
    $customQtyField.html(qtyUpdate);
    
    // Update discounted price
    $giftPriceDel = $cartGift.find('.cart-product__price del');
    if($giftPriceDel.length > 0){
      $($giftPriceDel[0]).text(giftSubtotalPrice);
      $($giftPriceDel[1]).text(giftSubtotalPrice); // Mobile
    }
  }
}

// ====================== END [BUY ONE GET ONE - CUSTOM CODE]

// Counter
const $doc = $(document);

$doc.on('click', '.js-counter .js-counter-plus, .js-counter .js-counter-minus', function(event) {
  event.preventDefault();
  
  const $this = $(this);
  const $field = $this.parent().find('input.counter__field');

  let currentValue = +($field.val());
  const hasAjaxFunctionality = $this.parent().hasClass('js-counter-ajax');
  const $form = $this.closest('form');
  const isGiftBox = $this.parent().data('giftbox');

  cartOutStockErrorHandle($field, false);

  if ($this.hasClass('js-counter-plus')) {
    currentValue++;
    if (typeof $field.attr('data-max') != 'undefined') {
      var max = parseInt($field.attr('data-max'), 10) || 10000;
      if (max < currentValue) {
        cartOutStockErrorHandle($field, true);
        if (currentValue == (max + 1)) {
          currentValue = max;
          return;
        } else {
          currentValue = max;
        }
      }
    }
  }

  if ($this.hasClass('js-counter-minus')) {
    if (currentValue > 0) {
      currentValue--;
    }
  }
  
  $field.val(currentValue);

  $field.trigger('change');
});

$doc.on('change', '.js-counter-field', function(event) {
  const $this = $(this);
  const hasAjaxFunctionality = $this.parent().hasClass('js-counter-ajax');

  var bundleAvailable = true;
  var notBundle = true;
  var currentValue = parseInt($(this).val());

  var _prev_value = $(this).attr('data-prev-vale');
  $(this).attr('data-prev-vale', currentValue);

  cartOutStockErrorHandle($this, false);
  if (typeof $this.attr('data-max') != 'undefined') {
    var max = parseInt($this.attr('data-max'), 10) || 10000;
    if (max < currentValue) {
      cartOutStockErrorHandle($this, true);
      if (_prev_value < max) {
        $(this).val(_prev_value).trigger('change');
      } else {
        $(this).val(max).trigger('change');
      }
      
      return;
    }
  }

  if(!hasAjaxFunctionality) {
    var includedCounts = 0;
    for(var i=1; i<9;i++) {
      if($('#id_included_product_'+i).length > 0) {
        var variant_selOptValue = $('#id_included_product_'+i).val();

        var variant_selOpt = $('#id_included_product_'+i + ' option[value="' + variant_selOptValue + '"]');
        var variant_inventory_qty = parseInt($(variant_selOpt).data('inventory'));

        if((currentValue > variant_inventory_qty && variant_inventory_qty > 0) || variant_inventory_qty < 0) {
          bundleAvailable = false;
        }
        includedCounts = includedCounts + 1;
      }
    }

    if(includedCounts > 0) {
      notBundle = false;
    }
  }

  if (hasAjaxFunctionality) {
    if(bundleAvailable && notBundle) {
      event.preventDefault();
      changeCart($this);
    }
  } else {
    var addCartBtn = $('.form-product input[type="submit"]');
    var $parent = $(this).parents('.form-product');
    if(!notBundle) {
      event.preventDefault();

      if(bundleAvailable) {
        $(addCartBtn).val(cartbtn_status.add_to_cart);
        if(currentValue > 0) {
          $(addCartBtn).attr('disabled', false)
          $parent.find('.klaviyo-bis-trigger').hide();
          $parent.find('.preorder--message').hide();
        } else {
          if (is_preorder) {
            $(addCartBtn).attr('disabled', false).val(cartbtn_status.pre_order);
            $parent.find('.preorder--message').show();
            $parent.find('.klaviyo-bis-trigger').hide();
          } else {
            $(addCartBtn).attr('disabled', true)
          }
        }
      } else {
        if (is_preorder) {  
          $(addCartBtn).attr('disabled', false).val(cartbtn_status.pre_order);
          $parent.find('.preorder--message').show();
          $parent.find('.klaviyo-bis-trigger').hide();
        } else {
          $(addCartBtn).attr('disabled', true).val(cartbtn_status.out_of_stock);
        }
      }
    } else {
      var variant_selOptValue = $('.form-product select[name="id"]').val();
      var variant_selOpt = $('.form-product select[name="id"] option[value="' + variant_selOptValue + '"]');
      var variant_inventory_qty = parseInt($(variant_selOpt).data('inventory'));

      if((currentValue > variant_inventory_qty && variant_inventory_qty > 0) || variant_inventory_qty <= 0) {
        if (is_preorder) {
          $(addCartBtn).attr('disabled', false).val(cartbtn_status.pre_order);
          $parent.find('.preorder--message').show();
          $parent.find('.klaviyo-bis-trigger').hide();
        } else {
          $(addCartBtn).attr('disabled', true).val(cartbtn_status.out_of_stock);
        }
      } else {
        $(addCartBtn).val(cartbtn_status.add_to_cart);
        if(currentValue > 0) {
          $(addCartBtn).attr('disabled', false)
          $parent.find('.klaviyo-bis-trigger').hide();
          $parent.find('.preorder--message').hide();
        } else {
          if (is_preorder) {
            $(addCartBtn).attr('disabled', false).val(cartbtn_status.pre_order);
            $parent.find('.preorder--message').show();
            $parent.find('.klaviyo-bis-trigger').hide();
          } else {
            $(addCartBtn).attr('disabled', true)
          }
        }
      }
    }
  }
});

function cartOutStockErrorHandle($element, is_hidden=false) {
  if ($element.closest('td').length > 0) {
    $tdWrapper = $element.closest('td');
  } 
  if ($element.closest('.product').length > 0) {
    $tdWrapper = $element.closest('.product');
  }
    if ($tdWrapper.length > 0) {
      if ($tdWrapper.find('.cart-out-stock-error-message').length > 0) {
        if (is_hidden) {
          $tdWrapper.find('.cart-out-stock-error-message').removeClass('hidden');
        } else {
          $tdWrapper.find('.cart-out-stock-error-message').addClass('hidden');
        }
      }
    }
}

$doc.on('click', '.cart__inner-remove_item, .cart__product-remove_item', function(event) {

  var $eleParent = null;

  if($(this).parents('tr.cart-product').length > 0) {
    $eleParent = $(this).parents('tr.cart-product');
  } else if($(this).parents('div.product').length > 0) {
    $eleParent = $(this).parents('div.product');
  }

  $eleParent.find('input.js-counter-field').val(0).trigger('change');
  $eleParent.hide();
});

export {adjust_cart_with_bundles}