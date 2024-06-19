/**
 * Update cart when change input field value
 * @param  { Object } $Element DOM Element - clicked element or field with value
 * @return { Void }
 */

function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function adjust_cart_with_bundles() {

  if($('.section-cart').length > 0) {
    var bundled_titles = [];
    $('.section-cart tbody tr').each(function(i) {
      var bundle_title = $(this).data('bundle-title');
      if(bundle_title != "") {
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
          var first_price = parseFloat($(first).find('.cart-product__price').html().replace('$',''));
          var item = $('.section-cart tbody tr[data-bundle-title="' + bundled_titles[i] + '"]')[m];
          var item_price = parseFloat($(item).find('.cart-product__price').html().replace('$',''));
          var new_price = first_price + item_price;
          $(first).find('.cart-product__price').html('$' + new_price.toFixed(2));

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
      if(bundle_title != "") {
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
          var first_price = parseFloat($(first).find('.product__price').html().replace('$',''));
          var item = $('.header__inner .cart__inner-body .product[data-bundle-title="' + inner_bundled_titles[i] + '"]')[m];
          var item_price = parseFloat($(item).find('.product__price').html().replace('$',''));
          var new_price = first_price + item_price;
          $(first).find('.product__price').html('$' + new_price.toFixed(2));

          var included_str = $(item).find('.product__includes ul').html();
          $(included_products_list).append(included_str);
          
          $(item).hide();
        }
      }
    }
  }
}

adjust_cart_with_bundles();

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

  var bundle_title = $eleParent.data('bundle-title');

  if(bundle_title == "") {
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
      });
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
      });
    });

  }
}

// Counter
const $doc = $(document);

$doc.on('click', '.js-counter .js-counter-plus, .js-counter .js-counter-minus', function(event) {
  event.preventDefault();

  const $this = $(this);
  const $field = $this.parent().find('input');

  let currentValue = Number($field.val());

  const hasAjaxFunctionality = $this.parent().hasClass('js-counter-ajax');
  const $form = $this.closest('form');

  if ($this.hasClass('js-counter-plus')) {
    currentValue++;
  }

  if ($this.hasClass('js-counter-minus')) {
    if (currentValue > 0) {
      currentValue--;
    }
  }

  $field.val(currentValue);

  if (hasAjaxFunctionality) {
    changeCart($this);
  }
});

$doc.on('change', '.js-counter-field', function(event) {
  event.preventDefault();

  const $this = $(this);
  const hasAjaxFunctionality = $this.parent().hasClass('js-counter-ajax');

  if (hasAjaxFunctionality) {
    changeCart($this);
  }
});
