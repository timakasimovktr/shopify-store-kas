let $gipSelector = $('.footer .currency_selector select#gip_currency_select');
let $gipNotSelector = $('.footer .currency_selector select:not(#gip_currency_select)');
window.onload=function() {
  if (($gipNotSelector.length > 0) && ($gipSelector.length > 0)) {
    $gipNotSelector.change(function() {
      $gipSelector.val($(this).val()).trigger('change');
    });
    // $gipSelector.change(function() {
    //   $gipNotSelector.val($(this).val()).trigger('change');
    // });
  }
}