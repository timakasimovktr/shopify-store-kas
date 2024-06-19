import {adjust_cart_with_bundles} from './ajax-form.js'

if($('.section-complete_the_look').length > 0) {
	const $doc = $(document);

	function checkAddtocart(obj, from) {
		var $parent = $(obj).parents('.product-complete-the-look');

		var color = '';
		if($parent.find('.complete-the-look-color:checked').length > 0) {
			color = $parent.find('.complete-the-look-color:checked').val();
		}

		var size = '';
		if($parent.find('.complete-the-look-size').length > 0) {
			size = $parent.find('.complete-the-look-size').val();
		}

		var qty = parseInt($parent.find('.complete-the-look-qty').val());

		var $variants = $parent.find('.complete-the-look-variants');
		var options = $variants.data('options') ? $variants.data('options').split(',') : [];

		var data_color = '';
		var data_size = '';
		var data_val = '';
		var data_inventory = 0;
		var variant_id = -1;
		var variant_img = '';

		$variants.find('option').each(function(i){
			data_color = '';
			data_size = '';
			for(var j in options) {
				if(options[j] == 'color') {
					data_color = $(this).data('color');
				} else if(options[j] == 'size') {
					data_size = $(this).data('size');
				}
			}

			data_val = $(this).val();

			if(data_color == color && data_size == size && data_val != '') {
				if($(this).data('available')) {
					data_inventory = parseInt($(this).data('inventory'));
					if(data_inventory === 0) {
						variant_id = data_val;
					} else if(data_inventory > 0) {
						if(data_inventory >= qty) {
							variant_id = data_val;
						}
					}
				} else {
					variant_id = 0;
				}

				variant_img = $(this).data('image');
			}
		});

		if(variant_id > 0) {
			if(qty > 0) {
				$variants.val(variant_id);
				$parent.find('.complete-the-look-btn').attr('disabled', false).val(cartbtn_status.add_to_cart);

				selectIncludedProduct(obj, color, size);
			} else {
				$parent.find('.complete-the-look-btn').attr('disabled', true).val(cartbtn_status.add_to_cart);
			}

			if(variant_img != '') {
				$parent.find('.product__image-inner--first').css('background-image', 'url(' + variant_img + ')');
			}
		} else if(variant_id == 0) {
			$parent.find('.complete-the-look-btn').attr('disabled', true).val(cartbtn_status.out_of_stock);

			if(variant_img != '') {
				$parent.find('.product__image-inner--first').css('background-image', 'url(' + variant_img + ')');
			}
		} else {
			$parent.find('.complete-the-look-btn').attr('disabled', false).val(cartbtn_status.add_to_cart);

			if($parent.find('.complete-the-look-color:checked').length > 0 && from == 'color') {
				variant_img = $parent.find('.complete-the-look-color:checked').data('image');
			} else {
				variant_img = $parent.find('.product__image-inner--first').data('original-image');
			}

			let $imgFolder = $parent.find('.product__image-inner--first');
			let isInit = $imgFolder.data('init');
			if(isInit == '1') {
				$imgFolder.data('init', 0);
			} else {
				$imgFolder.css('background-image', 'url(' + variant_img + ')');
			}
		}

	}

	function selectIncludedProduct(obj, color, size) {
		var $parent = $(obj).parents('.product-complete-the-look');

		if($parent.find('.complete-the-look_included').length > 0) {
			$parent.find('.complete-the-look_included').each(function(i){
				var options = $(this).data('options').split(',');
				var one_color = $(this).data('color-name');

				var data_color = '';
				var data_size = '';
				var data_val = '';
				var variant_id = 0;

				$(this).find('option').each(function(i){
					data_color = '';
					data_size = '';
					for(var j in options) {
						if(options[j] == 'color') {
							data_color = $(this).data('color');
						} else if(options[j] == 'size') {
							data_size = $(this).data('size');
						}
					}

					data_val = $(this).val();

					if(one_color != '') {
						if(data_color == one_color && data_size == size && data_val != '') {
							variant_id = data_val;
						}
					} else {
						if(data_color == color && data_size == size && data_val != '') {
							variant_id = data_val;
						}
					}
				});

				if(variant_id > 0) {
					$(this).val(variant_id);
				}
			});
		}
	}

	function addSubmitCompleteTheLook(obj, isnoDiscountsAllowed, isFinalSale) {
		var $parent = $(obj).parents('.product-complete-the-look');

		var qty = parseInt($parent.find('.complete-the-look-qty').val());

		var $variants = $parent.find('.complete-the-look-variants');
		var bundleID = $variants.val();
		var $selOption = $variants.find('option[value="' + bundleID + '"]');

		if($parent.find('.complete-the-look_included').length > 0) {
			var variant_id = 0;
			var included_params = [];
			var params = {};
			$parent.find('.complete-the-look_included').each(function(i){
				variant_id = $(this).val();

				params = {
					"id": variant_id, 
					"quantity": qty,
					"properties": {
						"Bundle Image": $selOption.data('image'),
						"Bundle Title": $parent.find('.product__title').text(),
						"Bundle Variant Title": $selOption.data('variant-title'),
						"Bundle Item Title": $(this).data('title').trim(),
						"Bundle URL": $selOption.data('url'),
					}
				};

				if (isnoDiscountsAllowed) {
					var noDiscountsAllowed = "Not eligible for discounts or promo codes";
					Object.assign(params["properties"], {"noDiscountsAllowed": noDiscountsAllowed});
				}
	
				if (isFinalSale) {
					var FinalSale = "Final Sale";
					Object.assign(params["properties"], {"saleDiscountMsg": FinalSale});
				}

				included_params.push(params);
			});

			if(included_params.length > 0) {
				for (var i = included_params.length - 1; i >= 0; i--) {
					addToCartCompleteTheLook(included_params[i]);
				}
			}
		} else {
			var variant_id = $parent.find('.complete-the-look-variants').val();

			var params = {
				"id": variant_id, 
				"quantity": qty,
				"properties": {
				}
			};

			if (isnoDiscountsAllowed) {
				var noDiscountsAllowed = "Not eligible for discounts or promo codes";
				Object.assign(params["properties"], {"noDiscountsAllowed": noDiscountsAllowed});
			}

			if (isFinalSale) {
				var FinalSale = "Final Sale";
				Object.assign(params["properties"], {"saleDiscountMsg": FinalSale});
			}
			
			addToCartCompleteTheLook(params);
		}
	}

	function addToCartCompleteTheLook(params) {
		const $cartDropdown = $('.cart .cart__inner');
		const $cart_popup = $( '.cart-popup__overlay' )
    const $cart_popup_slide = $( '.cart-popup__slide' )
		
		$.ajax({
			url: '/cart/add.js',
			type: 'POST',
			dataType: 'json',
			data: params,
			async: false,
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
						adjust_cart_with_bundles();
					}
				});
			}
		});
	}

	function preselectFirstAvailableVariant(){
		var $ctlSelect, $ctlSelectOptions, selectedOptionIndex, $colorOptionInputs, variantColor, $targetColorInput;

		$ctlSelect = $('.complete-the-look-variants');
		$ctlSelectOptions = $ctlSelect.find('option');
		selectedOptionIndex = -1;
		$colorOptionInputs = $(`.section-complete_the_look .list-radios-colors input`);
		
		for (let i = 0; i < $ctlSelectOptions.length; i++) {
			if(+$($ctlSelectOptions[i]).data('inventory') > 0){
				selectedOptionIndex = i;
				break;
			}
		}

		if(selectedOptionIndex > -1){
			variantColor = $($ctlSelectOptions[selectedOptionIndex]).data('color');

			for (let i = 0; i < $colorOptionInputs.length; i++) {
				if($($colorOptionInputs[i]).val() == variantColor){
					$targetColorInput = $($colorOptionInputs[i]);
					$targetColorInput.attr('checked', true);
					$(".product-complete-the-look_left .form__label").text("Color: " + $targetColorInput.data('text'));
					return;
				}
			}
		}
	}

	$doc.on('change', '.complete-the-look-color', function(event) {
		event.preventDefault();
		const $parent = $(this).parents('.product-complete-the-look');
		const color_label = $(this).data('text');
		$parent.find('.form__label').text("Color: " + color_label);

		checkAddtocart($(this), 'color');
	});

	$doc.on('change', '.complete-the-look-size, .complete-the-look-qty', function(event) {
		event.preventDefault();

		checkAddtocart($(this), 'size');
	});

	$doc.on('click', '.complete-the-look-btn', function(event) {
		event.preventDefault();

		var $parent = $(this).parents('.product-complete-the-look');
		var qty = parseInt($parent.find('.complete-the-look-qty').val());
		var variant_id = $parent.find('.complete-the-look-variants').val();

		var isnoDiscountsAllowed = $('.complete-the-look-qty').data('no-discounts-allowed') === true;
		var isFinalSale = $('.complete-the-look-qty').data('sale-discounts-msg') === true;
		if(variant_id && qty > 0) {
			addSubmitCompleteTheLook($(this), isnoDiscountsAllowed, isFinalSale);
		}
	});

	document.addEventListener('DOMContentLoaded', () => {
		document.querySelectorAll('.complete-the-look-variants').forEach((select) => {
			const el = select.selectedOptions[0]
			if(!el) return;
			const productId = select.dataset.productId;
			if(el.dataset.inventory === '-1') {
				el.selected = false;
				Array.from(select.options).some(option => {
					const inventory = option.dataset.inventory || -1
					if(+inventory > 0) {
						option.selected = true;
						const color = option.dataset.color
						const size = option.dataset.size
						document.querySelectorAll(`input[data-product_id="${productId}"]`).forEach(input => {
							input.removeAttribute('checked')
							if(input.value === color){
								input.setAttribute('checked', 'true');
							}
						})
						document.querySelectorAll(`option[data-product-id="${productId}"]`).forEach(option => {
							option.removeAttribute('selected')
							if(option.value === size) option.setAttribute('selected', 'true')
						})
						return true;
					}
					return false;
				})
				checkAddtocart($(this), 'color');
				checkAddtocart($(this), 'size');
			}
		})
	})

	// $('.complete-the-look-color[checked]').trigger('change', null);
	setTimeout(() => {
		document.querySelectorAll('.complete-the-look-color[checked]').forEach(el => el.click())
		$('.complete-the-look-size').trigger('change', null);

		preselectFirstAvailableVariant();
	}, 600)
}