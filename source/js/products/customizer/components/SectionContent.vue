<template>
  <div class="section__content customizer__controls">
    <h4 class="customizer__controls--subject">Monogram this item</h4>

    <h6 class="customizer__controls--title">Select a Font: <span>{{ fontName }}</span></h6>
    <div class="customizer__controls--fonts">
      <div class="customizer__controls--fonts--item" v-for="fi in fonts">
        <img v-if="fi.isPng" :class="{ 'customizer__controls--fonts--item-active': isActiveFont(fi) }"
             v-on:click="selectFont(fi)" v-bind:src="fi.iconSrc"/>

        <div v-else :style="{ 'font-family': fi.name }"
             :class="{ 'customizer__controls--fonts--item-active': isActiveFont(fi) }" v-on:click="selectFont(fi)">Aa
        </div>
      </div>
    </div>

    <span class="customizer__point-monogram--message hidden"
          :style="{'color':pointMonogramColor}">{{ pointMonogramMessage }}</span>

    <h6 class="customizer__controls--title">Select a Thread Color: <span>{{ colorName }}</span></h6>
    <div class="customizer__controls--colors">
      <div class="customizer__controls--colors--item" v-for="tc in colors">
        <div :class="{ 'customizer__controls--colors--item-active': isActiveColor(tc) }" v-on:click="selectColor(tc)">
          <div :style="{ 'background-color': tc.value }"></div>
        </div>
      </div>
    </div>

    <h6 class="customizer__controls--title" v-if="positions.length > 1">Select a Position</h6>
    <v-select v-model="selectedPosition"
              :options="positions"
              @change="selectPlace"
              :hasValue="hasValue"
              :searchable="false"
              v-if="positions.length > 1"></v-select>

    <h6 class="customizer__controls--title">Enter Text</h6>
    <div class="form__row form__row--full customizer__controls--text">
      <input v-model="gerPrintValue"
             placeholder="AaBbCc"
             :maxlength="charLimit"
             v-on:change="changeText"
             v-on:keyup="changeText">
      <span>Limit: {{ gerPrintValue.length }}/{{ charLimit }} characters</span>
    </div>

    <div class="form__row form__row--full customizer__controls--text"
         v-if="this.$store.getters.product.tags.includes('isBundleSet')">
      <select id="variants" class="selectpicker form-control input-lg hidden">
        <option value="31004128477249">Avena / L/XL</option>
        <option value="31004128411713">Light Grey (Turkish Cotton) / L/XL</option>
        <option value="31004128346177">White / L/XL</option>
      </select>
    </div>

    <div class="customizer__controls--actions">
      <div class="form__row form__row--full">
        <input type="button"
               value="add to cart"
               class="btn btn--solid btn--block"
               :disabled="hasValue === false || gerPrintValue == ''"
               v-on:click="addToCart">
      </div>
      <div class="form__row form__row--full">
        <input type="button" value="cancel" class="btn btn--block" id="to_view_normalProduct">
      </div>
      <div class="form__notice form__notice-customizer">
        <p>{{ monogramMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>

import jQuery from 'jquery';
import axios from 'axios';
import vSelect from 'vue-select';

export default {
  name: 'SectionContent',
  props: ['variantActive'],
  components: {
    vSelect,
    jQuery
  },
  data() {
    return {
      printValue: this.$store.getters.printValue,
      limitPrintValue: this.$store.getters.limitPrintValue
    }
  },
  computed: {
    fonts() {
      return this.$store.getters.printFonts
    },
    fontName() {
      return this.$store.getters.printFontActive.name.replace(/-/g, " ")
    },
    colors() {
      return this.$store.getters.printColors
    },
    colorName() {
      return this.$store.getters.printColorActive.name
    },
    positions() {
      return this.$store.getters.printPlaces
    },
    hasValue() {
      return this.$store.getters.printPlaceSelected
    },
    selectedPosition: {
      get: function () {
        return this.$store.getters.printPlaceActive
      },
      set: function (place) {
        if (place === null) {
          this.$store.dispatch('SET_PLACESTATUS', false)
        } else {
          this.selectPlace(place)
          this.$store.dispatch('SET_PLACESTATUS', true)
        }
      }
    },
    charLimit() {
      if (this.$store.getters.printFontActive.name == 'point-monogram') {
        let monogramInput = jQuery('.customizer__controls--text input')

        if (monogramInput.val().length > 3) {
          let substringText = monogramInput.val().substring(0, 3)
          this.$store.dispatch('SET_VALUE', substringText)
        }

        return 3
      } else {
        return this.$store.getters.limitPrintValue
      }
    },
    monogramMessage() {
      return this.$store.getters.monogramMessage
    },
    pointMonogramMessage() {
      return this.$store.getters.pointMonogramMessage
    },
    pointMonogramColor() {
      return this.$store.getters.pointMonogramColor
    },
    gerPrintValue() {
      return this.$store.getters.printValue
    }
  },
  methods: {
    isActiveFont(font) {
      return this.$store.getters.printFontActive.name == font.name
    },
    isActiveColor(color) {
      return this.$store.getters.printColorActive.name == color.name
    },
    selectFont(font) {
      if (font.name == 'point-monogram') {
        jQuery('.customizer__point-monogram--message').removeClass('hidden')
      } else {
        jQuery('.customizer__point-monogram--message').addClass('hidden')
      }

      this.$store.dispatch('SET_FONT', font)
    },
    selectColor(color) {
      this.$store.dispatch('SET_COLOR', color)
    },
    selectPlace(place) {
      this.$store.dispatch('SET_PLACE', place)
    },
    changeText(evt) {
      this.$store.dispatch('SET_VALUE', evt.target.value)
    },
    addToCart(evt) {
      let data = {
        color: this.$store.getters.printColorActive.name,
        font: this.$store.getters.printFontActive.name,
        place: this.$store.getters.printPlaceActive.id,
        value: this.$store.getters.printValue
      }

      let qty = 1

      const isNotAllowed = this.$store.getters.product.tags.filter(item => {
        return item === "no_discounts_allowed";
      });

      const isFinalSale = this.$store.getters.product.tags.filter(item => {
        return item === "Final Sale";
      });
      const hasBundleTag = this.$store.getters.product.tags.find(tag => tag === 'bundle');

      let params = {
        "id": this.$store.getters.variantActive.id,
        "quantity": qty,
        "properties": {
          "MonogramQuantity": this.$store.getters.store_mono_product_fee_quntity[this.$store.getters.variantActive.id] || 1,
          "Monogram Text": this.$store.getters.printValue,
          "Monogram Font": this.$store.getters.printFontActive.name,
          "Monogram Color": this.$store.getters.printColorActive.name,
          "Monogram Place": this.$store.getters.printPlaceActive.id
        }
      }

      if (isNotAllowed.length === 1 && isFinalSale.length === 0) {
        params['properties'] = {
          ...params['properties'],
          "noDiscountsAllowed": "Not eligible for discounts or promo codes",
        }
      }

      if (isNotAllowed.length === 1 && isFinalSale.length === 1) {
        params['properties'] = {
          ...params['properties'],
          "saleDiscountMsg": "Final Sale",
        }
      }

      const addMonogramProduct = (response) => {
        let params_material = {
          "id": this.$store.getters.productMonogramFee.variants[0].id,
          "quantity": this.$store.getters.store_mono_product_fee_quntity[this.$store.getters.variantActive.id] || 1
        }
        axios.post('/cart/add.js', params_material)
            .then(response1 => {
              axios.get('/cart')
                  .then(response2 => {
                    let cartDropdown = jQuery('.cart .cart__inner');
                    let responseRes = jQuery(response2.data);
                    let result = null;
                    if (jQuery(responseRes).find('.main > .hidden > form').length) {
                      result = jQuery(responseRes).find('.main > .hidden > form');
                    } else {
                      result = jQuery(responseRes).find('.main > .hidden > .cart-empty');
                    }

                    jQuery(cartDropdown).find('form, .cart-empty').remove();
                    jQuery(result).appendTo(jQuery(cartDropdown));
                    jQuery(cartDropdown).addClass('is-expanded');

                    jQuery('a.cart__link.js-btn-expand')[0].click();
                    jQuery('#to_view_normalProduct')[0].click();
                    jQuery(window).scrollTop(0);

                    monogramSubmit();
                    //adjust_cart_with_bundles();
                  })
                  .catch(e => {
                    this.errors.push(e)
                  })
            })
            .catch(e => {
              this.errors.push(e)
            })
      }

      if (this.$store.getters.store_mono_product_fee_quntity[this.$store.getters.variantActive.id] > 1) {
        let productsToAdd = [];
        if (!window.behaveAsBundle()) {
          productsToAdd.push({
            quantity: parseInt($("#field-qty").val()),
            id: parseInt($('select[name="id"]').val()),
          });
        } else {
          window.calculateBundlePriceAndStock();
          const product = this.$store.getters.product
          const bundleVariantId = this.$store.getters.variantActive.id
          const bundle_discount = this.$store.getters.bundle_discount

          if ($(".bundle-errors-container > div").length > 0) {
            $(".bundle-errors-container").show();
          } else {
            $(this).addClass("loading");
            $(".bundle-errors-container").hide();
            let productsInBundle = jQuery.map(cartItems, function (variant) {
              return variant.id
            });

            $(cartItems).each(function (i, variant) {
              let bundledItemInitialQty = getBundledQtyOfVariantId(variant.id);
              productsToAdd.push({
                quantity: parseInt($("#field-qty").val()) * bundledItemInitialQty,
                id: parseInt(variant.id),
                properties: {
                  ...params.properties,
                  'addedAsBundle': 'true',
                  'bundle': product.title,
                  'bundleVariantId': bundleVariantId,
                  'productsInBundle': productsInBundle,
                  'discountAmount': bundle_discount,
                  'bundleUnitPrice': bundleUnitPrice.toFixed(2),
                  'bundleUnitDiscount': (bundle_discount / 100).toFixed(2),
                  'bundleRealPrice': bundleRealPrice,
                  'bundleDiscountedPrice': bundleDiscountedPrice,
                  'bundleImage': selectedBundleImage,
                  'bundleUrl': window.location.origin + product.url,
                  'quantity': parseInt($("#field-qty").val()),
                  'initialQty': bundledItemInitialQty,
                  'redirect_url': window.product.redirection_url,
                  'hasBundleTag': `${!!hasBundleTag}`,
                }
              });
            });
          }
        }
        window.pushProductsToShopify(productsToAdd, addMonogramProduct);
        return;
      }

      axios.post('/cart/add.js', params)
          .then(addMonogramProduct)
          .catch(e => {
            this.errors.push(e)
          })
    }
  }
}
</script>

