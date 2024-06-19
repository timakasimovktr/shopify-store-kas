/**
 * Submitted klaviyo form with ajax
 * @param  { String } selectedForm ID for submitted form
 * @return { Void }
 */
function ajaxSubmitKlaviyo(selectedForm) {
  KlaviyoSubscribe.attachToForms(selectedForm, {
    success: function($form) {
      if ($(selectedForm).hasClass('promotion-popup') || ($(selectedForm).closest('.subscribe-simple').length > 0)) {
        localStorage.setItem('promotion_once_submitted', 'true');
        
        var $promotion_wrapper = $('.popup-promotion--content-wrapper');
        if ($promotion_wrapper.length > 0) {
          $promotion_wrapper.addClass('promotion-result');

          /* announcement text set */
            if ($promotion_wrapper.find('.popup-promotion--result-announcement').length > 0) {
              var announcement_text = $promotion_wrapper.find('.popup-promotion--result-announcement').html();
              if ($('header.header .header__bar .shell').length > 0) {
                $('header.header .header__bar .shell').html(announcement_text);
                localStorage.setItem('promotion_result_set_header', 'true');
                localStorage.setItem('promotion_result_set_header_template', announcement_text);
              }
              /* Footer Simple SignUp Form */
                if ($(selectedForm).closest('.subscribe-simple').length > 0) {
                  var $simpleWrapper = $(selectedForm).closest('.subscribe-simple');
                  $(selectedForm).find('.success_message').show().html(announcement_text);
                }
            }

        }
      } else {
        const $message = $(selectedForm).find('.success-message');

        $message.show().text($message.data('message'));

        setTimeout(function() {
          $message.hide();
        }, 4000);
      }
    }
  });
}
$(document).ready(function() {
  $('.form-subscribe').each(function(index) {
    ajaxSubmitKlaviyo(`#${$(this).attr('id')}`);
  });
})
