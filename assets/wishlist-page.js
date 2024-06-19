(function (window, $) {
  /* |--------------- Constants & Variables---------------| */
  var SOCIAL_URL_TEMPLATES = {
    FACEBOOK: 0,
    TWITTER: 1
  };
  var WHATEVER_PRODUCT_HANDLE = 'rosario-beach-bag-tan'; // used to access has-stock product template custom json endpoint
  var EMAIL_VAL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var $header, $wishlistContentsContainer, $emptyWishlistMessage, $cartDropdown,
    $iconEmailShare, $iconFacebookShare, $btnSocialEmailShare, $emailInformation,
    $inputToEmail, $inputToEmailError, $socialEmailShareResult, $containerKlaviyoModal, $productBeingSubscribedTo,
    $klaviyoProductNames, $klaviyoEmail, $klaviyoErrorMsg, $klaviyoSuccessMsg;
  
  /* |--------------- Functions & Methods---------------| */
  
  /**
   * Markup template of each front-end product
   */
  function getProductMarkup(isAccessory){
    var variantRedirection = '?variant={{epi}}';

    return `
    <div class="products">
      {{#products}}
      <div class="product" data-variant-id="{{epi}}">
        <a class="img-container" data-redirect-url="{{cprops.redirectUrl}}" href="{{du}}${!isAccessory ? variantRedirection : ''}" style="background-image: url({{iu}})"></a>
        <h2 class="product__title">{{dt}}</h2>
        <h3 class="product-subtitle">{{vi}}</h3>
        <span class="product-price">{{cu}}{{pr}}</span>
        <button class="btn btn--solid btn-add-to-cart">Add to cart</button>
        <i class="btn-remove-from-wl ico-close"></i>
      </div>
      {{/products}}
    </div>
    `;
  }

  /**
   * Generates visual products from wishlist
   */
  function refreshVisualItems(){
    $wishlistContentsContainer.empty();

    let wishlistId = window.customWLFunctions.getWishlist().wishlistId, products = [];
    if(wishlistId != null && wishlistId != 0){
      // Fetch and get full information of each product
      window._swat.fetchListDetails({lid: wishlistId}, (wishlist) => {
        if(wishlist.items != null) {
          products = wishlist.items;
        }

        products.sort((elA, elB) => {
          if(elA.cprops.dateAdded < elB.cprops.dateAdded){
            return 1;
          } else if(elA.cprops.dateAdded > elB.cprops.dateAdded){
            return -1;
          } else return 0;
        });
        
        if(products.length == 0){
          $wishlistContentsContainer.hide();
          $emptyWishlistMessage.show();
        } else {
          // Get wishlist items
          var formattedWishlistedProducts = products.map(function(product){
            product = SwymUtils.formatProductPrice(product);
            product.isInCart = _swat.platform.isInDeviceCart(product.epi) || (product.et == _swat.EventTypes.addToCart);
            product.variantinfo = (product.variants ? getVariantInfo(product.variants) : "");
            return product;
          });
          var nonAccessoryProducts = formattedWishlistedProducts.filter(function(elem){
            if(elem.cprops.pdpTemplate != 'product.accessories'){
              return elem;
            }
          });
          var accessoryProducts = formattedWishlistedProducts.filter(function(elem){
            if(elem.cprops.pdpTemplate == 'product.accessories'){
              return elem;
            }
          });

          var productCardsMarkup = SwymUtils.renderTemplateString(getProductMarkup(false), {products: nonAccessoryProducts});
          $wishlistContentsContainer.html(productCardsMarkup);
          productCardsMarkup = SwymUtils.renderTemplateString(getProductMarkup(true), {products: accessoryProducts});
          $wishlistContentsContainer.find('.products').append($(productCardsMarkup).children());
          
          afterRefreshingItems();
        }
      }, (err) => { console.log("An error has occurred getting list information" , err) });
    } else {
      $wishlistContentsContainer.hide();
      $emptyWishlistMessage.show();
    }
  }
  
  function getVariantInfo(variants){
    try {
      let variantKeys = ((variants && variants != "[]") ? Object.keys(JSON.parse(variants)[0]) : []) , variantinfo;
      if(variantKeys.length > 0){
        variantinfo = variantKeys[0];
        if(variantinfo == "Default Title"){
          variantinfo = "";
        }
      } else {
        variantinfo = "";
      }
      return variantinfo;
    } catch(err){
      return variants;
    }
  }

  /**
  * This method fetches visual objects and
  * remove the matching product
  * @param {int} variantId 
  */
  function removeVisualItem(variantId){
    let $product = $wishlistContentsContainer.find('.product[data-variant-id="' + variantId + '"]');
    $product.fadeOut({
      complete: () => {
        $product.remove();

        if($emailInformation.css('dispaly') != 'none'){
          $emailInformation.slideUp();
        }
      }
    })
  }

  function setupEvents(){
    $('.btn-remove-from-wl').on('click', (e) => {
      btnRemoveFromWLOnClick($(e.currentTarget).closest('.product').data('variant-id'));
    });

    $('.btn-add-to-cart').on('click', (e) => {
      if($(e.currentTarget).closest('.product').hasClass('is-sold-out')){
        onSoldOutClick(e);
      } else {
        onAddToCartClick(e);
      }
    });
  }

  /**
   * This function will add to cart the selected
   * faved product. If product is a bundle,
   * add each budle item instead.
   * @param {*} variantId 
   */
  function addToCart(variantId){
    let data = {
      items: []
    };
    let preorderData = $(`.product[data-variant-id="${variantId}"]`).data('preorder');
    
    data.items.push({
      id: variantId,
      quantity: 1
    });

    if (preorderData != undefined) {
      data.items[0].properties = {
        'preorder': preorderData
      };
    }
    
    $.ajax({
      url: '/cart/add.js',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify(data),
      contentType: "application/json",
      success: () => { onProductAddedToCart(variantId) }
    });
  }

  /**
   * Regenerates the visual cart panel
   */
  function refreshCart(){
    $.get('/cart', function(getRes){
      const $response = $(getRes),
        $result = $response.find('.main > .hidden > form').length
        ? $response.find('.main > .hidden > form')
        : $response.find('.main > .hidden > .cart-empty');

      $cartDropdown.find('form, .cart-empty').remove();
      let cart_popup = $( '.cart-popup__overlay' )
      let cart_popup_slide = $( '.cart-popup__slide' )

      $result.appendTo($cartDropdown);

      $cartDropdown.addClass('is-expanded');
      cart_popup.addClass('open');
      cart_popup_slide.addClass('open-slide');

      $('body').css('overflow', 'hidden');
      window.customWLFunctions.updateMenuCartIconQty();
    });
  }

  /**
   * Client requested to remove parenthesis content
   * from variant options
   * 
   * @param {$el} $product 
   */
  function removeParenthesisContent($product){
    let $productSubtitle = $product.find('.product-subtitle');

    if($productSubtitle.text().includes('(')){
      let currentSubtitle, newSubtitle = '', firstIndex, secondIndex;
      
      currentSubtitle = $productSubtitle.text();
  
      if(currentSubtitle.includes('(')){
        firstIndex = currentSubtitle.indexOf('(');
        secondIndex = currentSubtitle.indexOf(')');
        newSubtitle = currentSubtitle.substring(0, firstIndex-1) + currentSubtitle.substring(secondIndex+1);
        $productSubtitle.text(newSubtitle);
      }
    }
  }

  /**
   * Check if faved product is already added
   * and mark it
   * 
   * @param {$el} $product 
   */
  function checkAlreadyAddedProduct($product){
    let wlProduct, alreadyAdded = false, bundledVariantIds = [], $target;
    wlProduct = window.customWLFunctions.getWLItemFromLocalStorage($product.data('variant-id'));

    // // Bundle Product
    // if($product.hasClass('is-bundle')){
    //   bundledVariantIds = wlProduct.cprops.bundledItems.map((bundledItem, i) => { return bundledItem.id });

    //   $target = $cartDropdown.find('.mainBundle .btn-remove-bundle[data-variant-id="' + bundledVariantIds.join() + '"]');
    //   if($target.length > 0){
    //     alreadyAdded = true;
    //   }
    // // Normal product
    // } else {
      $target = $cartDropdown.find('.product[data-variant-id="' + wlProduct.epi + '"]');
      if($target.length > 0){
        alreadyAdded = true;
      }
    // }

    if(alreadyAdded){
      markProductAsAddedToCart($product);
      alreadyAdded = false;
    }
  }

  /**
   * Marks this product as already added to
   * cart, changes the text and disables it
   * 
   * @param {$el} $product 
   */
  function markProductAsAddedToCart($product){
    let $btnAddToCart;
    $product.addClass('added-to-cart');
    $btnAddToCart = $product.find('.btn-add-to-cart');

    $btnAddToCart.text('added to cart')
      .prop('disabled', true);
  }
  
  /**
   * This function will mark prices as slashed
   * on bundles.
   * 
   * If marking compareAt prices is needed, this can also be done here.
   * 
   * @param {$el} $product 
   */
  function styleDiscountedPriceIfAny($product){
    let isCompareAtDiscount = false, wlProduct, $productPrice, $slashedPrice;
    wlProduct = window.customWLFunctions.getWLItemFromLocalStorage($product.data('variant-id'));

    isCompareAtDiscount = wlProduct.cprops.discountedPrice != undefined;

    if(wlProduct.cprops.applyDiscount || isCompareAtDiscount){
      $productPrice = $product.find('.product-price');
      $slashedPrice = $productPrice.clone();
      $slashedPrice.removeClass('product-price').addClass('slashed-price');
      
      if(wlProduct.cprops.applyDiscount){
        $slashedPrice.text($productPrice.text());
        $productPrice.text(Shopify.formatMoney(wlProduct.cprops.discountedPrice));
        
      } else if(isCompareAtDiscount){
        $slashedPrice.text(Shopify.formatMoney(wlProduct.cprops.discountedPrice));
        $productPrice.text($productPrice.text());
      }

      $productPrice.after($slashedPrice);
      $product.addClass('product-with-discount');
    }
  }

  function sendSocialShareEmail(){
    let wishlistId, emailParams = {};
    $socialEmailShareResult.removeClass('error');

    wishlistId = window.customWLFunctions.getWishlist().wishlistId;
    
    emailParams = {
      toEmailId: $inputToEmail.val(),
      fromName: '',
      notes: '',
      lid: wishlistId
    };

    window._swat.sendListViaEmail(emailParams, (res) => {
      $inputToEmail.val('');
      $btnSocialEmailShare.hide();
      $socialEmailShareResult.text('You Wishlist has been shared!');
      $socialEmailShareResult.fadeIn();
    }, (err) => {
      $socialEmailShareResult.text("We couldn't share your Wishlist");
      $socialEmailShareResult.addClass('error');
      $socialEmailShareResult.fadeIn();
    });
  }

  function resetEmailShare(){
    $socialEmailShareResult.hide();
    $btnSocialEmailShare.show();
  }
  
  function validateShareEmailErrors(){
    $inputToEmail.removeClass('error');
    $inputToEmailError.hide();
    
    if(!EMAIL_VAL_REGEX.test(String($inputToEmail.val()).toLowerCase())){
      $inputToEmail.addClass('error');
      $inputToEmailError.show();
      return false;
    }
    return true;
  }

  /**
   * This function will check if current product
   * or bundle currently has stock and if product
   * is only available to preorder.
   * If not, will change
   * button text and setup klaviyo events
   * 
   * @param {$obj} $product 
   */
  function checkStockAndPreorders($product){
    var wlProductInfo, url = '', bundledItem, productHandles = '', variantIds = '';
    wlProductInfo = window.customWLFunctions.getWLItemFromLocalStorage($product.data('variant-id'))
    
    if($product.hasClass('is-bundle')){
      productHandles = '';

      for (let i = 0; i < wlProductInfo.cprops.bundledItems.length; i++) {
        bundledItem = wlProductInfo.cprops.bundledItems[i];
       
        productHandles += bundledItem.productHandle;
        variantIds += bundledItem.id;

        if(i+1 < wlProductInfo.cprops.bundledItems.length) {
          productHandles += '~';
          variantIds += '~';
        }
      }

      url = `/products/${WHATEVER_PRODUCT_HANDLE}?view=json&productHandles=${productHandles}&variantIds=${variantIds}`;
    } else {
      url = `/products/${WHATEVER_PRODUCT_HANDLE}?view=json&productHandles=${$product.children('a').attr('href').split('/')[4].split('?')[0]}&variantIds=${$product.data('variant-id')}`;
    }

    $.ajax({
      url: url,
      data: {},
      success: function(res){
        var res = JSON.parse(res);
        var variant, allOnStock = true, outOfStockVariantIds = [], isPreorder = false;

        for (let i = 0; i < res.variants.length; i++) {
          variant = res.variants[i];

          if(!variant.available || variant.stock <= 0){
            allOnStock = false;
            outOfStockVariantIds.push(+variant.variantId);
          }
          
          for (let j = 0; j < variant.tags.length; j++) {
            if(variant.tags[j].startsWith('PRE-ORDER:')){
              isPreorder = variant.tags[j].replace('PRE-ORDER:', '');
              break;
            }
          }
        }

        if(isPreorder){
          markPreorderProduct($product, isPreorder);
        } else if(!allOnStock){
          markOutOfStockProduct($product, outOfStockVariantIds);
        }
      },
    });

    // TO DO: Klaviyo
  }

  function markOutOfStockProduct($product, outOfStockVariantIds){
    $product.find('.btn-add-to-cart').text('Sold out! Notify me');
    $product.addClass('is-sold-out');
    $product.data('out-of-stock-variant-ids', outOfStockVariantIds);
  }

  function markPreorderProduct($product, preorder){
    $product.find('.btn-add-to-cart').text('pre-order')
    $product.addClass('is-preorder');
    $product.data('preorder', preorder);
  }
  
  function subscribeToKlaviyo($product){
    let outOfStockVariantIds = $product.data('out-of-stock-variant-ids'), bundledItems = [];
    $klaviyoErrorMsg.hide();
    $klaviyoSuccessMsg.hide();
    
    $(outOfStockVariantIds).each(function(i, outOfStockVariantId) {
      var productId;
      
      if($product.hasClass('is-bundle')){
        bundledItems = window.customWLFunctions.getWLItemFromLocalStorage($product.data('variant-id')).cprops.bundledItems;

        productId = bundledItems.find(item => item.id == outOfStockVariantId ).properties.productId;
      } else {
        productId = window.customWLFunctions.getWLItemFromLocalStorage(outOfStockVariantId).empi;
      }
      formData = new FormData();
      formData.append("a", "zFxB6d");
      formData.append("email", $klaviyoEmail.val());
      formData.append("variant", outOfStockVariantId);
      formData.append("product", productId);
      formData.append("platform", "shopify");
      
      $.ajax({
        async: true,
        crossDomain: true,
        url: '/apps/klaviyo-back-in-stock/onsite/components/back-in-stock/subscribe',
        type: 'POST',
        processData: false,
        contentType: false,
        mimeType: "multipart/form-data",
        data: formData,
        success: function(res) {
          try {
            var res = JSON.parse(res);
            if(res.success) {
              $klaviyoSuccessMsg.show();
            } else {
              $klaviyoErrorMsg.show();
            }
          } catch {
            $klaviyoErrorMsg.show();
          }
        }
      });
    });
  }

  function manageNewUserLogin(){
    var currentWL = window.customWLFunctions.getWishlist();
    if(window.customWLFunctions.checkIfUserIsLoggedIn() && !currentWL.wlPageHardRefreshed){
      window.customWLFunctions.fetchAndGetWishlistId(function(){
        currentWL = window.customWLFunctions.getWishlist(); // updated list from fetch
        window.customWLFunctions.updateLocalStorageWishlist(currentWL.wishlistId, currentWL.items, true);
        window.location.reload();
      }, function(err){ console.log('an error has occurred when loading user wishlist: ', err) });

    }
  }

  /* |--------------- Events ---------------| */
  
  function onSwymLoaded(){
    manageNewUserLogin();
    // gets called once Swym is ready
    refreshVisualItems();
  }

  /**
   * This function must be used as POST-INIT function
   */
  function afterRefreshingItems(){
    let $product, wishlistItems;
    const els = document.querySelectorAll('a[data-redirect-url]')
    console.log(els)
    els.forEach(el => {
      const url = el.dataset.redirectUrl
      if(!!url) {
        el.setAttribute('href', url)
      }
    })

    wishlistItems = window.customWLFunctions.getWishlist().items;

    setupEvents();
  
    $emptyWishlistMessage.hide();
    $wishlistContentsContainer.show();

    $wishlistContentsContainer.find('.product').each((i, product) => {
      $product = $(product);
      
      removeParenthesisContent($product);
      styleDiscountedPriceIfAny($product); // to do:
      checkStockAndPreorders($product);
      checkAlreadyAddedProduct($product);
    });
  }
  
  function onAddToCartClick(e){
    let variantId = $(e.currentTarget).closest('.product').data('variant-id');
    addToCart(variantId);
  }

  function onSoldOutClick(e){
    let wlInfo, outOfStockVariantIds = [], bundledItem, productsBeingSubscribedTo = [], title, options, selectedOption;
    $productBeingSubscribedTo = $(e.currentTarget).closest('.product');
    outOfStockVariantIds = $productBeingSubscribedTo.data('out-of-stock-variant-ids');
    wlInfo = window.customWLFunctions.getWLItemFromLocalStorage($productBeingSubscribedTo.data('variant-id'));
    
    if($productBeingSubscribedTo.hasClass('is-bundle')) {
      for (let i = 0; i < wlInfo.cprops.bundledItems.length; i++) {
        bundledItem = wlInfo.cprops.bundledItems[i];
        title = bundledItem.properties.title;
        options = bundledItem.properties.options.filter((el) => { return el != null && el != ''}).join(' / ');
        if(!selectedOption && outOfStockVariantIds.includes(bundledItem.id)){
          selectedOption = bundledItem;
        }
        productsBeingSubscribedTo.push($(`<option ${ selectedOption ? 'selected' : ''}>${title} - ${options}</option>`));
      }

    } else {
      title = $productBeingSubscribedTo.find('.product__title').text();
      options = $productBeingSubscribedTo.find('.product-subtitle').text();
      productsBeingSubscribedTo.push($(`<option>${options}</option>`));
    }
    $klaviyoProductNames.append(productsBeingSubscribedTo);

    $containerKlaviyoModal.find('.modal-title').text($productBeingSubscribedTo.find('.product__title').text());
    $containerKlaviyoModal.show();
  }

  function onProductAddedToCart(variantId){
    let $product = $wishlistContentsContainer.find('.product[data-variant-id="' + variantId + '"]');
    markProductAsAddedToCart($product);
    refreshCart();
  }
  
  function btnRemoveFromWLOnClick(variantId){
    window.customWLFunctions.removeFromWishlist(variantId, () => ( onItemRemovedFromWL(variantId) ), (err) => {
      console.log("An error has occurred removing item from WL", err);
    });
  }

  function onItemRemovedFromWL(variantId){
    removeVisualItem(variantId);
    
    if(window.customWLFunctions.getWishlist().items.length == 0){
      $emptyWishlistMessage.fadeIn(1000);
    }
  }

  /* |--------------- On Ready ---------------| */
  
  $(function(){
    /* |--------------- Cache Elements ---------------| */

    $header = $('header');
    $wishlistContentsContainer = $("#wishlist-items-container");
    $emptyWishlistMessage = $("#empty-wishlist-message");
    $cartDropdown = $('.cart .cart__inner');
    $iconEmailShare = $('.wishlist-icon.share-email');
    $iconFacebookShare = $('.wishlist-icon.share-facebook');
    $emailInformation = $('#email-information');
    $inputToEmail = $('#input-to-email');
    $inputToEmailError = $('#input-to-email-error');
    $btnSocialEmailShare = $('#btn-social-email-share');
    $socialEmailShareResult = $('#social-email-share-result');
    $containerKlaviyoModal = $('.container-klaviyo-modal');
    $klaviyoProductNames = $containerKlaviyoModal.find('.product-names');
    $klaviyoEmail = $containerKlaviyoModal.find('#email');
    $klaviyoErrorMsg = $containerKlaviyoModal.find('#error_message');
    $klaviyoSuccessMsg = $containerKlaviyoModal.find('#completed_message');
    
    /* |--------------- Events Setup ---------------| */

    $iconEmailShare.on('click', () => {
      if($wishlistContentsContainer.find('.product').length > 0){
        $emailInformation.slideDown();
        $([document.documentElement, document.body]).animate({
          scrollTop: $emailInformation.offset().top - $header.height()
        }, 750);
      }
    });

    $iconFacebookShare.on('click', () => {
      let wishlistId, socialTempalteObj;
      wishlistId = window.customWLFunctions.getWishlist().wishlistId;
      socialTempalteObj = window._swat.retailerSettings.Wishlist.SharingModes[SOCIAL_URL_TEMPLATES.FACEBOOK];


      window._swat.shareListSocial(wishlistId, '', window._swat.retailerSettings.Wishlist.SharingModes[0].url, 'facebook', (err) => {
        console.log('fb err', err);
      });
    });

    $inputToEmail.on('change', (e) => { $btnSocialEmailShare.show() });
    $inputToEmail.on('focus', resetEmailShare);

    $btnSocialEmailShare.on('click', () => {
      if(validateShareEmailErrors()){
        sendSocialShareEmail();
      }
    });

    $containerKlaviyoModal.find('.klaviyo-bis-close').on('click', (e) => {
      e.preventDefault();
      $klaviyoErrorMsg.hide();
      $klaviyoSuccessMsg.hide();
      $klaviyoProductNames.empty();
      $containerKlaviyoModal.hide();
      $productBeingSubscribedTo = undefined;
    });

    $containerKlaviyoModal.find('.js-notify-btn').on('click', () => { subscribeToKlaviyo($productBeingSubscribedTo) });
    
    
    /* |--------------- Initialization (Bewfore Swym loaded) ---------------| */
    
    if(!window.SwymCallbacks){
      window.SwymCallbacks = [];
    }
    
    window.SwymCallbacks.push(onSwymLoaded);

  });
})(window, jQuery);

/* |--------------- Notes ---------------| */
/*

https://api-docs.swym.it/v3/#introduction

{{ Mustache variables }}

Product Title:
{{i}}

Product URL:
{{du}}

Product Image URL:
{{iu}}

Product ID:
{{empi}}

Product Variant ID:
{{epi}}

*/
