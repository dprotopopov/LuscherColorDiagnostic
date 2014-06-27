(function($, DX, undefined) {
    var APPBAR_TOUCH_AREA_HEIGHT = 50,
        APPBAR_TOUCH_THRESHOLD = 50,
        EVENTS_NAMESPACE = ".dxSplitLayout",
        KEYCODE_WIN = 91,
        KEYCODE_Z = 90;
    var SplitLayoutEventHelper = DX.Class.inherit({
            ctor: function(splitLayout) {
                this.root = splitLayout
            },
            init: function() {
                this.root._$viewPort.on("MSPointerUp" + EVENTS_NAMESPACE, $.proxy(this._handlePointerUp, this));
                this.root._$viewPort.on("MSPointerDown" + EVENTS_NAMESPACE, $.proxy(this._handlePointerDown, this));
                $(document).on("keydown" + EVENTS_NAMESPACE, $.proxy(this._handleKeyDown, this));
                $(document).on("keyup" + EVENTS_NAMESPACE, $.proxy(this._handleKeyUp, this));
                this._startTouchPoint = false;
                this._winKeyPressed = false;
                this._moveEvent = false;
                this._appbarBehavior = true
            },
            _handlePointerDown: function(e) {
                var originalEvent = e.originalEvent;
                if (this._isTouch(originalEvent) && this._startedInAppBarArea(originalEvent)) {
                    this._startTouchPoint = {
                        x: originalEvent.clientX,
                        y: originalEvent.clientY
                    };
                    this.root._$viewPort.on("MSPointerMove" + EVENTS_NAMESPACE, $.proxy(this._handlePointerMove, this))
                }
            },
            _handlePointerMove: function(e) {
                var originalEvent = e.originalEvent;
                if (this._tresholdExceeded(originalEvent)) {
                    this._moveEvent = true;
                    this.root._$viewPort.off("MSPointerMove" + EVENTS_NAMESPACE);
                    if (this._isVericalDirection(originalEvent.clientX, originalEvent.clientY))
                        this._toggleAppBarState(true)
                }
            },
            _handlePointerUp: function(e) {
                this.root._$viewPort.off("MSPointerMove" + EVENTS_NAMESPACE);
                var $appBar = this.root._$viewPort.find(".dx-app-bar");
                if (e.originalEvent.button === 2)
                    this._toggleAppBarState();
                else if (!this._moveEvent && $appBar[0] && !$appBar[0].contains(e.target))
                    this._toggleAppBarState(false);
                this._moveEvent = false
            },
            _handleKeyDown: function(e) {
                if (e.keyCode === KEYCODE_WIN)
                    this._winKeyPressed = true
            },
            _handleKeyUp: function(e) {
                if (this._winKeyPressed && e.keyCode === KEYCODE_Z)
                    this._toggleAppBarState();
                else if (e.keyCode === KEYCODE_WIN)
                    this._winKeyPressed = false
            },
            _toggleAppBarState: function(state) {
                if (!this.root._appBarHasCommands())
                    return;
                this.root._$viewPort.find(".dx-app-bar").toggleClass("dx-app-bar-visible", !this._appbarBehavior || state)
            },
            _isVericalDirection: function(x, y) {
                return Math.abs(y - this._startTouchPoint.y) > Math.abs(x - this._startTouchPoint.x)
            },
            _isTouch: function(event) {
                return event.pointerType === event.MSPOINTER_TYPE_TOUCH || event.pointerType === event.MSPOINTER_TYPE_PEN
            },
            _startedInAppBarArea: function(event) {
                return this.root._$viewPort.height() - APPBAR_TOUCH_AREA_HEIGHT < event.clientY
            },
            _tresholdExceeded: function(originalEvent) {
                return originalEvent.clientY < this._startTouchPoint.y - APPBAR_TOUCH_THRESHOLD
            }
        });
    DX.framework.html.MultipaneLayoutController = DX.framework.html.DefaultLayoutController.inherit({
        ctor: function(options) {
            options = options || {};
            options.name = options.name || "split";
            this._detailPaneName = options.detailPaneName || "detail";
            this._masterPaneName = options.masterPaneName || "master";
            options.defaultPaneName = this._detailPaneName;
            this.callBase(options);
            this._panesConfig = options.panesConfig;
            this._activeViews = {}
        },
        init: function(options) {
            options = options || {};
            this.callBase(options);
            this._router = options.app && options.app.router;
            this._onNavigatingHandler = $.proxy(this._onNavigating, this);
            this._onNavigatedHandler = $.proxy(this._onNavigated, this);
            this._onNavigatingBackHandler = $.proxy(this._onNavigatingBack, this);
            this._navigationManager = options.navigationManager;
            this._navigationManager.navigating.add(this._onNavigatingHandler);
            this._ensurePanesConfig();
            this._initChildControllers(options)
        },
        activate: function() {
            this.callBase();
            this._navigationManager.navigated.add(this._onNavigatedHandler);
            this._navigationManager.navigatingBack.add(this._onNavigatingBackHandler);
            $.each(this._panesConfig, function(_, paneConfig) {
                paneConfig.controller.activate()
            })
        },
        deactivate: function() {
            $.each(this._panesConfig, function(_, paneConfig) {
                paneConfig.controller.deactivate()
            });
            this._navigationManager.navigated.remove(this._onNavigatedHandler);
            this._navigationManager.navigatingBack.remove(this._onNavigatingBackHandler);
            this.callBase()
        },
        setViewLoadingState: function(viewInfo, direction) {
            return this._getPaneConfig(viewInfo).controller.setViewLoadingState(viewInfo, direction)
        },
        showView: function(viewInfo, direction) {
            var that = this,
                paneConfig = that._getPaneConfig(viewInfo);
            return paneConfig.controller.showView(viewInfo, direction).done(function() {
                    that._activeViews[that._getViewPaneName(viewInfo.viewTemplateInfo)] = viewInfo
                })
        },
        _updateLayoutTitle: function(viewInfo, defaultTitle) {
            if (this._getViewPaneName(viewInfo.viewTemplateInfo) === this._masterPaneName) {
                var title;
                if (viewInfo.model !== undefined)
                    title = ko.utils.unwrapObservable(viewInfo.model.title);
                else
                    title = (viewInfo.viewTemplateInfo || {}).title;
                this._layoutModel.title(title || defaultTitle || "")
            }
        },
        _ensurePanesConfig: function() {
            if (!this._panesConfig)
                this._panesConfig = this._createPanesConfig()
        },
        _createPanesConfig: function() {
            return {}
        },
        _initChildControllers: function(options) {
            var that = this;
            $.each(that._panesConfig, function(_, paneConfig) {
                var controller = paneConfig.controller;
                controller.init($.extend({}, options, {$viewPort: that._$mainLayout.find(paneConfig.selector)}));
                $.each(["viewRendered", "viewReleased"], function(_, callbacksPropertyName) {
                    var callbacks = controller[callbacksPropertyName];
                    if (callbacks)
                        callbacks.add(function(args) {
                            that[callbacksPropertyName].fireWith(that, [args])
                        })
                })
            })
        },
        _onNavigating: function(args) {
            var options = args.options,
                $sourceElement = this._getEventSourceElement();
            var routeValues = this._router.parse(args.uri),
                viewTemplateInfo = this._viewEngine.findViewComponent(routeValues.view).option(),
                pane = this._getViewPaneName(viewTemplateInfo);
            if (pane === this._detailPaneName) {
                options.stack = this._detailPaneName + "_pane";
                options.root = options.root === undefined ? $sourceElement.is(this._panesConfig[this._masterPaneName].selector + " *") : options.root;
                options.keepPositionInStack = false
            }
            else
                options.stack = options.stack || this._getTargetNavigationStackByEventSource();
            args.options.pane = pane
        },
        _onNavigated: function(args) {
            var paneConfig = this._panesConfig[args.options.pane];
            this._$mainLayout.find(paneConfig.selector).data("currentStackKey", this._navigationManager.currentStackKey)
        },
        _onNavigatingBack: function(args) {
            args.stack = args.stack || this._getTargetNavigationStackByEventSource()
        },
        _getEventSourceElement: function() {
            return event ? $(event.target || event.srcElement) : $()
        },
        _getTargetPaneConfigByEventSource: function() {
            var that = this,
                $sourceElement = this._getEventSourceElement(),
                result;
            if ($sourceElement.length)
                $.each(that._panesConfig, function(paneName, paneConfig) {
                    if ($sourceElement.is(paneConfig.selector + " *")) {
                        result = paneConfig;
                        return
                    }
                });
            return result
        },
        _getTargetNavigationStackByEventSource: function() {
            var paneConfig = this._getTargetPaneConfigByEventSource(),
                result;
            if (paneConfig)
                result = this._$mainLayout.find(paneConfig.selector).data("currentStackKey");
            return result
        },
        _getPaneConfig: function(viewInfo) {
            return this._panesConfig[this._getViewPaneName(viewInfo.viewTemplateInfo)]
        },
        _getViewPaneName: function(viewTemplateInfo) {
            var paneName = viewTemplateInfo.pane || this._detailPaneName;
            if (viewTemplateInfo.targetFrame !== undefined) {
                DX.utils.logger.warn("'targetFrame' option is deprecated, use the 'pane' option instead");
                if (viewTemplateInfo.targetFrame === "navigation")
                    paneName = this._masterPaneName
            }
            return paneName
        },
        _raiseEvent: function(callback) {
            callback.fire()
        },
        _ensureChildrenControllers: function(controllerName, layoutName) {
            if (!DX.framework.html[controllerName])
                throw new Error("The '" + controllerName + "' is not found. Make sure the '" + layoutName + "'* files are referenced in your main *.html file.");
        }
    });
    DX.framework.html.IOSSplitLayoutController = DX.framework.html.MultipaneLayoutController.inherit({_createPanesConfig: function() {
            this._ensureChildrenControllers("SimpleLayoutController", "SimpleLayout");
            return {
                    master: {
                        controller: new DX.framework.html.SimpleLayoutController,
                        selector: ".master-pane"
                    },
                    detail: {
                        controller: new DX.framework.html.SimpleLayoutController,
                        selector: ".detail-pane"
                    }
                }
        }});
    DX.framework.html.ToolbarController = DX.Class.inherit({
        ctor: function($toolbar, commandManager) {
            this._commandManager = commandManager;
            this._$toolbar = $toolbar;
            this._toolbar = $toolbar.dxToolbar("instance");
            this._commandContainer = $toolbar.dxCommandContainer("instance")
        },
        showViews: function(viewInfos) {
            var that = this,
                commands = this._mergeCommands(viewInfos),
                toolbarItems = that._toolbar.option("items"),
                newItems;
            newItems = $.map(toolbarItems, function(item) {
                return item.command ? undefined : item
            });
            that._toolbar.option("items", newItems);
            that._commandManager._arrangeCommandsToContainers(commands, [that._commandContainer])
        },
        _mergeCommands: function(viewInfos) {
            var that = this,
                result = [],
                idHash = {};
            $.each(viewInfos, function(_, viewInfo) {
                if (viewInfo.commands)
                    $.each(viewInfo.commands, function(_, command) {
                        var id = command.option("id");
                        if (!(id in idHash)) {
                            idHash[id] = true;
                            result.push(command)
                        }
                    })
            });
            return result
        }
    });
    DX.framework.html.AndroidSplitLayoutController = DX.framework.html.MultipaneLayoutController.inherit({
        ctor: function(options) {
            options = options || {};
            options.layoutModel = options.layoutModel || this._createLayoutModel();
            this.callBase(options)
        },
        init: function(options) {
            this.callBase(options);
            this.toolbarController = new DX.framework.html.ToolbarController(this._$mainLayout.find(".header-toolbar"), this._commandManager)
        },
        _createLayoutModel: function() {
            return {title: ko.observable("")}
        },
        setViewLoadingState: function(viewInfo, direction) {
            this._updateLayoutTitle(viewInfo, this.DEFAULT_LOADING_TITLE);
            return this.callBase(viewInfo, direction)
        },
        showView: function(viewInfo, direction) {
            var that = this;
            that._updateLayoutTitle(viewInfo);
            return that.callBase(viewInfo, direction).done(function() {
                    that.toolbarController.showViews(that._activeViews)
                })
        },
        _createPanesConfig: function() {
            this._ensureChildrenControllers("EmptyLayoutController", "EmptyLayout");
            return {
                    master: {
                        controller: new DX.framework.html.EmptyLayoutController,
                        selector: ".master-pane"
                    },
                    detail: {
                        controller: new DX.framework.html.EmptyLayoutController,
                        selector: ".detail-pane"
                    }
                }
        }
    });
    DX.framework.html.Win8SplitLayoutController = DX.framework.html.MultipaneLayoutController.inherit({
        ctor: function(options) {
            options = options || {};
            this._eventHelper = new SplitLayoutEventHelper(this);
            options.layoutModel = options.layoutModel || this._createLayoutModel();
            this.callBase(options)
        },
        init: function(options) {
            this.callBase(options);
            this._eventHelper.init();
            this.headerToolbarController = new DX.framework.html.ToolbarController(this._$mainLayout.find(".header-toolbar"), this._commandManager);
            this.footerToolbarController = new DX.framework.html.ToolbarController(this._$mainLayout.find(".footer-toolbar"), this._commandManager)
        },
        setViewLoadingState: function(viewInfo, direction) {
            this._updateLayoutTitle(viewInfo, this.DEFAULT_LOADING_TITLE);
            return this.callBase(viewInfo, direction)
        },
        showView: function(viewInfo, direction) {
            var that = this;
            that._updateLayoutTitle(viewInfo);
            return that.callBase(viewInfo, direction).done(function() {
                    that.headerToolbarController.showViews(that._activeViews);
                    that.footerToolbarController.showViews(that._activeViews)
                })
        },
        _createLayoutModel: function() {
            return {title: ko.observable("")}
        },
        _createPanesConfig: function() {
            this._ensureChildrenControllers("EmptyLayoutController", "EmptyLayout");
            return {
                    master: {
                        controller: new DX.framework.html.EmptyLayoutController,
                        selector: ".left-content"
                    },
                    detail: {
                        controller: new DX.framework.html.EmptyLayoutController,
                        selector: ".right-content"
                    }
                }
        },
        _appBarHasCommands: function() {
            var footerToolbar = this._$viewPort.find(".footer-toolbar").data("dxToolbar");
            return footerToolbar ? footerToolbar.option("items").length : false
        }
    });
    var layoutSets = DX.framework.html.layoutSets;
    layoutSets["split"] = layoutSets["split"] || [];
    layoutSets["split"].push({
        platform: "ios",
        tablet: true,
        controller: new DX.framework.html.IOSSplitLayoutController
    });
    layoutSets["split"].push({
        platform: "android",
        tablet: true,
        controller: new DX.framework.html.AndroidSplitLayoutController
    });
    layoutSets["split"].push({
        platform: "generic",
        tablet: true,
        controller: new DX.framework.html.IOSSplitLayoutController
    });
    layoutSets["split"].push({
        platform: "win8",
        phone: false,
        controller: new DX.framework.html.Win8SplitLayoutController
    })
})(jQuery, DevExpress);