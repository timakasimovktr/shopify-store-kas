// Accordions

const $win = $(window);
const $accordionHead = $(".js-accordion-head");
const $accordionBody = $(".js-accordion-body");

$accordionHead.on("click", function (event) {
  event.preventDefault();

  $(this)
    .toggleClass("is-active")
    .next($accordionBody)
    .stop()
    .slideToggle()
    .parent()
    .siblings()
    .find($accordionHead)
    .removeClass("is-active")
    .next($accordionBody)
    .slideUp();
});

$win.on("resize", function () {
  if ($win.width() > 767) {
    $(".block__inner").removeAttr("style");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let js_acc_btn = document.querySelectorAll(".js-acc-btn");
  let js_acc_menu = document.querySelectorAll(".js-acc-menu");
  let active_acc = null;

  for (let i = 0; i < js_acc_btn.length; i++) {
    js_acc_btn[i].addEventListener("click", function () {
      if (this.classList.contains("is-active")) {
        this.classList.remove("is-active");
        js_acc_menu[i].classList.remove("is-open");
        this.querySelector(".after").style.transform = "rotate(90deg)";
        js_acc_menu[i].style.height = "0px";
        active_acc = null;
      } else {
        if (active_acc) {
          active_acc.btn.classList.remove("is-active");
          active_acc.menu.style.height = "0px";
          active_acc.menu.classList.remove("is-open");
          // active_acc.btn.querySelector(".after").style.display = "block";
          active_acc.btn.querySelector(".after").style.transform = "rotate(90deg)";

        }
        this.classList.add("is-active");
        // this.querySelector(".after").style.display = "none";
        this.querySelector(".after").style.transform = "rotate(0deg)";
        js_acc_menu[i].classList.add("is-open");
        active_acc = { btn: this, menu: js_acc_menu[i] };
        var js_acc_height = js_acc_menu[i].scrollHeight + 20;
        js_acc_menu[i].style.height = js_acc_height + "px";
      }
    });
  }
});
