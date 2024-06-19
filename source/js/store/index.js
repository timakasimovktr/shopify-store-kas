// import Vue from 'vue';
import Vue from 'vue/dist/vue.min.js'
import Vuex from 'vuex';
import parseRules from '../helpers/parseRules';
import jQuery from 'jquery';

Vue.use(Vuex)

const printColors = window.store_mono_colors || []
const printFonts = window.store_mono_fonts || []
const printPngFonts = window.store_mono_png_fonts || []
const pointMonogramMessage = window.store_mono_point_monogram_message || []
const pointMonogramColor = window.store_mono_point_monogram_color || []
const printPlaces = window.store_mono_tpl_pos
const printCharLimit = window.store_mono_char_limit
const printPreviewImages = window.store_mono_tpl_image || []

let variants = window.store_mono_product_variants || []
if (variants.length && !variants.find( v => v.active)) {
  var variant = null;
  var color = null;
  var size = null;
  for (var i = variants.length - 1; i >= 0; i--) {
    if(jQuery('.list-radios-colors').length > 0) {
      color = jQuery('.list-radios-colors input:checked').data('text-original').toLowerCase()
    }

    if(jQuery('.list-radios-boxes').length > 0) {
      size = jQuery('.list-radios-boxes input:checked').data('text').toLowerCase()
    }
    
    variant = variants[i];
    if(variant.options.length > 1) {
      if(variant.option1.toLowerCase() == color && variant.option2.toLowerCase() == size) {
        variants[i].active = true;
      }
    } else {
      if(variant.option1.toLowerCase() == color) {
        variants[i].active = true;
      }
    }
  }
}
// {%- assign bundle_discount = product.tags | where: 'DISCOUNT' | remove: 'DISCOUNT::' | remove: '[' | remove: ']' | remove: '"' | plus: 0 -%}

const store = new Vuex.Store({
  state: {
    variants,
    product: window.store_mono_product || false,
    monogramMessage: window.message[0].monogram,
    store_mono_product_fee_quntity: window.store_mono_product_fee_quntity || {},
    productMonogramFee: window.store_mono_fee_product || false,
    printValue: "",
    limitPrintValue: printCharLimit,
    printColors,
    printFonts,
    printPngFonts,
    pointMonogramMessage,
    pointMonogramColor,
    printPlaces,
    printPreviewImages,
    printPlaceSelected: true
  },
  getters: {
    variants(state) {
      return state.variants
    },

    product(state) {
      return state.product
    },

    bundle_discount(state) {
      const tag = state.product.tags.find(tag => tag.includes('DISCOUNT'));
      return tag ? parseInt(tag.replace(/(DISCOUNT::|\[|]|"|,| )/g, '')) || 0 : 0;
    },

    variantActive(state) {
      if (!state.variants) return false
      return state.variants.find(variant => variant.active)
    },

    monogramMessage(state) {
      return state.monogramMessage
    },

    store_mono_product_fee_quntity(state) {
      return state.store_mono_product_fee_quntity
    },

    productMonogramFee(state) {
      return state.productMonogramFee
    },

    printValue(state) {
      return state.printValue
    },

    limitPrintValue(state) {
      return state.limitPrintValue
    },

    printColors(state) {
      return state.printColors
    },

    printColorActive(state) {
      return state.printColors.find(color => color.active)
    },

    printFonts(state) {
      return state.printFonts
    },

    printPngFonts(state) {
      return state.printFonts
    },

    pointMonogramMessage(state) {
      return state.pointMonogramMessage
    },

    pointMonogramColor(state) {
      return state.pointMonogramColor
    },

    printFontActive(state) {
      return state.printFonts.find(font => font.active)
    },

    printPlaces(state) {
      return state.printPlaces
    },

    printPlaceActive(state) {
      return state.printPlaces.find(placement => placement.active)
    },

    printPreviewImages(state) {
      return state.printPreviewImages
    },

    printPlaceSelected(state) {
      return state.printPlaceSelected
    }
  },
  mutations: {
    setPrintColor(state, printColor) {
      state.printColors = state.printColors.map(function(color, index) {
        color.active = false
        if (color.name == printColor.name) {
          color.active = true
        }
        return color;
      })
    },

    setPrintFont(state, printFont) {
      state.printFonts = state.printFonts.map(function(font, index) {
        font.active = false
        if (font.name == printFont.name) {
          font.active = true
        }
        return font;
      })
    },

    setIsPngFont(state, isPngFont) {
      state.isPngFont = isPngFont
    },

    setPrintPlace(state, printPlace) {
      state.printPlaces = state.printPlaces.map(function(place, index) {
        place.active = false
        if (place.id == printPlace.id) {
          place.active = true
        }
        return place;
      })     
    },

    setPrintValue(state, text) {
      state.printValue = text
    },

    setPrintPlaceSelected(state, status) {
      state.printPlaceSelected = status
    },

    setVariantActive(state, params) {
      let colorName = params['color']
      let sizeName = params['size']
      state.variants = state.variants.map(function(variant, index) {
        variant.active = false

        if (variant.option1.toLowerCase() === colorName) {
          if(sizeName != null) {
            if (variant.option2.toLowerCase() === sizeName) {
              variant.active = true
            }
          } else {
            variant.active = true
          }
        }
        return variant;
      })
    },
  },
  actions: {
    resetOptions({ commit, state }) {
      commit('setPrintValue', "")
      commit('setPrintPlace', state.printPlaces[0])
      commit('setPrintColor', state.printColors[0])
      commit('setPrintFont', state.printFonts[0])
      commit('setIsPngFont', false)
    },
    SET_FONT: ({ commit }, payload) => commit('setPrintFont', payload),
    SET_COLOR: ({ commit }, payload) => commit('setPrintColor', payload),
    SET_PLACE: ({ commit }, payload) => commit('setPrintPlace', payload),
    SET_VALUE: ({ commit }, payload) => commit('setPrintValue', payload),
    SET_PLACESTATUS: ({ commit }, payload) => commit('setPrintPlaceSelected', payload),
    SET_VARIANT: ({ commit }, payload) => commit('setVariantActive', payload),
  }
})

export default store