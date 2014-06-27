/// <reference path="../js/jquery-1.11.1.min.js" />
/// <reference path="../js/knockout-3.1.0.js" />
/// <reference path="../js/dx.all.js" />

(function() {
    var endpointSelector = new DevExpress.EndpointSelector(LuscherColorDiagnostic.config.endpoints);

    var serviceConfig = $.extend(true, {}, LuscherColorDiagnostic.config.services, {
        db: {
            url: endpointSelector.urlFor("db"),

            // To enable JSONP support, uncomment the following line
            //jsonp: !window.WinJS,

            // To allow cookies and HTTP authentication with CORS, uncomment the following line
            // withCredentials: true,

            errorHandler: handleServiceError
        }
    });

    function handleServiceError(error) {
        if(window.WinJS) {
            try {
                new Windows.UI.Popups.MessageDialog(error.message).showAsync();
            } catch(e) {
                // Another dialog is shown
            }
        } else {
            alert(error.message);
        }
    }

    // Enable partial CORS support for IE < 10    
    $.support.cors = true;
    
    LuscherColorDiagnostic.db = new DevExpress.data.ODataContext(serviceConfig.db);

}());
