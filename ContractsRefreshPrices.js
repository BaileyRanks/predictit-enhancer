$(document).ready(function(){
    var arInterval = 20000;

    var rfOpts = ['off', 'on', 'timeout', 'paused', 'refreshing'];
    var autoRefresh = true;
    var rfStatus = 0;
    var rfStatusId = null;

    var getStatus = function() {
        return rfOpts[rfStatus];
    };

    var isEnabled = function() {
        return $('#refreshPrices').is(':checked');
    }

    var setStatus = function(newStatus) {
        if (newStatus == 'on') {
            autoRefresh = true;
        } else if (newStatus == 'off') {
            autoRefresh = false;
        }

        rfStatus = rfOpts.indexOf(newStatus);

        rfStatusId = Math.floor(Math.random() * 26) + Date.now();

        return rfStatusId;
    }

    var statusUnchanged = function(statusId) {
        return (statusId == rfStatusId);
    }

    $('body').on('click', '#refreshPrices', function() {
        if ($(this).is(':checked')) {
            setStatus('on');
            refreshTimeout(refreshPrices, arInterval);
        } else {
            setStatus('off');
        }
    });

    $('body').on('click', 'a.refresh', function() {
        initNextRefresh();
    });

    $('body').on('focusin', '#arInterval', function() {
		window.postMessage('pauseRefresh', "*")
    });

    $('body').on('click', '.sharesUp, .sharesDown', function() {
		window.postMessage('pauseRefresh', "*")
    });

    $('body').on('click', '#cancelModal', function() {
		window.postMessage('unpauseRefresh', "*")
    });

    $('body').on('focusout', '#arInterval', function() {
        arInterval = ($.isNumeric($(this).val()) ? $(this).val() : 20) * 1000;
		window.postMessage('unpauseRefresh', "*")
    });

    function appendCheckbox() {
        if ($('#contractsRefresh').length > 0) {
            $('#contractsRefresh').remove();
        }

        $('<span id="contractsRefresh"> \
            <input id="refreshPrices" type="checkbox" \
            name="autorefresh" value="1" style="margin: 0 3px;" \
            ' + ((autoRefresh) ? 'checked="checked"' : '') + '> \
            <label style="margin: 0px;" for="refreshPrices">Auto Refresh</label> \
            <input id="arInterval" style="text-align: right;" type="text" size="2" name="seconds" value="'+ (arInterval / 1000) +'" />s \
            </span>').appendTo('th.contract-title');
    }

    var refreshTimeout = function(func, timeout) {

        var statusId = setStatus('timeout');

        setTimeout(function() {

            //if the status changed while timed out, stop
            if (!statusUnchanged(statusId)) {
                return;
            }

            setStatus('on');

            func();

        }, timeout);
    }

    window.addEventListener("message", function(event) {
        // We only accept messages from ourselves
        if (event.source != window)
            return;

        if (event.data == 'pauseRefresh') {
            setStatus('pause');
        }

        if (event.data == 'unpauseRefresh') {

            if (!isEnabled()) {
                return;
            }

            refreshTimeout(refreshPrices, arInterval);
        }

    }, false);

    function refreshPrices() {
        $refresher = $('#refreshPrices');

        if (!isEnabled() || $('.modal').is(':visible')) { 
            return; 
        }

        refreshTimeout(function() {

            setStatus('refreshing');

            refreshCss(true);

            //do the actual refresh
            $('a.refresh').first().trigger('click');

        }, 300);
    }

    var refreshCss = function(on) {

        if (on) {
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('z-index', 'none');
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('visibility', 'hidden');
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('position', 'relative');
            $('#outcomes').css('height', $('#outcomes').height() + 'px');
        } else {
            $('#outcomes').css('height', '');
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('visibility', '');
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('position', '');
            $('#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList').css('z-index', '');
        }
    };

    var initNextRefresh = function() {
        if (!$("#spinnnerGo, #spinnnerGoEmpty, #spinnerContractList").is(':visible')) {

            appendCheckbox();

            refreshCss(false);

            refreshTimeout(refreshPrices, arInterval);

        } else {
            setTimeout(initNextRefresh, 300);
        }
    }

    initNextRefresh();
});
