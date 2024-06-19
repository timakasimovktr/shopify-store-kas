export function getReviews(productsData, callback) {
  getToken(function(token) {

    for(var i=0; i<productsData.length; i++) {
      var productItem = productsData[i];
      var url = "//api.yotpo.com/v1/widget/gFf6bdYbKK6qYcSaB1NDm1lGTBIxQAOraA9ksSUY/products/"+ productItem.p_id +"/reviews.json?page=1&per_page=" + productItem.p_count + "&star=5&sort=date";
      var reviews = [];
      $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function(data) {

          if (typeof data.response != 'undefined') {
            if (typeof data.response.reviews != 'undefined') {
              // reviews = reviews.concat(data.reviews);
              callback(data.response.reviews);
            } else {
              callback('none');
            }
          }
        },
        error: function(data) {
          callback('none');
        }
      });
    }
  });
}

function getToken(callback) {
  $.ajax({
    url: '//api.yotpo.com/oauth/token',
    type: 'GET',
    dataType: 'json',
    data: {
      "client_id": "gFf6bdYbKK6qYcSaB1NDm1lGTBIxQAOraA9ksSUY",
      "client_secret": "jd8sgS70IkpdCJ6ENZXBswASj7qimkL9MoUglBeH",
      "grant_type": "client_credentials"
    },
    success: function(data) {
      callback(data.access_token);
    },
    error: function(data) {
      console.log(data);
    }
  });
}