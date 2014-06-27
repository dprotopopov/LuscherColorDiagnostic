(function(luscher, local, color) {
    luscher.ProcessView = function(params) {

        var viewModel = {
//  Put the binding properties here
            paramsId: ko.observable(parseInt(params.id)),
            navigationId: ko.observable(10),
            title: local.title,
            columnsResult1: ko.observableArray([
                { caption: "+/-", dataField: "sign" },
                { caption: "", dataField: "clr" },
                { caption: local.table1(), dataField: "txt", dataType: "text" }
            ]),
            columnsResult2: ko.observableArray([
                { caption: "+/-", dataField: "sign" },
                { caption: "", dataField: "clr" },
                { caption: local.table2(), dataField: "txt", dataType: "text" },
                { caption: "", dataField: "ac", dataType: "text" },
                { caption: "", dataField: "asterisk", dataType: "text" }
            ]),
            columnsResult3: ko.observableArray([
                { caption: local.table3(), dataField: "txt", dataType: "text" },
                { caption: local.sigma(), dataField: "vlx", dataType: "number" }
            ]),
            columnsResult4: ko.observableArray([
                { caption: local.table3(), dataField: "txt", dataType: "text" }
            ]),
            actionSheetVisible: ko.observable(false),
            actionSheetData: [
                { text: local.restart(), clickAction: "#WelcomeView" }
            ],
            pivotItemClick: function (e) {
                this.actionSheetVisible(true);
            },
            viewShown: function() {
                luscher.app.navigation[this.navigationId()].option('disabled', false);
            },

            message1: local.message1,
            message2: local.message2,
            message3: local.message3,
            pivotItems: [
                {
                    title: "All",
                    template: "item",

                    table1: local.table1,
                    table2: local.table2,
                    table3: local.table3,

                    dataGridSource1: luscher.dataGridSource1,
                    dataGridSource2: luscher.dataGridSource2,
                    dataGridSource3: luscher.dataGridSource3,

                    columnsTable1: ko.observableArray([
                        { caption: "", dataField: "item", dataType: "text" },
                        { caption: local.item1(), dataField: "item1" },
                        { caption: local.item2(), dataField: "item2" },
                        { caption: local.item3(), dataField: "item3" },
                        { caption: local.item4(), dataField: "item4" },
                        { caption: local.item5(), dataField: "item5" }
                    ]),
                    columnsTable2: ko.observableArray([
                        { caption: "", dataField: "item", dataType: "text" },
                        { caption: local.item1(), dataField: "item1" },
                        { caption: local.item2(), dataField: "item2" },
                        { caption: local.item3(), dataField: "item3" },
                        { caption: local.item4(), dataField: "item4" },
                        { caption: local.item5(), dataField: "item5" },
                        { caption: local.item6(), dataField: "item6" },
                        { caption: local.item7(), dataField: "item7" },
                        { caption: local.item8(), dataField: "item8" }
                    ]),
                    columnsTable3: ko.observableArray([
                        { caption: "", dataField: "item", dataType: "text" },
                        { caption: "I1", dataField: "i1" },
                        { caption: "D2", dataField: "d2" },
                        { caption: "O3", dataField: "o3" },
                        { caption: "P4", dataField: "p4" }
                    ]),
                },
                {
                    title: local.table1(),
                    template: "result1",
                    resultDataSource1: luscher.resultDataSource1,
                },
                {
                    title: local.table2(),
                    template: "result2",
                    resultDataSource2: luscher.resultDataSource2,
                },
                {
                    title: local.table3(),
                    template: "result3",
                    resultDataSource3: luscher.resultDataSource3,
                },
                {
                    title: local.table3(),
                    template: "result4",
                    resultDataSource4: luscher.resultDataSource4,
                }
            ],
        };

        return viewModel;
    };
})(LuscherColorDiagnostic, $.Localize, $.Color);