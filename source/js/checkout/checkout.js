const CHECKOUT_STEPS = {
  CONTACT: 'contact_information',
  SHIPPING: 'shipping_method',
  PAYMENT: 'payment_method',
  REVIEW: 'review'
};

function getCurrentStep(){
	if(window.Shopify && window.Shopify.Checkout && window.Shopify.Checkout.step){
		switch(window.Shopify.Checkout.step){
			case CHECKOUT_STEPS.CONTACT:
				return CHECKOUT_STEPS.CONTACT;
			case CHECKOUT_STEPS.SHIPPING:
				return CHECKOUT_STEPS.SHIPPING;
			case CHECKOUT_STEPS.PAYMENT:
				return CHECKOUT_STEPS.PAYMENT;
			case CHECKOUT_STEPS.REVIEW:
				return CHECKOUT_STEPS.REVIEW;
			default:
				return false;
		}
	} else {
		return false;
	}
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

var _checkoutBundlePriceSum = [];
var _checkoutBundleDiscountPriceSum = [];
var shippingMethodMessage;

// Adding shipping info for customized products
if(typeof Checkout != 'undefined') {
	Checkout.$(document).on('page:load page:change', function() {
		window.scrollTo(0, 0);
		
		if($('.content-checkout .product-table').length > 0) {

			var bundled_titles = [];
			var monogram_fee_price = 0;
			var monogram_fee_price_original = 0;

			var $container = $('.content-checkout .product-table');
			$container.find('tbody tr').each(function(i) {
				var preorder_date = '';
				var $td = $(this).find('.product__description');

				var bundle_title = "";
				var bundle_variant_title = "";
				var bundle_item_title = "";
				var bundle_image = "";
				var bundle_url = "";
				var monogram_lineitem = false;

				let $firstVisibleProperty, $spanNoDiscountsAllowed, $spanNoGiftWrapAllowed, $spanSaleDiscount, $msg;

				if($td.find('span.product__description__property').length > 0) {
					$td.find('span.product__description__property').each(function() {
						var property = $(this).html().split(':');
						var first = property[0].trim();
						var last = property[1].trim();

						switch(first) {
							case 'Bundle Item Title':
								bundle_item_title = last;
								$(this).hide();
								break;
							case 'Bundle URL':
								bundle_url = last;
								$(this).hide();
								break;
							case 'Bundle Title':
								bundle_title = last;
								$(this).hide();
								break;
							case 'Bundle Variant Title':
								bundle_variant_title = last;
								$(this).hide();
								break;
							case 'Bundle Image':
								bundle_image = last;
								$(this).hide();
								break;
							case 'preorder':
								preorder_date = last;
								$(this).html('Expected Shipping Date:  <br>' + preorder_date);
								break;
							case 'Monogram Place':
								monogram_lineitem = true;
								$(this).hide();
								break;
							case 'saleDiscountMsg':
								$spanSaleDiscount = $(this);
								$spanSaleDiscount.addClass('custom-message');
								
								$msg = $('<i>');
								$msg.text(last);
								$spanSaleDiscount.html($msg);
								break;
							case 'saleDiscount':
								let $this = $(this);
								let $tr = $this.closest('tr');
								$this.hide();

								// condition avoids duplication
								if($tr.find('.reduction-code__text').length == 0 &&
								$tr.find('.compare-price').length == 0){
									let $price = $('<p>');
									$price.text('$'+last);
									let $delPrice = $('<del>');
									$delPrice.append($price);
									$delPrice.addClass('compare-price order-summary__emphasis');
									$delPrice.css('margin-left', '1rem');
									$tr.find('.product__price').prepend($delPrice);
								}
								break;
							case 'noDiscountsAllowed':
								$spanNoDiscountsAllowed = $(this);
								$spanNoDiscountsAllowed.addClass('custom-message');
								
								$msg = $('<i>');
								$msg.text(last);
								$spanNoDiscountsAllowed.html($msg);
								break;
							case 'no_gift_wrap_allowed':
								$spanNoGiftWrapAllowed = $(this);
								$spanNoGiftWrapAllowed.addClass('custom-message');
								
								$msg = $('<i>');
								$msg.text(last);
								$spanNoGiftWrapAllowed.html($msg);
								break;
						}

						// hide bundle property descriptions
						var propertyText = $(this).text().toUpperCase();
						if(propertyText.includes('BUNDLE') || propertyText.includes('DISCOUNTAMOUNT') || propertyText.includes('REDIRECT')){
							$(this).addClass('hide-bundle-desc-property');
						}
					});
				}

				var new_title = bundle_title + ' || ' + bundle_variant_title;
				bundled_titles.push(new_title);

				$(this).data('bundle-title', new_title);
				$(this).data('bundle-item-title', bundle_item_title);
				$(this).data('bundle-image', bundle_image);
				$(this).data('bundle-url', bundle_url);
				$(this).data('monogram', monogram_lineitem);

				var itemTitle = $td.find('span.product__description__name').text().toLowerCase();
				if(itemTitle.search("monogram") != -1) {
					var mono_qty = parseInt($(this).find('span.product-thumbnail__quantity').text());
					var mono_total_price = parseFloat($(this).find('.product__price .order-summary__emphasis').html().replace('$',''));
					monogram_fee_price = parseFloat(mono_total_price / mono_qty);

					if($(this).find('.product__price del.order-summary__small-text').length > 0) {
						var mono_total_price_total = parseFloat($(this).find('.product__price del.order-summary__small-text').html().replace('$',''));
						monogram_fee_price_original = parseFloat(mono_total_price_total / mono_qty);
					}

					$(this).hide();
				}

				// chnage color
				var variant_str = $td.find('span.product__description__variant ').text();
				if(variant_str != '') {
					variant_str = variant_str.replace(/\([^)]*\)/g, "");
					$td.find('span.product__description__variant ').text(variant_str);
				}

				// put saleDiscount before noDiscounts
				if($spanNoDiscountsAllowed != undefined && $spanSaleDiscount != undefined){
					$spanNoDiscountsAllowed.before($spanSaleDiscount);
				}

				if($firstVisibleProperty != undefined){
					$firstVisibleProperty.css('margin-top', '1rem');
				}

				$container.find('th').each((i, th) => {
					$(th).find('.custom-message').first().css('margin-top', '1rem');
				});
			});

			var bundled_titles = bundled_titles.filter(onlyUnique);
			
			for(var i=0; i < bundled_titles.length; i++) {
				_checkoutBundlePriceSum.push(0);
				_checkoutBundleDiscountPriceSum.push(0);
			}

		    for(var i=0; i < bundled_titles.length; i++) {

		        var _cnts = 0;
		        var first = null;
		        var itemObjs = [];
		        var priceSum = 0;
		        var priceSumDiscount = 0;
              	var discountPrice = 0;
		        $container.find('tbody tr').each(function(j){
		        	var _bundle_title = $(this).data('bundle-title');
		        	if(_bundle_title != " || " && _bundle_title == bundled_titles[i]) {
		        		_cnts += 1;

		        		if(_cnts == 1) {
		        			first = $(this);
		        		} else {
		        			itemObjs.push($(this));
		        		}

		        		priceSum += parseFloat($(this).find('.product__price .order-summary__emphasis').html().replace('$',''));

		        		if($(this).find('.product__price del.order-summary__small-text').length > 0) {
		        			priceSumDiscount += parseFloat($(this).find('.product__price del.order-summary__small-text').html().replace('$',''));
		        		} else {
		        			priceSumDiscount += parseFloat($(this).find('.product__price .order-summary__emphasis').html().replace('$',''));
		        		}
		        	}
		        });

		        if(_checkoutBundlePriceSum[i] == 0) {
		        	_checkoutBundlePriceSum[i] = priceSum;
		        }

		    		if(_checkoutBundleDiscountPriceSum[i] == 0) {
		        	_checkoutBundleDiscountPriceSum[i] = priceSumDiscount;
		        }

		        var only_title = bundled_titles[i].split(" || ");
		        $(first).find('.product__description .product__description__name').html(only_title[0]);
		        var bundle_image = $(first).data('bundle-image');
		        $(first).find('.product-thumbnail__image').attr('alt', only_title[0]).attr('src', bundle_image);

		        if($(first).find('.product__description div.included_products').length == 0) {
		        	$(first).find('.product__description').append('<div class="included_products"></div>');
		        }
              	
              	if (_checkoutBundlePriceSum[i] >= _checkoutBundleDiscountPriceSum[i]) {
                  discountPrice = priceSum;
                } else {
                  discountPrice = _checkoutBundlePriceSum[i];
                }
		        
              	$(first).find('.product__price .order-summary__emphasis').html('$' + discountPrice.toFixed(2));

		        if($(first).find('.product__price del.order-summary__small-text').length > 0) {
		        	$(first).find('.product__price del.order-summary__small-text').html('$' + _checkoutBundleDiscountPriceSum[i].toFixed(2));
		        }

		        // trading discount
		        if($(first).find('.reduction-code__text').length > 0) {
		        	let $codeTxt = $(first).find('.reduction-code__text');
		        	let _code_txt_arr = $codeTxt.text().split('$');
		        	if(_code_txt_arr.length == 2) {
		        		let _bundle_total_discount = _checkoutBundleDiscountPriceSum[i].toFixed(2) - discountPrice.toFixed(2);
		        		$codeTxt.text(_code_txt_arr[0] + '$' + _bundle_total_discount + ')');
		        	}
		        }

		        var included_products_list = $(first).find('.product__description div.included_products');
		        $(included_products_list).html('');
		        $(included_products_list).append('<div class="product__description__property order-summary__small-text">INCLUDES</div>');
		        $(included_products_list).append('<div class="product__description__property order-summary__small-text">' + $(first).data('bundle-item-title') + '</div>');
		        for(var m=0; m < itemObjs.length; m++) {
					var first_price = parseFloat($(first).find('.product__price .order-summary__emphasis').html().replace('$',''));
					var item = itemObjs[m];

					var included_str = $(item).data('bundle-item-title');
					$(included_products_list).append('<div class="product__description__property order-summary__small-text">' + included_str + '</div>');

					$(item).hide();
		        }
		    }

		    // progress for monogram
		    $container.find('tbody tr').each(function(i) {
		    	var _monogram = $(this).data('monogram');
		    	if(_monogram) {
		    		if($(this).find('.product__price .order-summary__emphasis').data('calculated') !== true) {
			    		var priceSum = parseFloat($(this).find('.product__price .order-summary__emphasis').html().replace('$',''));
			    		var mono_qty = parseInt($(this).find('span.product-thumbnail__quantity').text());
			    		priceSum += monogram_fee_price * mono_qty;
			    		$(this).find('.product__price .order-summary__emphasis').html('$' + priceSum.toFixed(2)).data('calculated', true);

			    		if($(this).find('.product__price del.order-summary__small-text').length > 0) {
			    			var priceSum_origin = parseFloat($(this).find('.product__price del.order-summary__small-text').html().replace('$',''));
			    			priceSum_origin += monogram_fee_price_original * mono_qty;
			    			$(this).find('.product__price del.order-summary__small-text').html('$' + priceSum_origin.toFixed(2)).data('calculated', true);
			    		}
			    	}

		    		var $td = $(this).find('td.product__description');
		    		var added_monogram_lineitem = false;

		    		if($td.find('span.product__description__property').length > 0) {
						$td.find('span.product__description__property').each(function() {
							var property = $(this).html().split(':');
							var first = property[0].trim();
							var last = property[1].trim();

							switch(first) {
								case 'Monogram Fee':
									added_monogram_lineitem = true;
									break;
							}
						});
					}

					if(!added_monogram_lineitem) {
						var _real_monogram_fee = monogram_fee_price > monogram_fee_price_original ? monogram_fee_price : monogram_fee_price_original;
						$td.append('<span class="product__description__property order-summary__small-text">Monogram Fee: + $' + parseInt(_real_monogram_fee) + '</span>');
					}
		    	}
		    });

		    // discount button
		    if($('button[data-trekkie-id="apply_discount_button"]').length > 0) {
		    	if(!$('button[data-trekkie-id="apply_discount_button"]').hasClass('btn--solid')) {
		    		$('button[data-trekkie-id="apply_discount_button"]').addClass('btn--solid');
		    	}
		    }
		}

		var $discountTags = $('.total-line-table .reduction-code__text')
		var $discountTag;
		for (let i = 0; i < $discountTags.length; i++) {
			$discountTag = $($discountTags[i]);
			if($discountTag.html().toString().toUpperCase() == "HOLIDAY"){
				$discountTag.closest('tr').addClass('hidden');
				break;
			}
		}

		if($('.logged-in-customer-information').length > 0) {
			var logout = $('.logged-in-customer-information a');
			$(logout).attr('href', 'https://kassatex.com/account/logout?return_url=https%3A%2F%2Fkassatex.com%2F');
		}
		
		appendInternationalShippingNote();
	});
}

