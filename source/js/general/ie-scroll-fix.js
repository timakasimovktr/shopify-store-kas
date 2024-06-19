// IE fix scroll
if (navigator.userAgent.match(/MSIE 10/i) || navigator.userAgent.match(/Trident\/7\./) || navigator.userAgent.match(/Edge\/12\./)) {
  $('body').on('mousewheel scroll', function() {
    event.preventDefault();
    var mouseDelta = event.wheelDelta;
    var pageYOffset = window.pageYOffset;
    window.scrollTo(0, pageYOffset - mouseDelta);
  });
}
