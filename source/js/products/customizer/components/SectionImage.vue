<template>
	<div class="section__images">
		<div class="customizer-preview-image">
			<img :src="getImgUrl">
			<div class="customizer-preview-area" 
				:style="{ 'font-family': previewFont, 'font-size': previewFontSize, 'color': previewColor, 'top': previewPosTop + '%', 'left': previewPosLeft + '%', 'text-align': previewTextAlign, 'width': previewBlockWidth, 'transform': 'rotate(' + previewPosAngle + 'deg) scale(1) skew(0deg) translate(0px)' }">{{previewValue}}</div>
		</div>
	</div>
</template>

<script>

import jQuery from 'jquery'

export default {
	name: 'SectionImage',
	props: ['variantActive'],
	components: {
		jQuery
	},
	data() {
		return {

		}
	},
	computed: {
		getImgUrl() {
			var img_url = ""

			if(!this.$store.getters.printFontActive.isPng){
				var images = this.$store.getters.printPreviewImages
				var option1 = this.variantActive.option1.toLowerCase()
				if (images.length > 0) {
					for(var i in images) {
						if (images[i].alt.toLowerCase() == option1) {
							img_url = images[i].image
						}
					}
				} else {
					img_url = this.variantActive.featured_image.src
				}
			} else {
				img_url = this.$store.getters.printFontActive.imgSrc
			}
			return img_url
		},
		previewValue: {
			get: function() {
				if(!this.$store.getters.printFontActive.isPng){
					return this.$store.getters.printValue
				} else {
					return ''
				}
			}
		},
		previewFont: {
			get: function() {
				return this.$store.getters.printFontActive.name
			}
		},
		previewFontSize:{
			get: function() {
		    	var fontSize = 24;
		    	var w = jQuery(window).width();
		    	if( w < 1200) {
		    		fontSize = 18;
		    	}
		    	switch(this.$store.getters.printFontActive.name) {
		    		case 'gabriola':
		    			fontSize = 32;
				    	if( w < 1200) {
				    		fontSize = 24;
				    	}
		    			break;
		    	}

		    	return fontSize + 'px'
			}
		},
		previewColor: {
			get: function() {
				return this.$store.getters.printColorActive.value
			}
		},
		previewPosTop: {
			get: function() {
				return this.$store.getters.printPlaceActive.pos_top
			}
		},
		previewPosLeft: {
			get: function() {
				return this.$store.getters.printPlaceActive.pos_left
			}
		},
		previewTextAlign: {
			get: function() {
				return 'center';
			}
		},
		previewPosAngle: {
			get: function() {
				return this.$store.getters.printPlaceActive.pos_angle
			}
		},
		previewBlockWidth: {
			get: function() {
				return this.$store.getters.printPlaceActive.pos_width + '%'
			}
		}
	}

}
</script>