/**
 * This method adds custom msg for international shipping
 * methods
 */
function appendInternationalShippingNote(){
	var $shippingSection = $('.section.section--shipping-method');
	if($shippingSection.length > 0){
		var $shippingMethodsLabels = $shippingSection.find('.content-box__row .radio__label__primary');
		
		$shippingMethodsLabels.each(function(i, elem){
			var $methodLabel = $(elem);
			if($methodLabel.text().toUpperCase().includes('INTERNATIONAL')){
				$methodLabel.append(['<small style="display: block">Duties and customs charges not included.</small>']);
			}
		})
	}
}

/**
 * This will hide the discount line
 * in the subtotals/totals section
 */
function hideBFCMDiscountLine(){
	var discountsContainer, discount, discountText;
	discountsContainer = document.getElementsByClassName('tags-list');

	if(discountsContainer && discountsContainer.length > 0){
		discountsContainer = discountsContainer[0];
		discount = discountsContainer.getElementsByClassName('tag');
		
		if(discount && discount.length > 0){
			discount = discount[0];

			discountText = discount.getElementsByClassName('reduction-code');
			if(discountText){
				document.getElementsByClassName('total-line--reduction')[0].style.display = 'none';
			}
		}
	}
}

/*
 * This function will update the subtotal of
 * each product with monigram design
 */
