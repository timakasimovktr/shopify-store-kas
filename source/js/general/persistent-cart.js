$(document).ready(function(){
	function adjustPersistentCart(obj) {
		if($(obj).length > 0) {
			var _matchedIndexes = [];
			var _matchedHideIndexes = [];
			var _matchedProducts = [];

			var _cart_bundleProduct = '';
			for(var i=0; i<_cart_bundleProductsData.length;i++) {
				_cart_bundleProduct = _cart_bundleProductsData[i];
				var _bundle_data_arr = _cart_bundleProduct.split('@@');
				var _bundle_title = _bundle_data_arr[0];
				var _bundle_image = _bundle_data_arr[1];
				var _bundle_includes_arr = _bundle_data_arr[2].split(',');

				var _bundle_include_matches = 0;
				var _sub_matched_index = 0;
				var _sub_matched_index_hides = [];
				for (var j=0; j<_bundle_includes_arr.length; j++) {
					var _bundle_include_handle = _bundle_includes_arr[j];

					$(obj).find('tr').each(function(index){
						var sub_line_string = $(this).find('td:nth-child(2)').text();
						var sub_lastIndex = sub_line_string.lastIndexOf('-');
						var sub_line_title = sub_line_string.substr(0, sub_lastIndex).toLowerCase();
						sub_line_title = sub_line_title.trim().replace(/-/g, ' ').replace(/  /g, ' ').replace(/  /g, ' ').replace(/ /g, '-');

						if(sub_line_title == _bundle_include_handle) {
							_bundle_include_matches += 1;

							if(j == 0) {
								_sub_matched_index = index;
							} else {
								_sub_matched_index_hides.push(index);
							}
						}
					});
				}
				if(_bundle_include_matches == _bundle_includes_arr.length) {
					_matchedIndexes.push(_sub_matched_index);
					_matchedProducts.push(_cart_bundleProduct);
					for(var m=0; m<_sub_matched_index_hides.length; m++) {
						_matchedHideIndexes.push(_sub_matched_index_hides[m]);
					}
				}
			}

			$(obj).find('tr').each(function(index){
				var line_string = $(this).find('td:nth-child(2)').text();
				var lastIndex = line_string.lastIndexOf('-');
				var line_title = line_string.substr(0, lastIndex);
				var line_options = line_string.substr(lastIndex);

				var _lower_title = line_string.toLowerCase();
				if(_lower_title.indexOf('monogramming') != -1) {
					$(this).hide();
				}

				if(_matchedIndexes.length > 0) {
					if(_matchedIndexes.indexOf(index) != -1) {
						var _matchedIndex = _matchedIndexes.indexOf(index);
						var line_img = $(this).find('td:nth-child(1) img');
						var line_product = $(this).find('td:nth-child(2)');
						var _bundle_product = _matchedProducts[_matchedIndex];
						var _line_bundle_data_arr = _bundle_product.split('@@');
						var _line_bundle_title = _line_bundle_data_arr[0];
						var _line_bundle_image = _line_bundle_data_arr[1];

						$(line_img).attr('src', _line_bundle_image);

						var new_title = _line_bundle_title + ' ' + line_options;
						$(line_product).text(new_title);
					}
				} 

				if(_matchedHideIndexes.length > 0) {
					if(_matchedHideIndexes.indexOf(index) != -1) {
						$(this).hide();
					}
				}
			});
		}
	}

	var _cffConflictModalTable =  setInterval(function(){

		if($('.cffConflictModalTable').length > 0) {
			adjustPersistentCart($('#cffPCFoundCartConflictModalTable'));
			adjustPersistentCart($('#cffPCCurrentCartConflictModalTable'));

			clearInterval(_cffConflictModalTable);
		}
	}, 500);
});