<template>
	<div class="shell customizer-product-layout">
		<div class="section__inner">
			<section-image v-bind="{ variantActive }"></section-image>
			<section-content v-bind="{ variantActive }"></section-content>
		</div>
	</div>
</template>

<script>

import SectionImage from './components/SectionImage.vue'
import SectionContent from './components/SectionContent.vue'

export default {
	name: 'Customizer',
	components: {
		SectionImage,
		SectionContent
	},
	data() {
		return {

		}
	},
	computed: {
	    variants() {
	      return this.$store.getters.variants
	    },

	    variantActive() {
	      return this.$store.getters.variantActive
	    },
	}

}
</script>