function updateMonogramSubtotals(){
	var products = document.getElementsByClassName('product-table')[0].getElementsByClassName('product');
	var properties, monogrammedProduct = false;
	var monogramPrice, delPriceElem, currentDelPrice, priceWithMonogram;
	
	monogramPrice = getMonogramPrice(products[0].parentNode.getElementsByClassName('product'));

	for (let i = 0; i < products.length; i++) {

		delPriceElem = undefined;
		currentDelPrice = 0;
		priceWithMonogram = 0;
		monogrammedProduct = false;
		properties = products[i].getElementsByClassName('product__description__property');

		for (let j = 0; j < properties.length; j++) {
			if(properties[j].innerHTML.toUpperCase().includes('MONOGRAM')){
				monogrammedProduct = true;
				break;
			}
		}

		if(monogrammedProduct && products[i].dataset.priceWithMonogram == undefined){
			delPriceElem = products[i].getElementsByClassName('product__price')[0].getElementsByClassName('order-summary__small-text');
			if(delPriceElem && delPriceElem.length > 0){
				delPriceElem = delPriceElem[0];
				currentDelPrice = delPriceElem.innerText.replace('$', '') * 1;
				priceWithMonogram = (1 * currentDelPrice + monogramPrice).toFixed(2);
				products[i].getElementsByClassName('product__price')[0].getElementsByClassName('order-summary__small-text')[0].innerText = '$' + (1 * currentDelPrice + monogramPrice).toFixed(2);
				products[i].dataset.priceWithMonogram = priceWithMonogram;
			}
		}
	}
}

