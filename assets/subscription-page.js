(function(window, $) {  
  /* |---------- Vars and Constants ----------| */

  var subscriptionInput, subscriptionMsgElem;
  
  /* |---------- Methods & Functions ----------| */

  function validateEmail(email){
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      ) ? true : false;
  }

  function showSubscriptionMessage(isError = true, show = true, msg = ''){
    subscriptionMsgElem.innerHTML = msg;
    
    subscriptionMsgElem.classList.remove(isError ? 'success-msg' : 'error-msg');
    subscriptionMsgElem.classList.add(isError ? 'error-msg' : 'success-msg');

    if(show){
      subscriptionMsgElem.classList.remove('hidden');
    } else {
      subscriptionMsgElem.classList.add('hidden');
    }
  }

  /* |---------- Callbacks and Events ----------| */

  function onSubscription(e){
    showSubscriptionMessage(false);
    
    if(!validateEmail(subscriptionInput.value)){
      e.preventDefault();
      showSubscriptionMessage(true, true, 'Invalid address email');
      return;
    }

    setTimeout(() => {
      subscriptionInput.dataset.subscribed = true;
      showSubscriptionMessage(false, true, 'Thanks for subscribing!<br>Check your email for a confirmation message.');
    }, 2000);
  }

  /* |--------------- On Ready ---------------| */
  
  $(function(){
    /* |--------------- Cache Elements ---------------| */

    subscriptionInput = document.querySelector('#main-content .subscribe-simple input[name="email"]');
    subscriptionMsgElem = document.querySelector('#main-content .subscribe-simple .subscription-msg');

    /* |--------------- Events Setup ---------------| */

    document.querySelector('form#subscription-signup').addEventListener('submit', onSubscription);
    
    /* |--------------- Initialization ---------------| */
  });
})(window, jQuery);