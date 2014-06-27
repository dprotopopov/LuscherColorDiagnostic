(function(luscher, local, color) {
    luscher.WelcomeView = function(params) {

        var viewModel = {
            //  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(1),
            title: local.title,
            actionSheetVisible: ko.observable(false),
            actionSheetData: [
                { text: local.start(), clickAction: function() { luscher.app.navigate("GreyTable1/0"); } }
            ],
            viewShown: function() {
                luscher.app.navigation[this.navigationId()].option('disabled', false);
                $("#toastContainer3").dxToast('instance').show();
                this.actionSheetVisible(true);
            },

            message1: local.message1,
            message2: local.message2,
            message3: local.message3,
        };

        return viewModel;
    };
})(LuscherColorDiagnostic, $.Localize, $.Color);