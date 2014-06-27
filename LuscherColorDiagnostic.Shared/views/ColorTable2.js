/// <summary>
///     Таблица 2 полного варианта аналогична 8-ми цветовой таблице краткого варианта теста Люшера.
/// </summary>
(function(luscher, local, color) {
    luscher.ColorTable2 = function(params) {

        var viewModel = {
//  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(3),
            title: local.title,
            tileViewData: ko.observableArray(null),
            viewWidth: ko.computed(function() { return $(".layout-content").width(); }),
            viewHeight: ko.computed(function() { return $(".layout-content").height(); }),
            itemWidth: ko.computed(function() {
                if ($(".layout-content").height() > $(".layout-content").width()) return ($(".layout-content").width() - 3 * 22) / 2;
                else return ($(".layout-content").width() - 5 * 22) / 4;
            }, this),
            itemHeight: ko.computed(function() {
                if ($(".layout-content").height() > $(".layout-content").width()) return ($(".layout-content").height() - 5 * 22) / 4;
                else return ($(".layout-content").height() - 3 * 22) / 2;
            }, this),
            actionSheetVisible: ko.observable(false),
            actionSheetData: [
                { text: local.next(), clickAction: function() { luscher.app.navigate("ColorTable3/0"); } },
                { text: local.restart(), clickAction: "#WelcomeView" }
            ],
            tileItemClick: function(e) {
                e.itemData.visible("hidden");
                if (this.i < 5) luscher.colorIndex()[this.paramsId()]()[this.i++](e.itemData.id);
                else luscher.colorIndex()[this.paramsId()]()[7 + 5 - this.i++](e.itemData.id);
                if (this.i < 5) $("#toastContainer1").dxToast('instance').show();
                else if (this.i < 8) $("#toastContainer2").dxToast('instance').show();
                else {
                    luscher.app.navigation[this.navigationId()].option('disabled', false);
                    $("#toastContainer3").dxToast('instance').show();
                    this.actionSheetVisible(true);
                }
            },
            viewShown: function() {
                this.i = 0;
                this.tileViewData(new DevExpress.data.ArrayStore({
                    data: [
                        { id: 0, rgb: color.grey, visible: ko.observable("visible") },
                        { id: 1, rgb: color.blue, visible: ko.observable("visible") },
                        { id: 2, rgb: color.green, visible: ko.observable("visible") },
                        { id: 3, rgb: color.red, visible: ko.observable("visible") },
                        { id: 4, rgb: color.yellow, visible: ko.observable("visible") },
                        { id: 5, rgb: color.violet, visible: ko.observable("visible") },
                        { id: 6, rgb: color.brown, visible: ko.observable("visible") },
                        { id: 7, rgb: color.black, visible: ko.observable("visible") }
                    ],
                    key: "id",
                }));
                if (this.i < 5) $("#toastContainer1").dxToast('instance').show();
                else if (this.i < 8) $("#toastContainer2").dxToast('instance').show();
                else {
                    luscher.app.navigation[this.navigationId()].option('disabled', false);
                    $("#toastContainer3").dxToast('instance').show();
                    this.actionSheetVisible(true);
                }
            },
            i: 0,
            message1: local.message1,
            message2: local.message2,
            message3: local.message3,
        };
        return viewModel;
    };
})(LuscherColorDiagnostic, $.Localize, $.Color);