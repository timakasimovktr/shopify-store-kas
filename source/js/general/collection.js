let filtered_options = new Object();
filtered_options['color'] = '';
filtered_options['size'] = '';
filtered_options['weight'] = '';
filtered_options['fabric'] = '';
filtered_options['material'] = '';
filtered_options['style'] = '';
filtered_options['sort'] = '';
var _t_size_str_array = [], _t_size_str = "";

function reset_filtered_options() {
  filtered_options['color'] = '';
  filtered_options['size'] = '';
  filtered_options['weight'] = '';
  filtered_options['fabric'] = '';
  filtered_options['material'] = '';
  filtered_options['style'] = '';

  $('.collection-toolbar__row--types .collection-toolbar__filter').each(function(i){
    var type = $(this).data('type');
    $(this).html(type);
    $(this).removeClass('collection-toolbar__filter--on');
  });

  $('.collection-toolbar__row--types .collection-toolbar__list').find('.collection-toolbar__filter--cancel').remove();

  collection_filter_by_options(true);
}

function isReseted() {
  if(filtered_options['color'] == '' && filtered_options['size'] == '' && filtered_options['weight'] == '' && filtered_options['fabric'] == '' && filtered_options['material'] == '' && filtered_options['style'] == '') {
    return true;
  } else {
    return false;
  }
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function update_filtered_options(name, value) {
  filtered_options[name] = value;

  let $typeBtn = $('.collection-toolbar__row--types .collection-toolbar__filter[data-type="' + name + '"]');
  var defaultKeys=['color', 'size', 'weight', 'fabric', 'material', 'style'];
  var defaultKey = '', valuePair = [];
  if(name != "sort"){
    if(value != "") {

      for (var i=0; i<defaultKeys.length; i++) {
        defaultKey = defaultKeys[i];
        if (value.indexOf(defaultKey) != -1) {
          valuePair = value.split(defaultKey + ':');
          value = valuePair[(valuePair.length - 1)];
        }
      }

      $typeBtn.html(value);
      $typeBtn.addClass('collection-toolbar__filter--on');
    } else {
      $typeBtn.html(name);
      $typeBtn.removeClass('collection-toolbar__filter--on');
    }
  }

  collection_filter_by_options(true);
}

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function collection_filter_by_options(byAction) {
  /* To set the filtered image */
    _t_size_str_array = [];
    _t_size_str = "";
    _t_size_str_array = filtered_options['size'].split('size:');
    if (_t_size_str_array.length > 1) {
      _t_size_str = _t_size_str_array[1];
    }
    var productImage = "";

  $('.section-collections .products .product').hide().css('order', 'unset');
  $('.section-collections .products .product').each(function(index){

    /* To set the filtered image by size */
      var $sizeFilterTemplate = $('.collection-toolbar__row--types .collection-toolbar__filter[data-type="size"]');

      if ($sizeFilterTemplate.length > 0) {
        if ($sizeFilterTemplate.attr('data-interact-image') == "true") {
          productImage = imagesToValue($(this).attr('data-product-images'), _t_size_str);
          if (typeof productImage != 'undefined') {
            if (productImage != '') {
              $(this).find('.product__image-inner--first').css( 'background-image', `url('${productImage}')` );
            }
          }          
        }
      }

    var url_params = '?';
    if(filtered_options['sort'] != "") {
      url_params += '?sort=' + filtered_options['sort'];
    }

    var template = $(this).data('template');

    var _color = true;
    $(this).find('.list-colors li').removeClass('current');
    if(filtered_options['color'] != "") {
      var _master_colors = options_by_color;
      var _mc_index = 0;
      for (var m = 0; m < _master_colors.length; m++) {
        var _mc_item = _master_colors[m].split('|');
        if(_mc_item[0] == filtered_options['color']) {
          _mc_index = m;
        }
      }
      var _vanity_colors_all = vanity_colors_list;
      var _vanity_colors = _vanity_colors_all[_mc_index].split('||');

      var _color_matched = false;
      $(this).find('.list-colors a').each(function(){
        var colorObj = $(this);
        var _cn = $(colorObj).data('color-name');
        for(var j = 0; j < _vanity_colors.length; j++) {
          var _vc_item = _vanity_colors[j].split('|');

          if(_cn == _vc_item[0]) {
            _color_matched = true;
            
            $(colorObj).parent().addClass('current');

            if(template != 'accessories') {
              var _color_image = $(colorObj).data('image');

              var productImage = $(colorObj).parents('.product').find('.product__image-inner--first');
              var original_image = $(productImage).data('original-image');
              if($(productImage).data('original-image') == null || $(productImage).data('original-image') == '' ) {
                original_image = $(productImage).css('background-image');
              }
              var bgset = $(productImage).data('bgset');
              var classNames = $(productImage).attr('class');
              var innerHtml = $(productImage).html();
              original_image = replaceAll(original_image, '"', '');

              // $(productImage).css('background-image', `url(${_color_image})`);
              $(productImage).replaceWith('<div class="' + classNames + '" data-bgset="' + bgset + '" data-original-image="' + original_image + '" style="background-image: url(' + _color_image + ');">' + innerHtml + '</div>');
            }
          }
        }
      });
      _color = _color_matched;

      url_params += '&colorFilter=' + filtered_options['color'];
    } else {
      if(template != 'accessories') {
        var productImage = $(this).find('.product__image-inner--first');
        if($(productImage).data('original-image') != null && $(productImage).data('original-image') != '' ) {
          var original_image = $(productImage).data('original-image');
          // $(productImage).css('background-image', original_image);
          var bgset = $(productImage).data('bgset');
          var classNames = $(productImage).attr('class');
          var innerHtml = $(productImage).html();

          original_image = replaceAll(original_image, '"', '');

          $(productImage).replaceWith('<div class="' + classNames + '" data-bgset="' + bgset + '" data-original-image="' + original_image + '" style="background-image: ' + original_image + ';">' + innerHtml + '</div>');
        }
      }
    }

    var _size = true;
    if(filtered_options['size'] != "") {
      var data_size = $(this).data('size');
      var size_matches = 0;
      if(data_size != '') {
        var data_sizes = data_size.split(',');
        for (var i = data_sizes.length - 1; i >= 0; i--) {
          if(filtered_options['size'] == data_sizes[i]) {
            size_matches += 1;  
          }
        }
      }

      if(size_matches == 0) {
        _size = false;
      }

      url_params += '&sizeFilter=' + filtered_options['size'];
    }

    var _weight = true;
    if(filtered_options['weight'] != "") {
      var data_weight = $(this).data('weight');
      var weight_matches = 0;
      if(data_weight != '') {
        var data_weights = data_weight.split(',');
        for (var i = data_weights.length - 1; i >= 0; i--) {
          if(filtered_options['weight'] == data_weights[i]) {
            weight_matches += 1;
          }
        }
      }

      if(weight_matches == 0) {
        _weight = false;
      }

      url_params += '&weightFilter=' + filtered_options['weight'];
    }

    var _fabric = true;
    if(filtered_options['fabric'] != "") {
      var data_fabric = $(this).data('fabric');
      var fabric_matches = 0;
      if(data_fabric != '') {
        var data_fabrics = data_fabric.split(',');
        for (var i = data_fabrics.length - 1; i >= 0; i--) {
          if(filtered_options['fabric'] == data_fabrics[i]) {
            fabric_matches += 1;
          }
        }
      }

      if(fabric_matches == 0) {
        _fabric = false;
      }

      url_params += '&fabricFilter=' + filtered_options['fabric'];
    }

    var _material = true;
    if(filtered_options['material'] != "") {
      var data_material = $(this).data('material');
      var material_matches = 0;
      if(data_material != '') {
        var data_materials = data_material.split(',');
        for (var i = data_materials.length - 1; i >= 0; i--) {
          if(filtered_options['material'] == data_materials[i]) {
            material_matches += 1;
          }
        }
      }

      if(material_matches == 0) {
        _material = false;
      }

      url_params += '&materialFilter=' + filtered_options['material'];
    }

    var _style = true;
    if(filtered_options['style'] != "") {
      if(filtered_options['style'] != $(this).data('style')) {
        _style = false;
      }

      url_params += '&styleFilter=' + filtered_options['style'];
    }

    if(_color && _size && _weight && _fabric && _material && _style) {
      $(this).show();
    }

    if(byAction && index == 0) {
      history.pushState({}, "", url_params);
    }
  });
  
  if($('.collection-toolbar').length > 0 && filtered_options['sort'] != '') {
    window.scrollTo(0, $('.collection-toolbar').offset().top - 69);
  }

  switch(filtered_options['sort']) {
    case 'price':
      $('.section-collections .products .product').sort(function(a,b) {
        var a_price = $(a).find('.product__price').text().split("-")[0].trim().replace('$', '');
        var b_price = $(b).find('.product__price').text().split("-")[0].trim().replace('$', '');
          return parseInt(a_price) - parseInt(b_price);
      }).appendTo('.section-collections .products');
      break;

    default:
      $('.section-collections .products .product').sort(function(a,b) {
          return parseInt(a.dataset.index) - parseInt(b.dataset.index);
      }).appendTo('.section-collections .products');
  }

  var orderNumber = 0;
  $('.section-collections .products .product').each(function(i){
    var display = $(this).css('display');
    if(display != 'none') {
      orderNumber += 1;
      $(this).css('order', orderNumber);
    }
  });

  /* Banners */

    /* Insert Banners by Order : CSS property */
      const $banners = $('.products .banner[data-insert-after]');
      $banners.each(function(index) {
        const $this = $(this);
        var orderTimes = parseInt($this.attr('data-insert-after'));
        $this.css('order', (orderTimes + 1));
      });

    /* Show/Hide Banners */
      if(isReseted()) {
        $banners.show();
      } else {
        $banners.hide();
      }
}

function add_filter_cancel() {
  var no_empty = false;
  for(var i in filtered_options) {
    if (i != 'sort') {
      var v = filtered_options[i];
      if(v != "") {
        no_empty = true;
      }
    }
  }

  if(no_empty) {
    if($('.collection-toolbar__row--types .collection-toolbar__list').find('.collection-toolbar__filter--cancel').length == 0) {
      $('.collection-toolbar__row--types .collection-toolbar__list').append('<button class="collection-toolbar__filter collection-toolbar__filter--cancel"><svg class="" height="36" viewBox="0 0 36 36" width="36"><path d="M19.414 18l4.243 4.243a1 1 0 0 1-1.414 1.414L18 19.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L16.586 18l-4.243-4.243a1 1 0 0 1 1.414-1.414L18 16.586l4.243-4.243a1 1 0 0 1 1.414 1.414L19.414 18z" fill-rule="evenodd"></path></svg></button>');
    }
  } else {
    if($('.collection-toolbar__row--types .collection-toolbar__list').find('.collection-toolbar__filter--cancel').length > 0) {
      $('.collection-toolbar__row--types .collection-toolbar__list').find('.collection-toolbar__filter--cancel').remove();
    }
  }
}

function imagesToValue(_temp_images, key) {

  key = key.split(':');
  if (key.length > 0) {
    key = key[0];
  }

  if (typeof _temp_images != 'undefined') {
    _temp_images = JSON.parse(_temp_images);
    for (var _k in _temp_images) {
      if (_k.indexOf(key) != -1) {
        return _temp_images[_k];
      }
    }

    if (typeof _temp_images['default'] != 'undefined') {
      return _temp_images['default'];
    }    
  }
}

$(document).on('click', '.collection-toolbar__row .collection-toolbar__filter', function(e){
  e.preventDefault();

  const $this = $(this);

  if($this.hasClass('collection-toolbar__filter--filter')) {
    if(!$('.collection-toolbar__overlay').hasClass('collection-toolbar__overlay--on')) {
      $('.collection-toolbar__overlay').addClass('collection-toolbar__overlay--on');

      var type = $this.data('type');
      $('.collection-toolbar__overlay .collection-toolbar__overlay__title').hide();
      $('.collection-toolbar__overlay .collection-toolbar__overlay__row').hide();
      if(type == 'filter') {
        $('.collection-toolbar__overlay .collection-toolbar__overlay--filter').show();
      } else {
        $('.collection-toolbar__overlay .collection-toolbar__overlay--sort').show();
      }
      $('.collection-toolbar__overlay .collection-toolbar__overlay__row--actions').show();
    }
  } else {
    if($this.hasClass('collection-toolbar__cancel')) {

    } else if($this.hasClass('collection-toolbar__filter--cancel')) {
      if($this.parents('.collection-toolbar__row--values').length > 0) {
        var value = $this.data('value');
        update_filtered_options(value, '');
      } else {
        reset_filtered_options();
        return true;
      }
    } else {
      if($this.parents('.collection-toolbar__row--values').length > 0) {
        const $rowValues = $this.parents('.collection-toolbar__row--values');

        var selectedType = $rowValues.find('.collection-toolbar__label').html().trim().toLowerCase();
        var value = $this.data('value');

        if(selectedType != 'sort') {
          $this.toggleClass('collection-toolbar__filter--on');
        } else {
          $this.addClass('collection-toolbar__filter--on');
        }

        if($this.hasClass('collection-toolbar__filter--on')) {
          update_filtered_options(selectedType, value);
        } else {
          update_filtered_options(selectedType, '');
        }

        if(!$this.parent().hasClass('collection-toolbar__list-item--sort')) {
          add_filter_cancel();
        }
      } else {
        const $rowValues = $('.collection-toolbar__row--values');

        var selectedType = $this.data('type').toLowerCase();
        $rowValues.find('.collection-toolbar__label').html(selectedType);
        $rowValues.find('.collection-toolbar__options').html('');

        switch(selectedType) {
          case 'color':
            $rowValues.find('.collection-toolbar__options').append('<div class="collection-toolbar__list"><div class="buttons-images"></div></div>');
            for(var i in options_by_color) {
              var color = options_by_color[i];
              var color_vals = color.split("|");
              var _on = filtered_options[selectedType] == color_vals[0] ? 'buttons-images__button--on': '';
              $rowValues.find('.buttons-images').append('<button class="buttons-images__button ' + _on + '" style="background-color:' + color_vals[1] + '" data-value="' + color_vals[0] + '"></button>');
            }
            break;
          case 'size':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_size) {
              var size = options_by_size[i];
              var sizeStrs = size.split("size:");
              if ( sizeStrs.length > 0 ) {
                var sizeLabel = sizeStrs[(sizeStrs.length - 1)];
                sizeLabel = sizeLabel.split(':');
                sizeLabel = sizeLabel[0];

                var _on = filtered_options[selectedType] == size ? 'collection-toolbar__filter--on': '';
                $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item"><button class="collection-toolbar__filter ' + _on + '" data-value=\'' + size + '\'>' + sizeLabel + '</button></li>');
              }
            }
            break;
          case 'weight':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_weight) {
              var weight = options_by_weight[i];
              var weightStrs = weight.split(":");
              var _on = filtered_options[selectedType] == weight ? 'collection-toolbar__filter--on': '';
              $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item"><button class="collection-toolbar__filter ' + _on + '" data-value="' + weight + '">' + weightStrs[1] + '</button></li>');
            }
            break;
          case 'fabric':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_fabric) {
              var fabric = options_by_fabric[i];
              var fabricStrs = fabric.split(":");
              var _on = filtered_options[selectedType] == fabric ? 'collection-toolbar__filter--on': '';
              $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item"><button class="collection-toolbar__filter ' + _on + '" data-value="' + fabric + '">' + fabricStrs[1] + '</button></li>');
            }
            break;
          case 'material':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_material) {
              var material = options_by_material[i];
              var materialStrs = material.split(":");
              var _on = filtered_options[selectedType] == material ? 'collection-toolbar__filter--on': '';
              $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item"><button class="collection-toolbar__filter ' + _on + '" data-value="' + material + '">' + materialStrs[1] + '</button></li>');
            }
            break;
          case 'style':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_style) {
              var style = options_by_style[i];
              var _on = filtered_options[selectedType] == style ? 'collection-toolbar__filter--on': '';
              $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item"><button class="collection-toolbar__filter ' + _on + '" data-value="' + style + '">' + style + '</button></li>');
            }
            break;
          case 'sort':
            $rowValues.find('.collection-toolbar__options').append('<ul class="collection-toolbar__list"></ul>');
            for(var i in options_by_sort) {
              var sort = options_by_sort[i];
              var sortVal = options_by_sort[i].split(" ");
              var _on = filtered_options[selectedType] == sort ? 'collection-toolbar__filter--on': '';
              $rowValues.find('.collection-toolbar__list').append('<li class="collection-toolbar__list-item collection-toolbar__list-item--sort"><button class="collection-toolbar__filter ' + _on + '" data-value="' + sortVal[0] + '">' + sort + '</button></li>');
            }
            break;
        }

        if(selectedType != 'sort' && filtered_options[selectedType] != "") {
          $rowValues.find('.collection-toolbar__list').append('<button class="collection-toolbar__filter collection-toolbar__filter--cancel" data-value="' + selectedType + '"><svg class="" height="36" viewBox="0 0 36 36" width="36"><path d="M19.414 18l4.243 4.243a1 1 0 0 1-1.414 1.414L18 19.414l-4.243 4.243a1 1 0 0 1-1.414-1.414L16.586 18l-4.243-4.243a1 1 0 0 1 1.414-1.414L18 16.586l4.243-4.243a1 1 0 0 1 1.414 1.414L19.414 18z" fill-rule="evenodd"></path></svg></button>');
        }
      }
    }

    if(!$('.collection-toolbar__rows').hasClass('collection-toolbar__rows--on')) {
      $('.collection-toolbar__rows').addClass('collection-toolbar__rows--on');
    } else {
      $('.collection-toolbar__rows').removeClass('collection-toolbar__rows--on');
    }
  }
});

