(function($, DX, undefined) {
    var HAS_TOOLBAR_BOTTOM_CLASS = "has-toolbar-bottom",
        TOOLBAR_BOTTOM_SELECTOR = ".layout-toolbar-bottom",
        ACTIVE_PIVOT_ITEM_SELECTOR = ".dx-pivot-item:not(.dx-pivot-item-hidden)",
        LAYOUT_FOOTER_SELECTOR = ".layout-footer";
    DX.framework.html.PivotLayoutController = DX.framework.html.DefaultLayoutController.inherit({
        ctor: function(options) {
            options = options || {};
            options.name = options.name || "pivot";
            this.callBase(options)
        },
        init: function(options) {
            this.callBase(options)
        },
        _createNavigation: function(navigationCommands) {
            var that = this;
            this.$root = $("<div/>").addClass("pivot-layout").appendTo(this._$hiddenBag);
            this.$pivot = $("<div/>").appendTo(this.$root).dxPivot({itemRender: function(itemData, itemIndex, itemElement) {
                    var emptyLayout = that._createEmptyLayout();
                    emptyLayout.find(".layout-footer").remove();
                    emptyLayout.appendTo(itemElement)
                }}).dxCommandContainer({id: 'global-navigation'});
            this.$footer = that._createEmptyLayout().find(".layout-footer").insertAfter(this.$pivot);
            var container = this.$pivot.dxCommandContainer("instance");
            this._commandManager.renderCommandsToContainers(navigationCommands, [container])
        },
        _getRootElement: function() {
            return this.$root
        },
        _getViewFrame: function(viewInfo) {
            var $result = this.$pivot.find(ACTIVE_PIVOT_ITEM_SELECTOR);
            $result = $result.add(this.$footer);
            return $result
        },
        _showViewImpl: function(viewInfo, direction) {
            this._showViewElements(viewInfo.renderResult.$markup);
            this._changeView(viewInfo);
            this._changeAppbar();
            return $.Deferred().resolve().promise()
        },
        _templateContextChangedHandler: function() {
            $.each(this._visibleViews, $.proxy(function(index, viewInfo) {
                var previousViewInfo = this._getPreviousViewInfo(viewInfo);
                if (previousViewInfo)
                    this._hideView(previousViewInfo)
            }, this));
            this.callBase()
        },
        _changeAppbar: function() {
            var $appbar = this.$footer.find(".dx-active-view " + TOOLBAR_BOTTOM_SELECTOR),
                appbar = $appbar.data("dxToolbar");
            if (appbar)
                this._refreshAppbarVisibility(appbar, this.$root)
        },
        _refreshAppbarVisibility: function(appbar, $container) {
            var isAppbarNotEmpty = false;
            $.each(appbar.option("items"), function(index, item) {
                if (item.visible) {
                    isAppbarNotEmpty = true;
                    return false
                }
            });
            $container.toggleClass(HAS_TOOLBAR_BOTTOM_CLASS, isAppbarNotEmpty);
            appbar.option("visible", isAppbarNotEmpty)
        },
        _hideView: function(viewInfo) {
            this.callBase.apply(this, arguments);
            this._changeAppbar()
        }
    });
    var layoutSets = DX.framework.html.layoutSets;
    layoutSets["navbar"] = layoutSets["navbar"] || [];
    layoutSets["navbar"].push({
        platform: "win8",
        phone: true,
        root: true,
        controller: new DX.framework.html.PivotLayoutController
    })
})(jQuery, DevExpress);