/*
 * This function will get the related monogram price
* of a particular product (previous or next product in cart)
 */
function getMonogramPrice(products){
	var monogramPrice = 0, monogramSubtotal, monogramQty;

	for (let i = 0; i < products.length; i++) {
		if(products[i].getElementsByClassName('product__description__name')[0].innerHTML.toUpperCase().includes('MONOGRAM')){
			monogramQty = products[i].getElementsByClassName('product-thumbnail__quantity')[0].innerText * 1;
			monogramSubtotal = products[i].getElementsByClassName('product__price')[0].getElementsByClassName('order-summary__emphasis')[0].innerText.replace('$', '') * 1;
			monogramPrice = monogramSubtotal / monogramQty;
			break;
		}
	}

	return monogramPrice;
}

function appendShippingMessage(){
	if(document.querySelector('#shipping-method-msg')){
		return;
	}
	
	const shippingTitleElem = document.querySelector('.section--shipping-method .section__title');
	let shippingMsgElem = document.createElement('p');
	shippingMsgElem.innerHTML = shippingMethodMessage;
	shippingMsgElem.setAttribute('id', 'shipping-method-msg');
	insertAfter(shippingTitleElem, shippingMsgElem);
}

function setupHatPackagingInfo(){
	const products = document.querySelectorAll('.product-table .product');

	for (let i = 0; i < products.length; i++) {
		const productProperties = products[i].querySelectorAll('.product__description__property');

		for (let j = 0; j < productProperties.length; j++) {
			if(productProperties[j].innerText.includes('isPackagingProduct')){
				// Hide Packaging Product
				products[i].classList.add('hidden');
				break;
			} else if(productProperties[j].innerText.includes('isBeachHatsCollection')){
				// Change Packaging Product Quantites
				const productQuantity = + products[i].querySelector('.product-thumbnail__quantity').innerText;
				productProperties[j].innerText = productProperties[j].innerText.replace('isBeachHatsCollection', 'Packaging Quantity').replace('true', productQuantity)
				break;
			}
		}
	}
}

function insertAfter(targetNode, newNode) {
	if(getCurrentStep() == CHECKOUT_STEPS.SHIPPING){
		targetNode.parentNode.insertBefore(newNode, targetNode.nextSibling);
	}
}

var mutationHappened = false;
document.addEventListener("DOMContentLoaded", function() {
	shippingMethodMessage = document.querySelector('#shipping-method-message-t').value;

	new MutationObserver((mutations) => {
		mutations.forEach(({type, target}) => {
			if(!mutationHappened){
				mutationHappened = true;
				setTimeout(function(){
					hideBFCMDiscountLine();
					updateMonogramSubtotals();
					appendShippingMessage();
					setupHatPackagingInfo();
					mutationHappened = false;
				}, 100);
			}
		});
	}).observe(document.querySelector('.order-summary__sections'), { childList: true, subtree: true });

	hideBFCMDiscountLine();
	updateMonogramSubtotals();
});