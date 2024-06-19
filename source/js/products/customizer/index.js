// import Vue from 'vue';
import Vue from 'vue/dist/vue.min.js';
import store from '../../store';
import App from './App.vue';
import jQuery from 'jquery';

let Customizer = () => {
  let rootElem = document.getElementById('product-customizer')
  let CustomizerApp = []

  if (rootElem) {
    CustomizerApp = new Vue({
      el: rootElem,
      template: '<App />',
      store,
      components: {App},
      methods: {
        changeVariantActive: function (params) {
          this.$store.dispatch('SET_VARIANT', params)
        }
      }
    })

    jQuery('[name="color"]').on('click', function () {
      let variantColor = jQuery(this).data('text-original').toLowerCase()
      let variantSize = null;
      if (jQuery('.list-radios-boxes').length > 0) {
        variantSize = jQuery('.list-radios-boxes input:checked').data('text').toLowerCase()
      }
      var params = {
        'color': variantColor,
        'size': variantSize
      };
      CustomizerApp.changeVariantActive(params)
    });

    jQuery('[name="size"]').on('click', function () {
      let variantSize = jQuery(this).data('text').toLowerCase()
      let variantColor = null;
      if (jQuery('.list-radios-colors').length > 0) {
        variantColor = jQuery('.list-radios-colors input:checked').data('text-original').toLowerCase()
      }

      var params = {
        'color': variantColor,
        'size': variantSize
      };
      CustomizerApp.changeVariantActive(params)
    });
  }
}

export default Customizer