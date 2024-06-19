(function(window, $) {  
  /* |---------- Vars and Constants ----------| */
  
  var VARIANT_OPTION_QTY_LIMIT = 2; // limited to 2: color,size, or whatever but 2 at max.
  var CURRENT_TEMPLATE;
  var $body, $selectCurrentVariant, $btnAddToWishlist, $btnAddToWishlistIconCheckbox, $cartIconQty, $variantOptionsContainer;
  var TEMPLATES = {
    PRODUCT: 1,
    BUNDLE: 2,
    ACCESSORY: 3,
  };
  var variantIdPending; // Async icon behaviour. Cache of last variantId tried to add. Used to check for errors after toggling fill/empty on user click. Michel requirement.
  
  /* |---------- Methods & Functions ----------| */
  
  /**
  * Default code for API initialization
  */
  function initWishlistAPI(){
    if(!window.SwymCallbacks){
      window.SwymCallbacks = [];
    }
    window.SwymCallbacks.push(swymAPILoadedCallback);
  }
  
  /**
  * This function fetches the user's wishlist from server in order to get the wishlsitId
  * and use that field to catch errors using addToList from v3 API.
  * 
  * @param {function} onOkCallback 
  * @param {function} onErrorCallback 
  */
  function fetchAndGetWishlistId(onOkCallback, onErrorCallback){
    var currentWLInfo;
    window._swat.fetchLists({
      callbackFn: (res) => {
        if(res.length == 0){
          createDefaultList((res) => {
            currentWLInfo = getWishlist();
            updateLocalStorageWishlist(res.lid, currentWLInfo.items, currentWLInfo.wlPageHardRefreshed);
          });
        } else {
          currentWLInfo = getWishlist();
          
          updateLocalStorageWishlist(res[0].lid, res[0].listcontents, false);
          onOkCallback(res);
        }
      },
      errorFn: onErrorCallback
    });
  }
  
  function createDefaultList(onOkCallback){
    _swat.createList({lname: 'Default list'}, onOkCallback, function(err) {
      console.log('An error occurred when creating default wishlist');
    });
  }
  
  /**
  * This method returns the current shopify template
  */
  function getCurrentTemplate(){
    if($body.hasClass('template-product')){
      return TEMPLATES.PRODUCT;
    }
    else if($body.hasClass('template-bundle')){
      return TEMPLATES.BUNDLE;
    }
    else if($body.hasClass('template-accessories')){
      return TEMPLATES.ACCESSORY;
    }
  }
  
  /**
  * Function that returns selectedVariantId based
  * on option selection and current template
  */
  function getSelectedVariantId(){
    var selectedVariantId;
    
    switch (CURRENT_TEMPLATE) {
      // case TEMPLATES.PRODUCT:
      //   break;
      // case TEMPLATES.BUNDLE:
      //   break;
      case TEMPLATES.ACCESSORY:
      // here new logic
      selectedVariantId = $selectCurrentVariant.val();
      break;
      default:
      var $options = $('.form-product input[type=radio]'),
      differentNameOptions = [],
      lastDifferentNameOption,
      optionsSelector = 'option';
      
      var $option;
      $options.each(function(i, optionElem){
        if(differentNameOptions.length < VARIANT_OPTION_QTY_LIMIT){
          $option = $(optionElem);
          if(!differentNameOptions.includes($option.attr('name'))){
            differentNameOptions.push($option.attr('name'));
            lastDifferentNameOption = differentNameOptions[differentNameOptions.length-1];
            
            let typeOptionSelectedValue = $('.form-product input[type=radio][name=' + lastDifferentNameOption + ']:checked').val();
            optionsSelector += '[data-' + $option.attr('name') + '=' + typeOptionSelectedValue + ']';
          }
        }
      });
      selectedVariantId = $selectCurrentVariant.find(optionsSelector).val()
      break;
    }
    
    return selectedVariantId;
  }
  
  /**
  * This function toggles between icon empty
  * and icon filled based on items quantity
  * 
  * @param {*} wishlistItemsCount 
  */
  function handleMenuIcons(wishlistItemsCount){
    if(wishlistItemsCount > 0){
      $('header .header__aside .wishlist-fav-icon i, header nav ul li .wishlist-fav-icon i')
      .removeClass('fa-heart-o')
      .addClass('fa-heart');
    }
    else {
      $('header .header__aside .wishlist-fav-icon i, header nav ul li .wishlist-fav-icon i')
      .removeClass('fa-heart')
      .addClass('fa-heart-o');
    }
  }
  
  /**
  * This function returns the wishlist id and items,
  * initializating it currently if empty.
  */
  function getWishlist(){
    var wlInfo = JSON.parse(localStorage.getItem('wishlist-info'));
    if(wlInfo != null) {
      if(wlInfo.items == null || wlInfo.wishlistId == null) {
        updateLocalStorageWishlist(wlInfo.wishlistId || 0, [], checkIfUserIsLoggedIn() ? true : false);
        wlInfo = {
          wishlistId: wlInfo.wishlistId || 0,
          items: []
        };
      }
    } else {
      updateLocalStorageWishlist(0, [], checkIfUserIsLoggedIn() ? true : false);
      wlInfo = {
        wishlistId: 0,
        items: []
      };
    }
    
    return wlInfo;
  }
  
  /**
  * This functions manually adds a product/variant
  * to the wishlist
  * 
  * @param {int} variantId 
  */
  function addToWishlist(variantId){
    let productVariant, prodToFav, prodsToFav = [], productsInBundle, bundledItems;
    
    productVariant = window.product.variants.find((variant) => {
      if(variant.id == variantId) {
        return variant;
      }
    });
    
    if(!isBundleProduct()){
      // Default object
      prodToFav = {
        epi: variantId, // variantId - obligatory
        empi: window.product.id, // productId - obligatory
        du: window.location.href.split('?')[0], // canonical product url - absolute url
        iu: productVariant.featured_image.src, // Img url without protocol
        pr: productVariant.price, // Price
        cprops: {
          dateAdded: new Date().getTime(),
          productHandle: window.product.handle,
          pdpTemplate: $body.data('template')
        }
      };
      
      if(window.product.tags.includes('Final Sale')){
        prodToFav.cprops.discountedPrice = productVariant.compare_at_price || window.product.compare_at_price;
      }
      
      // Single product
      window._swat.addToList(getWishlist().wishlistId, prodToFav, addedToWishlistCallback, (err) => {
        console.log('An error has occurred when adding item to wishlist: ', err);
        
        postCheckOnAPIResponse(true);
      });
    } else {
      productsInBundle = jQuery.map(cartItems, function(variant) {return variant.id;})
      console.log('cartItems', cartItems);
      bundledItems = getBundledItemsToAdd(cartItems, productsInBundle, bundleRealPrice, bundleDiscountedPrice, selectedBundleImage);

      prodsToFav = bundledItems.map((bundledItem) => {
        var productUrl = bundledItem.variant?.url?.split('?')[0],
        productId = bundledItem.properties?.productId;

        if(!productUrl){
          productUrl = window.location.href.split('?')[0];
        }

        if(!productId){
          productId = window.product.id;
        }

        prodToFav = {
          epi: bundledItem.id, // variantId - obligatory
          empi: productId, // productId - obligatory
          du: productUrl, // canonical product url - absolute url
          iu: bundledItem.variant.image, // Img url without protocol
          pr: bundledItem.variant.price, // Price
          cprops: {
            dateAdded: new Date().getTime(),
            productHandle: window.product.handle,
            bundleId: variantId,
            // applyDiscount: window.product.tags.includes('DISCOUNT::10'),
            pdpTemplate: $body.data('template'),
            redirectUrl: bundledItem.properties.redirect_url || ''
          }
        };

        // if(window.product.tags.includes('DISCOUNT::10')){
        //   prodToFav.cprops.discountedPrice = bundledItem.variant.price * .90;
        // }

        console.log('prodToFav', prodToFav);

        return prodToFav;
      });
      
      // Multiple products
      window._swat.addProductsToList(getWishlist().wishlistId, prodsToFav, addedToWishlistCallback, (err) => {
        console.log('An error has occurred when adding item to wishlist: ', err);
        
        postCheckOnAPIResponse(true);
      });
    }
    
    variantIdPending = variantId;
    handlePDPIcon(true);
  }
  
  /**
  * This functions manually removes a product/variant
  * from the wishlist
  * 
  * ------- Called from other files too (wishlist-page for example).
  * 
  * @param {int} variantId 
  */
  function removeFromWishlist(variantId, onOkCallback, onErrorCallback){
    let prodToRemove, prodsToRemove;
    variantIdPending = variantId;
    
    if(CURRENT_TEMPLATE != TEMPLATES.BUNDLE){
      prodToRemove = getWLItemFromLocalStorage(variantId);
      prodToRemove = {
        empi: prodToRemove.empi,
        epi: prodToRemove.epi,
        du: prodToRemove.du
      };
      
      window._swat.deleteFromList(getWishlist().wishlistId, prodToRemove, (e) => {
        variantIdPending = undefined;
        if(e.error != null){
          onErrorCallback(e);
        }
        else {
          removedFromWL(e);
          onOkCallback(e);
        }
      }, (e) => {
        variantIdPending = undefined;
        onErrorCallback(e);
      });
    } else {
      prodsToRemove = getWLBundledItemsFromLocalStorage(variantId);
      prodsToRemove = prodsToRemove.map((prod) => { return {
        empi: prod.empi,
        epi: prod.epi,
        du: prod.du
      } });

      window._swat.removeProductsFromList(getWishlist().wishlistId, prodsToRemove, (e) => {
        variantIdPending = undefined;
        if(e.error != null){
          onErrorCallback(e);
        }
        else {
          removedFromWL(e);
          onOkCallback(e);
        }
      }, (e) => {
        variantIdPending = undefined;
        onErrorCallback(e);
      });
    }
    
    
    handlePDPIcon(false);
  }
  
  /**
  * This function is called when add/remove is done processing on API
  * to ensure that there wasn't any errors. If any error exists,
  * toggles PDP heart icon back and checks menu heart icon again.
  */
  function postCheckOnAPIResponse(shouldBeFilled){
    let currentWLInfo = getWishlist();
    var updatedWishlist = removeWishlistItemFromArray(currentWLInfo.items, variantIdPending);
    
    // Toggles heart icon back because of errors on API call
    if(variantIdPending == getSelectedVariantId())
    {
      handlePDPIcon(!shouldBeFilled);
    }
    
    updateLocalStorageWishlist(currentWLInfo.wishlistId, updatedWishlist.items, updatedWishlist.wlPageHardRefreshed);
    handleMenuIcons(currentWLInfo.items.length);
    
    variantIdPending = undefined;
    
    handleMenuIcons(getWishlist().items.length);
  }
  
  /**
  * This function checks if the selected
  * variant on PDP is already added to the wishlist
  * 
  * @param {array} wishlistItems 
  */
  function handleVariantAlreadyAdded(wishlistItems){
    let variantAlreadyAdded = false;
    var currentVariantId = getSelectedVariantId();
    
    for (let i = 0; i < wishlistItems.length; i++) {
      if(wishlistItems[i].cprops?.bundleId && wishlistItems[i].cprops.bundleId == currentVariantId){
        variantAlreadyAdded = true;
        break;
      }

      if(currentVariantId == wishlistItems[i].epi){
        variantAlreadyAdded = true;
        break;
      }
    }
    
    handlePDPIcon(variantAlreadyAdded);
    return variantAlreadyAdded;
  }
  
  /**
  * This method will fill or empty the
  * wishlist icon on PDP
  * 
  * @param {*} fill 
  */
  function handlePDPIcon(fill){
    // if(fill){
    //   $btnAddToWishlistIcon.removeClass('fa-heart-o').addClass('fa-heart');
    // }
    // else {
    //   $btnAddToWishlistIcon.removeClass('fa-heart').addClass('fa-heart-o');
    // }
    
    $btnAddToWishlistIconCheckbox.prop('checked', fill);
  }
  
  /**
  * This function updates the cache wishlist
  * 
  * @param {array} wishlistItems 
  */
  function updateLocalStorageWishlist(wlId, wishlistItems, wlPageHardRefreshed){
    localStorage.setItem('wishlist-info', JSON.stringify({
      wishlistId: wlId,
      items: wishlistItems,
      wlPageHardRefreshed: wlPageHardRefreshed
    }));
  }

  /**
  * This function will clean the wishlist locally
  */
  function cleanWishlist(){
    localStorage.removeItem('wishlist-info');
  }
  
  function getWLItemFromLocalStorage(variantId){
    let wishlistInfo;
    wishlistInfo = getWishlist();

    return wishlistInfo.items.find((item) => { if(item.epi == variantId){ return item } })
  }

  function getWLBundledItemsFromLocalStorage(variantId){
    let wishlistInfo, item, wishlistItems = [];
    wishlistInfo = getWishlist();
    
    for (let i = 0; i < wishlistInfo.items.length; i++) {
      item = wishlistInfo.items[i];

      if(item.cprops.bundleId && +item.cprops.bundleId == +variantId){
        wishlistItems.push(item);
      }
    }

    return wishlistItems;
  }
  
  /**
  * Extracts value from, array
  * 
  * @param {*} wishlistItems
  * @param {int} variantIdToRemove
  */
  function removeWishlistItemFromArray(wishlistItems, variantIdToRemove){
    return wishlistItems.filter((item, i) => { if(item.epi != parseInt(variantIdToRemove)) return item });
  }
  
  /**
  * This function updates the subnumber on
  * the header's menu cart icon checking
  * front-end cart.
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
      $cartIconQty.text(all_item_counts);
    } else {
      $cartIconQty.text('');
    }
  }

  function checkIfUserIsLoggedIn(){
    return $('body').data('is-user-logged-in');
  }

  function isBundleProduct(){
    if(CURRENT_TEMPLATE == TEMPLATES.BUNDLE){
      if(product.tags.includes('isBundleSet')){
        return isBundleSizeOptionSelected();
      } else {
        return true;
      }
    } else {
      return false;
    }
  }

  function isBundleSizeOptionSelected(){
    return $('.optionFilter.Size[value="bundle"]').prop('checked');
  }
  
  /* |---------- Callbacks and Events ----------| */
  
  /**
  * This function triggers on swymLoad and
  * setup the wlId if not set.
  * Then, calls normal
  * initialization process from initAfterSwymAPILoad.
  * 
  * @param {API obj} swat 
  */
  function swymAPILoadedCallback(swat){
    var currentWL = window.customWLFunctions.getWishlist();
    if(!window.customWLFunctions.checkIfUserIsLoggedIn() && currentWL.wlPageHardRefreshed){
      cleanWishlist();
    }

    if(getWishlist().wishlistId == 0){
      fetchAndGetWishlistId((res) => {
        initAfterSwymAPILoad(swat);
      }, (err) => {
        console.log('An error has occurred when getting wishlists from User');
      });
    } else {
      initAfterSwymAPILoad(swat);
    }
  }
  
  /**
  * Normal initialization after Swym API load.
  * 
  * @param {*} swat 
  */
  function initAfterSwymAPILoad(swat){
    $($('.options-container')[0]).find('input');
    
    handleMenuIcons(getWishlist().items.length);
    
    // PDP
    handleVariantAlreadyAdded(getWishlist().items);
    
    if(window.location.href.includes('/pages/swym-wishlist')){
      // Callback event setup for item removal on wishlist page
      swat.evtLayer.addEventListener(swat.JSEvents.removedFromWishlist, removedFromWL);
    }
  }

  function enableHearthIconPDP(enable){
    var $variantSelected = $(".options-container input[type='radio']:checked");
    var $btnBundle = $('.form-action-wishlist .btn-add-bundle');
    var limit = $('.form__row.product-variants-container .form__row').length;
    if($variantSelected.length >= parseInt(limit) && enable){
      $btnAddToWishlist.removeClass('disabled');
      setTimeout(() => {
        $btnBundle.attr('disabled', false);
      }, 1)
    } else {
      $btnAddToWishlist.addClass('disabled');
      setTimeout(() => {
        $btnBundle.attr('disabled', true);
      }, 1)
    }
  }
  
  /**
  * Callback invoked when variant is added to wishlist
  * 
  * @param {obj} e 
  */
  function addedToWishlistCallback(e){
    variantIdPending = undefined;
    
    var wlInfo = getWishlist();
    if(Array.isArray(e)){
      for (let i = 0; i < e.length; i++) {
        wlInfo.items.push(e[i]);
      }
    } else {
      wlInfo.items.push(e);
    }
    
    updateLocalStorageWishlist(wlInfo.wishlistId, wlInfo.items, wlInfo.wlPageHardRefreshed);
    handleMenuIcons(wlInfo.items.length);
  }
  
  /**
  * Callback for variant selection change event on PDP
  * 
  * @param {*} e 
  */
  function variantSelectionOnChange(e){
    if(checkIfVariantOptionsSelected()){
      enableHearthIconPDP(true);
      
      // PDP
      handleVariantAlreadyAdded(getWishlist().items);
    }
  }
  
  /**
  * Callback for btn add/remove item to/from
  * wishlist event on PDP
  * 
  * @param {*} e 
  */
  function btnAddToWishlistOnClick(e){
    e.preventDefault();
    
    if(!handleVariantAlreadyAdded(getWishlist().items)){
      addToWishlist(getSelectedVariantId());
    } else {
      removeFromWishlist(getSelectedVariantId(), (res) => {}, (err) => {
        console.log('An error has occurred when removing item from wishlist: ', err);
        postCheckOnAPIResponse(false);
      });
    }
  }
  
  /**
  * Callback triggered when item is removed from wishlsit
  * from the wishlist page.
  * 
  * @param {obj} e 
  */
  function removedFromWL(e) {
    let currentWLInfo = getWishlist(), newItems = [];
    // Item removed from wishlist in wishlist page. Handle local cache remove.
    
    // Bundle
    if(Array.isArray(e)){
      e.forEach(function(bundledItem){
        currentWLInfo.items = removeWishlistItemFromArray(currentWLInfo.items, bundledItem.epi);
      })
    } else {
      currentWLInfo.items = removeWishlistItemFromArray(currentWLInfo.items, e.epi);
    }
    updateLocalStorageWishlist(currentWLInfo.wishlistId, currentWLInfo.items, currentWLInfo.wlPageHardRefreshed);
    handleMenuIcons(currentWLInfo.items.length);
  }
  
  /**
  * Used to enable heart icon for bundle products
  * because options are not selected by default
  */
  function checkIfVariantOptionsSelected(){
    let $container, allOptionsSelected = true;
    
    for (let i = 0; i < $variantOptionsContainer.length; i++) {
      $container = $($variantOptionsContainer[i]);
      allOptionsSelected = $container.find('input:checked').length > 0;
      if(!allOptionsSelected){
        break;
      }
    }
    
    return allOptionsSelected;
  }

  /* |--------------- On Ready ---------------| */
  
  $(function(){
    /* |--------------- Cache Elements ---------------| */
    
    $body = $('body');
    $cartIconQty = $('.cart .cart__link span');
    $wishlistCounter = $('.swym-hidden-counter');
    $selectCurrentVariant = $('select[name=id]');
    $btnAddToWishlist = $('.form-product .btn-add-to-wishlist');
    $btnAddToWishlistIconCheckbox = $btnAddToWishlist.find('#wishlist-icon-checkbox');
    $variantOptionsContainer = $('.options-container');
    
    /* |--------------- Events Setup ---------------| */
    
    CURRENT_TEMPLATE = getCurrentTemplate();
    
    $('.wishlist-fav-icon').on('click', () => {
      window.href = '/pages/wishlist';
    });
    
    // Wishlist variant change event setup
    $selectCurrentVariant.on('change', variantSelectionOnChange);
    
    // Add/Remove to Wishlist event setup
    $btnAddToWishlist.on('click', (e) => {
      if(!$btnAddToWishlist.hasClass('disabled')){
        btnAddToWishlistOnClick(e);
      }
    });
    
    /* |--------------- Initialization ---------------| */
    
    window.customWLFunctions = {};
    window.customWLFunctions.updateLocalStorageWishlist = updateLocalStorageWishlist;
    window.customWLFunctions.removeFromWishlist = removeFromWishlist;
    window.customWLFunctions.getWishlist = getWishlist;
    window.customWLFunctions.fetchAndGetWishlistId = fetchAndGetWishlistId;
    window.customWLFunctions.updateMenuCartIconQty = updateMenuCartIconQty;
    window.customWLFunctions.getWLItemFromLocalStorage = getWLItemFromLocalStorage;
    window.customWLFunctions.checkIfUserIsLoggedIn = checkIfUserIsLoggedIn;
    
    // Default code for API initialization
    initWishlistAPI();
    
  });
})(window, jQuery);

