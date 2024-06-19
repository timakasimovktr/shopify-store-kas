'use strict';
////////////////////////////////////////////////////////////////////////////////////
////////// Dependencies
////////////////////////////////////////////////////////////////////////////////////

import { validateEmail } from './../helpers/validator';

////////////////////////////////////////////////////////////////////////////////////
////////// Classes
////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////
////////// Constants & Variables
////////////////////////////////////////////////////////////////////////////////////

/* --------------- Control & Logic --------------- */


/* --------------- DOM --------------- */

var $klaviyoModalContainer, $klaviyoOutOfStockSelect, $klaviyoSubscriptionEmail, $klaviyoSuccessMsg, $klaviyoErrorMsg;

////////////////////////////////////////////////////////////////////////////////////
////////// Functions & Methods
////////////////////////////////////////////////////////////////////////////////////

/* --------------- Logic & Process --------------- */

function klaviyoBundleSubscription(){
  let email = $klaviyoSubscriptionEmail.val(),
  formData = new FormData(),
  $selectedOption = $klaviyoOutOfStockSelect.find('option:selected');
  var $klaviyoPopupResultMsg = $('.klaviyo-popup-result-msg');
  $klaviyoPopupResultMsg.hide();
  $klaviyoSuccessMsg.hide();

  if (validateEmail(email)) {
    $klaviyoErrorMsg.hide();
    $(this).addClass('loading');
    
    formData = new FormData();
    formData.append('email', email);
    formData.append('variant_id', $selectedOption.val());
    formData.append('variant_title', $selectedOption.text());
    formData.append('product_id', $klaviyoOutOfStockSelect.data('product-id'));

    $.ajax({
      async: true,
      crossDomain: true,
      url: '/apps/klaviyo-back-in-stock/onsite/components/back-in-stock/subscribe',
      type: 'POST',
      processData: false,
      contentType: false,
      mimeType: 'multipart/form-data',
      data: formData,
      success: function(res) {
        $klaviyoPopupResultMsg.show();
        $klaviyoSuccessMsg.show();
        $(this).removeClass('loading');
      }
    });
  } else {
    $('#error_message').show();
    $('#error_message').text('Please enter a valid email.');
  }
}

/* --------------- Utils & Tools --------------- */

////////////////////////////////////////////////////////////////////////////////////
////////// Events
////////////////////////////////////////////////////////////////////////////////////

function onDocumentLoaded(){
  /* --------------- Variable Cache --------------- */

  $klaviyoModalContainer = $('.container-klaviyo-modal');
  $klaviyoSubscriptionEmail = $klaviyoModalContainer.find('#email');
  $klaviyoOutOfStockSelect = $klaviyoModalContainer.find('#klaviyo-variants');
  $klaviyoSuccessMsg = $klaviyoModalContainer.find('#completed_message');
  $klaviyoErrorMsg = $klaviyoModalContainer.find('#error_message');
  
  /* --------------- Events Setup --------------- */
  
  $('.container-klaviyo-modal .js-notify-btn').on('click', klaviyoBundleSubscription);
  
  /* --------------- Initialization--------------- */
  
  
  /* --------------- Window Export --------------- */
}

document.addEventListener('DOMContentLoaded', onDocumentLoaded);