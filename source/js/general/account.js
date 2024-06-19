import '../general/subscribe';

(function($, window, document, undefined) {
  const $win = $(window);
  const $doc = $(document);

  $doc.ready(function() {
    $('.addresses .cancel').on('click', function(event) {
      const $section = $(this).closest('.accordion-section');

      $section.find('.accordion-body').slideUp();

      event.preventDefault();
    });
    

    $('.btn-new-adress, .form--add-address .cancel').on('click', function(event) {
      $('.form--add-address').slideToggle();

      event.preventDefault();
    });

    $('.form--register').on('submit', function(event) {
      const $this = $(this);
      const $fieldPass1 = $this.find('#field-password');
      const $fieldPass2 = $this.find('#field-password-2');

      if ($fieldPass1.val() === $fieldPass2.val()) {
        if ($this.find('#field-checkbox').prop('checked')) {
          $('#email_signup-1 input[name="email"]').val($this.find('input[name="customer[email]"]').val());
          $('#email_signup-1').trigger('submit');
          $this.find('.form__notice').addClass('hidden');
        }
      } else {
        $this
          .find('.form__notice')
          .removeClass('hidden')
          .text($fieldPass2.data('error'));
        event.preventDefault();
      }
    });

    $('.addresses .js-default-address').on('click', function(event) {
      event.preventDefault();

      const $this = $(this);
      const $form = $($this.attr('href'));

      if ($form.length) {
        $form.find('input[type="checkbox"]').prop('checked', true);
        $form.submit();
      }
    });

    Shopify.CustomerAddress = {
      toggleForm: function(address_id) {
        const $form = $('#address_form_' + address_id),
          $section = $form.closest('.accordion-section');

        $section
          .find('.accordion-body')
          .stop()
          .slideToggle();

        $section
          .siblings()
          .find('.accordion-body')
          .stop(true, true)
          .slideUp();

        return false;
      },

      destroy: function(id, confirm_msg) {
        if (confirm(confirm_msg || 'Are you sure you wish to delete this address?')) {
          Shopify.postLink('/account/addresses/' + id, { parameters: { _method: 'delete' } });
        }
      }
    };

    // uploadcare file btn
    var uploadBtnInterval = setInterval(function(){
       if($('.uploadcare-widget-button').length > 0) {
        $('.uploadcare-widget-button').text('Attach resale certificate');
        clearInterval(uploadBtnInterval);
      }
    }, 1000);
  });
})(jQuery, window, document);
