/**
 * Init slider
 * @param  { Object } $sliderHolder DOM Element - slider holder
 * @param  { Object } sliderOptions Object with slider options
 * @return { Void }
 */
export function initSlider($sliderHolder, sliderOptions, isThumbs = false) {
  	$sliderHolder.slick(sliderOptions);

		if(isThumbs){
			return;
		}

		$sliderHolder.on('afterChange', function(event, slick, currentSlide, nextSlide){
			const $slick = $(event.currentTarget),
				$slickThumbs = $(`.js-slider-thumbs`),
				$slickCurrentImg = $($slick.find('.slick-current img')[0]);
			var $slickThumb, thumbAlt;
			
			for (let i = 0; i < $slickThumbs.length; i++) {
				if($slickThumbs.data('slick-id') ==  $slick.attr('id')){
					$slickThumb = $($($slickThumbs[i]).find('.slick-slide')[currentSlide]);
					thumbAlt = $slickThumb.find('img').attr('alt').split('|');
					if(Array.isArray(thumbAlt)){
						thumbAlt = thumbAlt[0];
					}
					console.log('*------------' + thumbAlt);
					$slickCurrentImg.attr('alt', thumbAlt);
					break;
				}
			}
		});
}