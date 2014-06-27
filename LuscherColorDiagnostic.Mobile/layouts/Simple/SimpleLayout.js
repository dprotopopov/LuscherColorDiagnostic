(function($, DX, undefined) {
    DX.framework.html.SimpleLayoutController = DX.framework.html.DefaultLayoutController.inherit({ctor: function(options) {
            options = options || {};
            options.name = options.name || "simple";
            this.callBase(options)
        }});
    var HAS_TOOLBAR_BOTTOM_CLASS = "has-toolbar-bottom",
        TOOLBAR_BOTTOM_SELECTOR = ".layout-toolbar-bottom";
    DX.framework.html.Win8SimpleLayoutController = DX.framework.html.SimpleLayoutController.inherit({
        _showViewImpl: function(viewInfo) {
            var that = this,
                result = that.callBase.apply(that, arguments),
                $frame = that._getViewFrame(),
                $appbar = $frame.find(TOOLBAR_BOTTOM_SELECTOR);
            $appbar.each(function(i, element) {
                var $element = $(element);
                appbar = $element.dxToolbar("instance");
                if (appbar) {
                    that._refreshAppbarVisibility(appbar, $frame);
                    appbar.optionChanged.add(function(optionName, optionValue) {
                        if (optionName === "items")
                            that._refreshAppbarVisibility(appbar, $frame)
                    })
                }
            });
            return result
        },
        _refreshAppbarVisibility: function(appbar, $content) {
            var isAppbarNotEmpty = false;
            $.each(appbar.option("items"), function(index, item) {
                if (item.visible) {
                    isAppbarNotEmpty = true;
                    return false
                }
            });
            $content.toggleClass(HAS_TOOLBAR_BOTTOM_CLASS, isAppbarNotEmpty);
            appbar.option("visible", isAppbarNotEmpty)
        }
    });
    var layoutSets = DX.framework.html.layoutSets;
    layoutSets["navbar"] = layoutSets["navbar"] || [];
    layoutSets["navbar"].push({
        platform: "win8",
        root: false,
        phone: true,
        controller: new DX.framework.html.Win8SimpleLayoutController
    });
    layoutSets["navbar"].push({
        platform: "android",
        root: false,
        controller: new DX.framework.html.SimpleLayoutController
    });
    layoutSets["simple"] = layoutSets["simple"] || [];
    layoutSets["simple"].push({controller: new DX.framework.html.SimpleLayoutController});
    layoutSets["simple"].push({
        platform: "win8",
        phone: true,
        controller: new DX.framework.html.Win8SimpleLayoutController
    })
})(jQuery, DevExpress);