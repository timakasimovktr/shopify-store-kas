$(document).ready(function(){
    $('.interior_design--js--form').on('submit', function(event){
      const $this = $(this);
      const $fieldPass1 = $this.find('#field-password');
      const $fieldPass2 = $this.find('#field-password-2');
      const $fieldCertificate = $this.find('#field-resale-certificate');

      if ($this.find('#field-resale-certificate').val() != '') {

        $this.find('.form__notice').addClass('hidden');
        event.preventDefault();

        var username = $('#field-first-name').val() + ' ' + $('#field-last-name').val();
        $('#field-username').val(username);

        var action = $(this).attr('action');
        var formData = $(this).serialize();
        $.ajax({
          method: "POST",
          url: action,
          data: formData
        })
        .always(function(msg) {
          $this.addClass('hidden');
          $('.form__interior-confirmation').removeClass('hidden');
        });
        
      } else {
        $this
          .find('.form__notice')
          .removeClass('hidden')
          .text($fieldCertificate.data('error'));
        event.preventDefault();
      }

    });
});