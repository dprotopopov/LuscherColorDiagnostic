(function(luscher, local, color) {
    luscher.ReadyView = function(params) {

        var viewModel = {
//  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(9),
            title: local.title,
            actionSheetVisible: ko.observable(false),
            actionSheetData: [
                { text: local.ready(), clickAction: "#ProcessView" }
            ],
            viewShown: function() {
                this.actionSheetVisible(true);
                luscher.app.navigation[this.navigationId()].option('disabled', false);
                $("#toastContainer3").dxToast('instance').show();
                this.actionSheetVisible(true);
            },
            ready: local.ready,
            message1: local.message1,
            message2: local.message2,
            message3: local.message3,
        };

        return viewModel;
    };
})(LuscherColorDiagnostic, $.Localize, $.Color);