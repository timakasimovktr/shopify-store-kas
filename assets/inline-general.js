window.addEventListener('load', function() {
	// console.log("Test");
	// BounceX tag -- Speed Optimization Trick
  (function(d) {
    var e = d.createElement('script');
    e.src = d.location.protocol + '//tag.bounceexchange.com/3733/i.js';
    e.async = true;
    d.getElementsByTagName("head")[0].appendChild(e);
  }(document));

	function loadScript(id, url, callback) {
    	let script = document.getElementById(id);
    	script.src = url;
    	script.onload = () => callback();
 	}

 	function loadCss(filename) {
 		var fileref = document.createElement("link");
    	fileref.setAttribute("rel", "stylesheet");
    	fileref.setAttribute("type", "text/css");
    	fileref.setAttribute("href", filename);
    	document.getElementsByTagName("head")[0].appendChild(fileref)
 	}

  setTimeout(function(){ 
		// Olark -- Speed Optimization Trick
		(function(o,l,a,r,k,y){if(o.olark)return;
		  r="script";y=l.createElement(r);r=l.getElementsByTagName(r)[0];
		  y.async=1;y.src="//"+a;r.parentNode.insertBefore(y,r);
		  y=o.olark=function(){k.s.push(arguments);k.t.push(+new Date)};
		  y.extend=function(i,j){y("extend",i,j)};
		  y.identify=function(i){y("identify",k.i=i)};
		  y.configure=function(i,j){y("configure",i,j);k.c[i]=j};
		  k=y._={s:[],t:[+new Date],c:{},l:a};
		})(window,document,"static.olark.com/jsclient/loader.js");
	  /* Add configuration calls below this comment */
	  olark.identify('4211-868-10-3587');

		// Klaviyo -- Speed Optimization Trick
	  var __klKey = __klKey || 'zFxB6d';
	  (function() {
			var s = document.createElement('script');
			s.type = 'text/javascript';
			s.async = true;
			s.src = '//static.klaviyo.com/forms/js/client.js';
			var x = document.getElementsByTagName('script')[0];
			x.parentNode.insertBefore(s, x);
  	})();

		//Begin - Bing UET  -- Speed Optimization Trick
		// function GetRevenueValue()  { return 6; }    
		// (function(w,d,t,r,u){var f,n,i;w[u]=w[u]||[],f=function(){var o={ti:"5988896"};o.q=w[u],w[u]=new UET(o),w[u].push("pageLoad")},n=d.createElement(t),n.src=r,n.async=1,n.onload=n.onreadystatechange=function(){var s=this.readyState;s&&s!=="loaded"&&s!=="complete"||(f(),n.onload=n.onreadystatechange=null)},i=d.getElementsByTagName(t)[0],i.parentNode.insertBefore(n,i)})(window,document,"script","//bat.bing.com/bat.js","uetq"); 
		// window.uetq = window.uetq || []; window.uetq.push({ 'ec':'purchase', 'gv': GetRevenueValue(), 'gc': 'USD'});  

		//Hotjar Tracking Code for www.kassatex.com -- Speed Optimization Trick
		// (function(h,o,t,j,a,r){
		//   h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
		//   h._hjSettings={hjid:979364,hjsv:6};
		//   a=o.getElementsByTagName('head')[0];
		//   r=o.createElement('script');r.async=1;
		//   r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
		//   a.appendChild(r);
		// })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');

		// Loop returns initialization
		/*LoopOnstore.init({
      key: "ac901f6b909ab664d6c9a6b917742b70a30427d1",
      attach: "#checkout_button"
    });*/

	}, 3000);

  setTimeout(function(){
		//localize.js https://docs.withreach.com/page/shopify-gateway
    loadScript('gointerpay_localize','https://assets.rch.io/c0126abc-f008-42c2-8b3d-73cbe3809714/localize.js', script => {
      GIP.getLocalizeData().then(function (data) {
        if (data) {
            console.log(data);
        } else {
            console.log('No rate offer available.');
        }
      });
    });

    // BounceX
    // loadScript('bouncex','https://tag.bounceexchange.com/3733/i.js', script => {console.log('loaded bouncex')});
    
    // Load Findify -- Speed Optimization
		// Old script, new script on theme.liquid
  	// loadScript('findify-assets','https://findify-assets-2bveeb6u8ag.netdna-ssl.com/search/prod/kassatex.myshopify.com.min.js', script => {});

  	const $popupTemplate = $('.popup-promotion');
    if (localStorage.getItem('promotion_result_set_header') == 'true') {
      var announcement_text = localStorage.getItem('promotion_result_set_header_template');
      if ($('.header__bar .shell').length > 0) {
        $('.header__bar .shell').html(announcement_text);

        if ($('.header-checkout').length > 0 ) {
          $('.header-checkout').css({
            'margin-top': "30px"
          });
          $('.header__bar').css({
            'height': '30px'
          });
        }
      }
    } else {
      $('.header-checkout .header__bar').remove();
    }

    $('.slider h1').css('visibility', 'visible');
	}, 50);

});