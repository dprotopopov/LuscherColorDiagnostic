
$(function() {
    var startupView = "About";


    LuscherColorDiagnostic.app = new DevExpress.framework.html.HtmlApplication({
        namespace: LuscherColorDiagnostic,
        layoutSet: DevExpress.framework.html.layoutSets[LuscherColorDiagnostic.config.layoutSet],
        navigation: LuscherColorDiagnostic.config.navigation
    });

    $(window).unload(function() {
        LuscherColorDiagnostic.app.saveState();
    });

    LuscherColorDiagnostic.app.router.register(":view/:id", { view: "Home", id: undefined });
    LuscherColorDiagnostic.app.navigate();
});