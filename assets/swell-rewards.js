(function() {
  var timeout = 0;
  if (!window.jQuery) {
    timeout = 1000;
  }

  setTimeout(function() {
    jQuery(document).ready(function($) {
      $(document).on("swell:setup", function() {
        SwellConfig.Tier.initializeTiers();

         var range_script = document.createElement("script");
        range_script.src = "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js";
        document.getElementsByTagName("head")[0].appendChild(range_script);

        image_url = "//cdn.shopify.com/s/files/1/0067/4870/0741/t/101/assets/swell-referral.png?v=14733667177746054053"
        $(".yotpo-widget-campaign-widget-container .flexified-item-count-8").append('<div class="flexified-child yotpo-outer-tile" style="border-color: rgb(132, 140, 163);"><div class="yotpo-campaign-switcher-wrapper"><div class="yotpo-tile-wrapper"><div class="yotpo-tile" style="background-color: rgb(249, 250, 255);"><div class="yotpo-widget-campaign-widget-icon-container"><img alt="icon" src="' + image_url +'" class="yotpo-widget-campaign-widget-custom-icon"></div><div class="yotpo-headline-center-element"><!----><div class="yotpo-title-text" style="color: rgb(1, 18, 71); font-size: 24.3px; font-family: Montserrat; font-weight: 600; font-style: normal;">1000 Points</div></div><div class="yotpo-description-text" style="color: rgb(78, 87, 114); font-size: 16.2px; font-family: Montserrat; font-weight: 400; font-style: normal;">Successful Referrals</div></div></div><!----></div></div>');

        $( 'body' ).on('click',".swell-post-checkout .checkout-heading .swell-referral-back-link", function() {
          $(".swell-post-checkout").hide();
        });

      });
    });
  },timeout);
}).call(this);

// tiers
(function() {
  window.SwellConfig = window.SwellConfig || {};

  SwellConfig.Tier = {
    getCustomerTierId: function() {
      var customer_tier, intro_tier, tiers;
      customer_tier = spapi.customer.vip_tier;
      tiers = spapi.activeVipTiers;
      if (customer_tier) {
        return customer_tier.id;
      } else {
        intro_tier = $.grep(tiers, function(e) {
          return e.swellrequiredAmountSpent === "$0" && e.swellrequiredAmountSpentCents === 0 && e.swellrequiredPointsEarned === 0 && e.swellrequiredPurchasesMade === 0 && e.swellrequiredReferralsCompleted === 0;
        });
        if (intro_tier.length > 0) {
          return intro_tier[0].id;
        } else {
          return null;
        }
      }
    },
    getCustomerTierRank: function() {
      var customer_tier, intro_tier, rank, tiers;
      customer_tier = spapi.customer.vip_tier;
      tiers = spapi.activeVipTiers;
      if (customer_tier && customer_tier.id) {
        rank = $.grep(tiers, function(e) {
          return e.id === customer_tier.id;
        })[0].rank;
        return rank;
      } else {
        intro_tier = $.grep(tiers, function(e) {
          return e.swellrequiredAmountSpent === "$0" && e.swellrequiredAmountSpentCents === 0 && e.swellrequiredPointsEarned === 0 && e.swellrequiredPurchasesMade === 0 && e.swellrequiredReferralsCompleted === 0;
        });
        if (intro_tier.length > 0) {
          return intro_tier[0].rank;
        } else {
          return null;
        }
      }
    },
    getTierByRank: function(rank) {
      var tiers;
      tiers = spapi.activeVipTiers;
      return $.grep(tiers, function(e) {
        return e.rank === rank;
      })[0];
    },
    setupCustomerTierStatus: function() {
      customer_tier_id = SwellConfig.Tier.getCustomerTierId();

      if(customer_tier_id) {
        $(".swell-tier-list[data-tier-id="+ customer_tier_id+"]").addClass("tier-active");
        $(".swell-tier-list[data-tier-id="+ customer_tier_id+"] .tier-status").html('Your<br class="swell-mobile"> Current Status');

        // customer_tier_rank = SwellConfig.Tier.getCustomerTierRank();
        // next_tier = SwellConfig.Tier.getTierByRank(customer_tier_rank + 1);

        // tiers = spapi.activeVipTiers;

        //  tiers.forEach(function(tier) {
        //     if (next_tier && tier.rank == next_tier.rank) {
        //       if(spapi.customer.vip_tier_stats) {
        //         tier_difference = (tier.amount_spent_cents - spapi.customer.vip_tier_stats.amount_spent_cents)/100;
        //       } else {
        //         tier_difference = (tier.amount_spent_cents - 0)/100;
        //       }
        //       $(".swell-tier-list[data-tier-id="+ next_tier.id+"] .tier-status").html('Spend $' + tier_difference + ' to reach ' + tier.name + ' tier');
        //     }
        //   });
      }
    },
    initializeDummyTier: function() {
      var k, len, tier, tiers;
      tiers = spapi.activeVipTiers;
      for (k = 0, len = tiers.length; k < len; k++) {
        tier = tiers[k];
        tier.rank += 1;
      }
      return tiers.unshift({
        id: -1,
        rank: 0,
        name: "(Re)sister",
        points: "$0&ndash;$199",
        one_point_multiplier: "<i class=\"fa fa-check\" aria-hidden=\"true\"></i>",
        birthday_points: "<i class=\"fa fa-check\" aria-hidden=\"true\"></i>",
        exclusive_products: "",
        free_product: "",
        two_point_multiplier: "",
        swellrequiredAmountSpent: "$0",
        swellrequiredAmountSpentCents: 0,
        swellrequiredPointsEarned: 0,
        swellrequiredPurchasesMade: 0,
        swellrequiredReferralsCompleted: 0
      });
    },
    initializeTiers: function() {
      if (spapi.authenticated) {
        return SwellConfig.Tier.setupCustomerTierStatus();
      } 
    }
  };
}).call(this);

