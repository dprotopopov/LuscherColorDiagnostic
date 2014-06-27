/// <summary>
///     В таблицу «серого цвета» входят :
///     средне серый (0; он аналогичен серому из 8-ми цветовой таблицы),
///     темно-серый (1),
///     черный (2; аналогичен 7 из таблицы 8-ми цветов),
///     светло-серый (3) и
///     белый (4).
/// </summary>
(function(luscher, local, color) {
    luscher.GreyTable1 = function(params) {
        var viewModel = {
            //  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(2),
            title: local.title,
            tileViewData: ko.observableArray(null),
            viewWidth: ko.computed(function() { return $(".layout-content").width(); }),
            viewHeight: ko.computed(function() { return $(".layout-content").height(); }),
            itemWidth: ko.computed(function () { return ($(".layout-content").width() - 4 * 22) / 3; }, this),
            itemHeight: ko.computed(function () { return ($(".layout-content").height() - 4 * 22) / 3; }, this),
            actionSheetVisible: ko.observable(false),
            actionSheetData: [
                { text: local.next(), clickAction: function() { luscher.app.navigate("ColorTable2/0"); } },
                { text: local.restart(), clickAction: "#WelcomeView" }
            ],
            tileItemClick: function(e) {
                e.itemData.visible("hidden");
                if (this.i < 2) luscher.greyIndex()[this.paramsId()]()[this.i++](e.itemData.id);
                else luscher.greyIndex()[this.paramsId()]()[4 + 2 - this.i++](e.itemData.id);
                if (this.i < 2) $("#toastContainer1").dxToast('instance').show();
                else if (this.i < 5) $("#toastContainer2").dxToast('instance').show();
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
                        { id: 3, rgb: color.lightGrey, visible: ko.observable("visible") },
                        { rgb: 0, visible: "hidden" },
                        { id: 1, rgb: color.darkGrey, visible: ko.observable("visible") },
                        { rgb: 0, visible: "hidden" },
                        { id: 0, rgb: color.grey, visible: ko.observable("visible") },
                        { rgb: 0, visible: "hidden" },
                        { id: 4, rgb: color.white, visible: ko.observable("visible") },
                        { rgb: 0, visible: "hidden" },
                        { id: 2, rgb: color.black, visible: ko.observable("visible") }
                    ],
                    key: "id",
                }));
                if (this.i < 2) $("#toastContainer1").dxToast('instance').show();
                else if (this.i < 5) $("#toastContainer2").dxToast('instance').show();
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