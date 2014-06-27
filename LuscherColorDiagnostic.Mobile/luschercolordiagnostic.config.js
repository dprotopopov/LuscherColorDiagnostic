
// NOTE object below must be a valid JSON
window.LuscherColorDiagnostic = $.extend(true, window.LuscherColorDiagnostic, {
    "config": {
        "layoutSet": "navbar",
        "navigation": [
            {
                "title": $.Localize.about(),
                "action": function () { LuscherColorDiagnostic.app.navigate("About"); },
                "icon": "info"
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("GreyTable1/0"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable2/0"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable3/0"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable3/1"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable3/2"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable3/3"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ColorTable3/4"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": function () { LuscherColorDiagnostic.app.navigate("ReadyView"); },
                "icon": "arrowright",
            },
            {
                "title": $.Localize.next(),
                "action": "#ProcessView",
                "icon": "arrowright",
            },
            {
                "title": $.Localize.home(),
                "action": "#WelcomeView",
                "icon": "home",
            }
        ]
    }
});