/**
* Testing purposes: Clears localStorage
* and Swym cloud data
*/
function clearWishlistUserData(){
  window._swat.fetchLists({
    callbackFn: function(lists) {
      _swat.deleteList(lists[0].lid);
      localStorage.removeItem('wishlist-info');
    },
    errorFn: function(err) { console.log('error fetching WLs: ', err); }
  });
}

/*
https://api-docs.swym.it/v3/#introduction

Samples and references for the API.

DO NOT DELETE

as this cover functionalities and mechanics from the api that
are not documentated

-----Sample event setup:
_swat.evtLayer.addEventListener(_swat.JSEvents.removedFromWishlist, function(e) {
  console.log('2', e);
});

_swat.evtLayer is key.

-----List all available events (used in API v3):
_swat.JSEvents

-----fetch function: **************This is a different default list from the ones you get using fetchLists
window._swat.fetch((res) => { console.log(res)})

-----get products for x list (V3):
_swat.fetchListCtx(listId, (res) => {
  console.log(res)
}, (res) => {
  console.log(res)
});

-----fetch lists:
window._swat.fetchLists({
  callbackFn: function(lists) { console.log("Fetched my lists: ", lists[0] ? lists[0].lid : ''); },
  errorFn: function(err) { console.log('error fetching WLs: ', err); }
});
-----
Testing purposes;
_swat.deleteList(listId, (res) => { console.log('res', res) }, (err) => { console.log('err', err) })

*/
