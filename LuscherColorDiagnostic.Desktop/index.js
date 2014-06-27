
$(function() {
    var startupView = "WelcomeView";

    DevExpress.devices.current("desktop");

    LuscherColorDiagnostic.app = new DevExpress.framework.html.HtmlApplication({
        namespace: LuscherColorDiagnostic,
        layoutSet: DevExpress.framework.html.layoutSets[LuscherColorDiagnostic.config.layoutSet],
        mode: "webSite",
        navigation: LuscherColorDiagnostic.config.navigation
    });

    $(window).unload(function() {
        LuscherColorDiagnostic.app.saveState();
    });

    LuscherColorDiagnostic.app.router.register(":view/:id", { view: startupView, id: undefined });
    LuscherColorDiagnostic.app.navigate();

    LuscherColorDiagnostic.app.initialized.add(function (args) {
        for (var i = 0; i < LuscherColorDiagnostic.app.navigation.length; i++) {
            LuscherColorDiagnostic.app.navigation[i].option('visible', false);
            LuscherColorDiagnostic.app.navigation[i].option('disabled', true);
        }
    });

    LuscherColorDiagnostic.app.viewShown.add(function (args) {
        var viewModel = args.viewInfo.model,
            direction = args.direction;
        for (var i = 0; i < LuscherColorDiagnostic.app.navigation.length; i++) {
            LuscherColorDiagnostic.app.navigation[i].option('visible', false);
            LuscherColorDiagnostic.app.navigation[i].option('disabled', true);
        }
        if (viewModel.name != "About") {
            LuscherColorDiagnostic.app.navigation[0].option('visible', true);
            LuscherColorDiagnostic.app.navigation[0].option('disabled', false);
            LuscherColorDiagnostic.app.navigation[viewModel.navigationId()].option('visible', true);
            viewModel.viewShown();
        }
    });
});