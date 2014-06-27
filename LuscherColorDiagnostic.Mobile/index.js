
$(function() {
    var startupView = "WelcomeView";

    // Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
    // DevExpress.devices.current({ platform: "generic" });

    if(DevExpress.devices.real().platform === "win8") {
        $("body").css("background-color", "#000");
    }

    document.addEventListener("deviceready", onDeviceReady, false);
    
    function onDeviceReady() {
        navigator.splashscreen.hide();
        document.addEventListener("backbutton", onBackButton, false);
    }

    function onBackButton() {
        DevExpress.hardwareBackButton.fire();
    }

    function onNavigatingBack(e) {
        if(e.isHardwareButton && !LuscherColorDiagnostic.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "tizen":
                tizen.application.getCurrentApplication().exit();
                break;
            case "android":
                navigator.app.exitApp();
                break;
            case "win8":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    LuscherColorDiagnostic.app = new DevExpress.framework.html.HtmlApplication({
        namespace: LuscherColorDiagnostic,
        layoutSet: DevExpress.framework.html.layoutSets[LuscherColorDiagnostic.config.layoutSet],
        navigation: LuscherColorDiagnostic.config.navigation
    });

    $(window).unload(function() {
        LuscherColorDiagnostic.app.saveState();
    });

    LuscherColorDiagnostic.app.router.register(":view/:id", { view: startupView, id: undefined });
    LuscherColorDiagnostic.app.navigatingBack.add(onNavigatingBack);
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