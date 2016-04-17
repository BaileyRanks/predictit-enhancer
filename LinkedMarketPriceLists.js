$(document).ready(function(){
    var showPrices = function(e, $cPrice) { 
        var pos = $cPrice.offset();
        var $parentRow = $cPrice.parents('tr');
        var contractUrl = $parentRow.find('.outcome-title a').attr('href');
        contractUrl = (contractUrl.indexOf("http") == -1) 
            ? document.location.protocol + '//' + document.location.host + contractUrl
            : contractUrl;
        $.get(contractUrl + "#openoffers #openoffers1", function(data) {
            if (!$cPrice.hasClass('showPrice'))  {
                $('#price_table').remove();
                return;
            }
            var priceClass = $cPrice.hasClass('sharesUp') ? '.panel-success' : '.panel-danger';
            var pricesHtml = $(data).find('#openoffers1 ' + priceClass).parent().html();
            var priceTable = $('#price_table').length ? $('#price_table') : $('<div id="price_table"></div>');
            priceTable.show()
            .html(pricesHtml)
            .css('position', 'absolute')
            .css('top', pos.top - 150 + 'px')
            .css('left', pos.left - 250 + 'px')
            .css('z-index', '100001')
            .appendTo('body');
            setTimeout(function() {
                if ($cPrice.hasClass('showPrice')) {
                    showPrices(e, $cPrice);
                }
            }, 3000);
        });
    };
    $('body').on('mouseenter', 'span.sharesUp, span.sharesDown', activatePriceTable);
    $('body').on('mouseleave', 'span.sharesUp, span.sharesDown', deactivatePriceTable);
    $('body').on('click', 'span.sharesUp, span.sharesDown', deactivatePriceTable);

    function activatePriceTable(e) {
        $('span.sharesUp, span.sharesDown').removeClass('showPrice');

        $cPrice = $(this);
        $cPrice.addClass('showPrice');

         var timeoutId = setTimeout(function() {
            if ($cPrice.hasClass('showPrice')) {

                window.postMessage('pauseRefresh', "*")

                showPrices(e, $cPrice);
            }
        }, 200);
    }

    function deactivatePriceTable(e) {
        $cPrice = $(this);
        $cPrice.removeClass('showPrice');

        $('#price_table').remove();

         var timeoutId = setTimeout(function() {
            if (!$cPrice.hasClass('showPrice')) {
                window.postMessage('unpauseRefresh', "*")
            }
        }, 200);
    }
    $('body').on('mouseleave', 'span.sharesUp, span.sharesDown', function(){
    });
});