$(document).on('click', '.collection-toolbar__row .buttons-images__button', function(e){
  e.preventDefault();

  const $this = $(this);

  var value = $this.data('value');
  $this.toggleClass('buttons-images__button--on');

  if($this.hasClass('buttons-images__button--on')) {
    update_filtered_options('color', value);
  } else {
    update_filtered_options('color', '');
  }

  add_filter_cancel();

  $('.collection-toolbar__rows').removeClass('collection-toolbar__rows--on');
});

$(document).on('click', '.collection-toolbar__overlay__row .collection-toolbar__filter', function(e){
  e.preventDefault();

  if($(this).parents('.collection-toolbar__list--sort').length > 0) {
    $(this).parents('.collection-toolbar__list--sort').find('.collection-toolbar__filter').removeClass('collection-toolbar__filter--on');
    $(this).addClass('collection-toolbar__filter--on');
    var value = $(this).data('value');
    filtered_options['sort'] = value;
  } else if($(this).parents('.collection-toolbar__overlay__row--actions').length > 0) {
    if($(this).hasClass('collection-toolbar__filter--reverse')) {
      collection_filter_by_options(true);
    } else {
      reset_filtered_options();

      $('.collection-toolbar__overlay__row .collection-toolbar__list--values .collection-toolbar__filter').removeClass('collection-toolbar__filter--on');
      $('.collection-toolbar__overlay__row .buttons-images__button').removeClass('buttons-images__button--on');
    }
    $('.collection-toolbar__overlay').removeClass('collection-toolbar__overlay--on');
  } else {
    var hasClass = $(this).hasClass('collection-toolbar__filter--on');
    $(this).parents('.collection-toolbar__list').find('.collection-toolbar__filter').removeClass('collection-toolbar__filter--on');
    if(hasClass) {
      $(this).removeClass('collection-toolbar__filter--on');
    } else {
      $(this).addClass('collection-toolbar__filter--on');
    }

    var selectedType = $(this).parents('.collection-toolbar__overlay__row').find('.collection-toolbar__overlay__label').html().toLowerCase();

    if($(this).hasClass('collection-toolbar__filter--on')) {
      var value = $(this).data('value');
      filtered_options[selectedType] = value;
    } else {
      filtered_options[selectedType] = '';
    }
  }

});

