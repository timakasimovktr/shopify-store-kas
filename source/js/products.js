// IMPORT VUEJS
import Vue from 'vue/dist/vue.min.js';

import 'jquery-zoom/jquery.zoom.min';

// IMPORT PRODUCTS
import './products/zoom-image';
import './products/variant';

import Customizer from './products/customizer';

$(document).ready(function($) {
	Customizer();

	$('#to_view_customizer').click(function(){
		$('.normal-product-layout').hide();
		$('.customizer-product-layout').show();
	});

	$('#to_view_normalProduct').click(function(){
		$('.customizer-product-layout').hide();
		$('.normal-product-layout').show();
	});
});
