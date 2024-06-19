async function updateCartNote(data = '') {
  return fetch('/cart/update.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      note: data
    })
  })
      .then(res => res.json())
      .catch(e => console.error(e.message))
}

async function getCartNote() {
  try {
    const res = await fetch('/cart.js', {
      method: 'GET',
    })
    const cart = await res.json()
    return cart.note || ''
  } catch (e) {
    console.error(e.message)
    return ''
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const open = document.querySelector('.cart__link');
  const close =  document.querySelectorAll('.cart_close');
  const cart_popup = document.querySelector('.cart-popup__overlay');
  const cart_popup_slide = document.querySelector('.cart-popup__slide');
  
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('continue-shopping')) {
      cart_popup_slide.classList.remove('open-slide');
      cart_popup.classList.remove('open');
      $('body').css('overflow', 'auto');
    }
  });

  open.addEventListener('click', function () {
    cart_popup.classList.toggle('open');
    cart_popup_slide.classList.toggle('open-slide');
    $('body').css('overflow', 'hidden');
  });

  close.forEach(function (item) {
    item.addEventListener('click', function () {
      cart_popup_slide.classList.remove('open-slide');
      cart_popup.classList.remove('open');
      $('body').css('overflow', 'auto');
    });
  });

});

async function enableForm() {
  const $extraFields = document.querySelectorAll('[data-cart-extra-field]')
  if ($extraFields.length === 0) return
  let messages = {}

  function updateMessages(cartNote) {
    if (cartNote) {
      const notes = cartNote.split('||')
      messages = {
        gift_box_message: notes[0] && notes[0].split('::')[1],
        gift_box_message2: notes[0] && notes[0].split('::')[1],
        gift_box_instructions: notes[1] && notes[1].split('::')[1],
        gift_box_instructions2: notes[1] && notes[1].split('::')[1]
      }
    }
  }

  const cartNote = await getCartNote();
  updateMessages(cartNote);

  function checkMessages() {
    return Object.keys(messages).length > 0
  }

  const $inputs = []
  const $hiddenInputs = []
  $extraFields.forEach($extraField => {
    const $dropdownTrigger = $extraField.querySelector('[data-dropdown-trigger]')
    const $showBtn = $extraField.querySelector('[data-show-dropdown]')
    const $input = $extraField.querySelector('[data-input]')
    const $inputHidden = $extraField.querySelector('[data-input-hidden]')
    const $saveBtn = $extraField.querySelector('[data-save]')
    const $cancelBtn = $extraField.querySelector('[data-cancel]')
    const $count = $extraField.querySelector('[data-count]')

    $inputs.push($input)
    $hiddenInputs.push($inputHidden)

    let isOpen = false
    let savedText = checkMessages() ? messages[$inputHidden.name] : '';

    // Fill in the inputs with saved text
    if (savedText) {
      $inputHidden.value = savedText;
      $input.value = savedText;
    }

    function syncInputValues(name) {
      $inputs.forEach($el => {
        if ($el.id.includes(name)) {
          $el.value = checkMessages() ? messages[$el.name || $el.id] : savedText
        }
      })
      $hiddenInputs.forEach($el => {
        if ($el.name.includes(name)) {
          $el.value = checkMessages() ? messages[$el.name || $el.id] : savedText
        }
      })
    }

    function toggleDropdown() {
      const $dropdown = $extraField.querySelector('[data-dropdown]');
      if (!$dropdown) return;

      if (isOpen) {
        $dropdown.classList.remove('open');
        $showBtn.style.display = 'inline';
        isOpen = false;
      } else {
        $dropdown.classList.add('open');
        $showBtn.style.display = 'none';
        isOpen = true;
      }
    }

    function inputHandler() {
      $count.textContent = $input.value.length + '';
    }

    function saveText() {
      
      savedText = $input.value;
      $inputHidden.value = savedText

      let hasMessages = Object.keys(messages).length > 0
      let newNote = ''
      if ($inputHidden.name === 'gift_box_message2' || $inputHidden.name === 'gift_box_instructions2') {
        let giftMessage
        let giftInstructions
        if ($inputHidden.name === 'gift_box_message2') {
          giftMessage = savedText
          if (hasMessages) {
            messages.gift_box_message2 = savedText.trim()
            messages.gift_box_message = savedText.trim()
          }
        } else {
          giftMessage = (hasMessages && messages.gift_box_message2) || ''
        }

        if ($inputHidden.name === 'gift_box_instructions2') {
          giftInstructions = savedText
          if (hasMessages) {
            messages.gift_box_instructions2 = savedText.trim()
            messages.gift_box_instructions = savedText.trim()
          }
        } else {
          giftInstructions = (hasMessages && messages.gift_box_instructions2) || ''
        }

        newNote = `Gift Message::${giftMessage || ''}||Gift Instructions::${giftInstructions || ''}`
      } else {
        newNote = `Gift Message::${window.gift_box_message.value || ''}||Gift Instructions::${window.gift_box_instructions.value || ''}`

        if ($inputHidden.name === 'gift_box_message') {
          messages.gift_box_message2 = savedText
          messages.gift_box_message = savedText
        } else {
          messages.gift_box_instructions2 = savedText
          messages.gift_box_instructions = savedText
        }
      }

      updateCartNote(newNote).then(() => getCartNote()).then(updateMessages(newNote))
      syncInputValues($inputHidden.name.slice(0, 15)) // gift_box_message.length = 16
      toggleDropdown()
    }

    function cancelHandler() {
      toggleDropdown()
    }

    $dropdownTrigger.addEventListener('click', toggleDropdown)
    $input.addEventListener('input', inputHandler)
    $saveBtn.addEventListener('click', saveText)
    $cancelBtn.addEventListener('click', cancelHandler)

    inputHandler()
  })
}

enableForm()

// Ensures that JS works when UI rerender happens
let target = document.querySelector('[data-section-cart]');
let cartSidebar = document.querySelector('#cart-inner');
if (target || cartSidebar) {
  const config = {
    childList: true
  };

  const observer = new MutationObserver(enableForm)

  window.addEventListener('load', () => target ? observer.observe(target, config) : observer.observe(cartSidebar, config))
  window.addEventListener('beforeunload', () => observer.disconnect())
}