$(document).on('click', '.collection-toolbar__overlay__row .buttons-images__button', function(e){
  e.preventDefault();

  const $this = $(this);

  var value = $this.data('value');

  var hasClass = $(this).hasClass('buttons-images__button--on');
  $(this).parents('.collection-toolbar__list').find('.buttons-images__button').removeClass('buttons-images__button--on');
  if(hasClass) {
    $(this).removeClass('buttons-images__button--on');
  } else {
    $(this).addClass('buttons-images__button--on');
  }

  if($this.hasClass('buttons-images__button--on')) {
    filtered_options['color'] = value;
  } else {
    filtered_options['color'] = '';
  }
});

$(document).on('click', '.collection-toolbar__overlay__close', function(e){
  $('.collection-toolbar__overlay').removeClass('collection-toolbar__overlay--on');
});

$(document).ready(function(){
  var colorFilter = getUrlParameter('colorFilter');
  var sizeFilter = getUrlParameter('sizeFilter');
  var materialFilter = getUrlParameter('materialFilter');
  var fabricFilter = getUrlParameter('fabricFilter');
  var weightFilter = getUrlParameter('weightFilter');
  var styleFilter = getUrlParameter('styleFilter');
  var sort = getUrlParameter('sort');

  filtered_options['color'] = colorFilter.trim();
  filtered_options['size'] = sizeFilter.trim();
  filtered_options['weight'] = weightFilter.trim();
  filtered_options['fabric'] = fabricFilter.trim();
  filtered_options['material'] = materialFilter.trim();
  filtered_options['style'] = styleFilter.trim();
  filtered_options['sort'] = sort;

  $('.collection-toolbar__options .collection-toolbar__list li button').each(function(i){
    var type = $(this).data('type');
    if(filtered_options[type] != '') {
      if(!$(this).hasClass('collection-toolbar__filter--on')) {
        $(this).addClass('collection-toolbar__filter--on');

        var value = filtered_options[type].toUpperCase();
        var defaultKeys=['COLOR', 'SIZE', 'WEIGHT', 'FABRIC', 'MATERIAL', 'STYLE', 'SORT'];
        var defaultKey = '', valuePair = [];

        if (value != "") {
          for (var i=0; i<defaultKeys.length; i++) {
            defaultKey = defaultKeys[i];
            if (value.indexOf(defaultKey) != -1) {
              valuePair = value.split(defaultKey + ':');
              value = valuePair[(valuePair.length - 1)];
            }
          }
        }

        $(this).html(value);
      }
    }
  });
  /* Add Filter Cancel */
    add_filter_cancel();

  collection_filter_by_options(false);

  $('#pre-load-products').hide();
  $('.products').removeClass('nonvisibled');

  //Use this inside your document ready jQuery 
  $(window).on('popstate', function() {
    location.reload(true);
  });
});




