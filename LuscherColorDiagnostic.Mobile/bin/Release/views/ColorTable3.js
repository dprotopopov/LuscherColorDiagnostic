/// <summary>
///     Таблица 3:
///     темно-синий (I1),
///     сине-зеленый (D2),
///     красно-желтый (O3) и
///     желто-красный (Р4).
///     Каждый цвет представлен в таблице по 3 раза (как и цвета последующих таблиц) с целью по парного сравнения цветов
///     испытуемыми.
///     Цвета аналогичны 4-м «основным» тонам таблицы 2.
///     Таблица 4:
///     темно-синий (I1),
///     зелено-синий (D2),
///     сине-красный (O3),
///     голубой (Р4).
///     В этой таблице темно-синий цвет (I1), аналогичен темно-синему в таблицах 2 и 3.
///     Использование одного и того же цвета («основного» ) в нескольких таблицах ЦТЛ позволяет, с точки зрения Люшера,
///     более глубоко изучить отношение к нему испытуемого.
///     Цвета ЦТЛ, начиная с таблицы 4, относятся к определенным «цветовым колонкам».
///     Их четыре — по числу «основных» цветов.
///     В «синею» колонку (I1) входят цвета, обозначенные I1,
///     в «зеленую» (D2) — D2;
///     «красную» (O3) — O3;
///     «желтую» (P4) — Р4.
///     Таблица 5:
///     коричнево-зеленый (I1),
///     сине-зеленый (D2),
///     зеленый (O3) и
///     желто-зеленый (Р4).
///     Здесь, в третий раз присутствует сине-зеленый (D2).
///     Цвета ЦТЛ, начиная с таблицы 4, относятся к определенным «цветовым колонкам».
///     Их четыре — по числу «основных» цветов.
///     В «синею» колонку (I1) входят цвета, обозначенные I1,
///     в «зеленую» (D2) — D2;
///     «красную» (O3) — O3;
///     «желтую» (P4) — Р4.
///     Таблица 6:
///     коричневый (I1),
///     красно-коричневый (D2),
///     красно-желтый (O3),
///     оранжевый (Р4).
///     Первый из этих цветов аналогичен 6 из таблицы 2, а красно-желтый (O3) появляется в 3-й раз.
///     Цвета ЦТЛ, начиная с таблицы 4, относятся к определенным «цветовым колонкам».
///     Их четыре — по числу «основных» цветов.
///     В «синею» колонку (I1) входят цвета, обозначенные I1,
///     в «зеленую» (D2) — D2;
///     «красную» (O3) — O3;
///     «желтую» (P4) — Р4.
///     Таблица 7:
///     светло-коричневый (I1),
///     зелено-желтый (D2),
///     оранжевый с большей долей красного (O3) и
///     желто-красный (Р4).
///     В последней таблице ЦТЛ в третий раз повторяется желто-красный цвет (Р4).
///     Цвета ЦТЛ, начиная с таблицы 4, относятся к определенным «цветовым колонкам».
///     Их четыре — по числу «основных» цветов.
///     В «синею» колонку (I1) входят цвета, обозначенные I1,
///     в «зеленую» (D2) — D2;
///     «красную» (O3) — O3;
///     «желтую» (P4) — Р4.
/// </summary>
(function(luscher, local, color) {
    luscher.ColorTable3 = function(params) {
        var viewModel = {
            //  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(4 + parseInt(params.id)),
            title: local.title,
            tileViewData: ko.observableArray(null),
            viewWidth: ko.computed(function() { return $(".layout-content").width(); }),
            viewHeight: ko.computed(function() { return $(".layout-content").height(); }),
            itemWidth: ko.computed(function () { return ($(".layout-content").width() - 3 * 22) / 2; }, this),
            itemHeight: ko.computed(function () { return ($(".layout-content").height() - 2 * 22) / 1; }, this),
            actionSheetVisible: ko.observable(false),
            actionSheetData: (parseInt(params.id) < 4) ? [
                    { text: local.next(), clickAction: function() { luscher.app.navigate("ColorTable3/".concat((parseInt(params.id) + 1).toString())); } },
                    { text: local.restart(), clickAction: "#WelcomeView" }
                ]
                : [
                    { text: local.next(), clickAction: function() { luscher.app.navigate("ReadyView"); } },
                    { text: local.restart(), clickAction: "#WelcomeView" }
                ],
            tileItemClick: function(e) {
                this.tileViewData().load().done(function(result) {
                    //'result' contains the loaded array
                    $.Enumerable.From(result).ForEach(function(entry) { entry.visible("hidden"); });
                });
                this.i++;
                luscher.colorCount()[this.paramsId()]()[e.itemData.id](luscher.colorCount()[this.paramsId()]()[e.itemData.id]() + 1);
                if (this.i < LuscherColorDiagnostic.schema.length) {
                    this.tileViewData(new DevExpress.data.ArrayStore({
                        data: [
                            { id: luscher.schema[this.i].left, rgb: luscher.colorRgb[this.paramsId()][luscher.schema[this.i].left], visible: ko.observable("visible") },
                            { id: luscher.schema[this.i].right, rgb: luscher.colorRgb[this.paramsId()][luscher.schema[this.i].right], visible: ko.observable("visible") }
                        ]
                    }));
                    $("#toastContainer1").dxToast('instance').show();
                } else {
                    luscher.app.navigation[this.navigationId()].option('disabled', false);
                    $("#toastContainer3").dxToast('instance').show();
                    this.actionSheetVisible(true);
                }
            },
            viewShown: function() {
                this.i = 0;
                luscher.colorCount()[this.paramsId()]().i1(0);
                luscher.colorCount()[this.paramsId()]().d2(0);
                luscher.colorCount()[this.paramsId()]().o3(0);
                luscher.colorCount()[this.paramsId()]().p4(0);
                if (this.i < LuscherColorDiagnostic.schema.length) {
                    this.tileViewData(new DevExpress.data.ArrayStore({
                        data: [
                            { id: luscher.schema[this.i].left, rgb: luscher.colorRgb[this.paramsId()][luscher.schema[this.i].left], visible: ko.observable("visible") },
                            { id: luscher.schema[this.i].right, rgb: luscher.colorRgb[this.paramsId()][luscher.schema[this.i].right], visible: ko.observable("visible") }
                        ]
                    }));
                    $("#toastContainer1").dxToast('instance').show();
                } else {
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