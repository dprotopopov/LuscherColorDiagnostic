(function(win){

	if(!String.prototype.trim) {
		String.prototype.trim = function() { return this.replace(/^\s+|\s+$/, ''); };
	};

	var ie = typeof(win.addEventListener) == "undefined";

	/* BBAPI Event */
	var Event = function(){
		var addEvent = ie ?
			function (element, event_name, listener) { var f = function(){ listener.apply(element, arguments); }; element.attachEvent("on" + event_name, f); addLeakedHook(element, "on" + event_name, f); return f; } :
			function (element, event_name, listener, capture) { element.addEventListener(event_name, listener, capture || false); return listener; };

		var removeEvent = ie ?
			function (element, event_name, listener) { element.detachEvent("on" + event_name, listener); return listener;  } :
			function (element, event_name, listener, capture) { element.removeEventListener(event_name, listener, capture || false); return listener; };


		var leakedHooks = [];

		var addLeakedHook = function (element, event_type, listener) {
			var f = (function (element, event_type, listener) {
				return function () {
					element.detachEvent(event_type, listener);
					element.parentNode && element.parentNode.removeChild(element);
				};
			})(element, event_type, listener);
			leakedHooks.push(f);
		};

		var fixMemoryLeaks = function () {
			for(var i = 0; i < leakedHooks.length; i++){
				leakedHooks[i]();
			};
		};

		if(ie) {
			addEvent(win, "unload", fixMemoryLeaks);
		};

		var wrap = ie ?
			function (e) {
				e.target = e.srcElement;
				e.currentTarget = e.fromElement;
				e.stopPropagation = function() { this.cancelBubble = true; };
				e.preventDefault = function() { this.returnValue = false; };
				return e;
			} :
			function (e) { return e; };

		var stopEvent = function (event) {
			wrap(event);
			event.stopPropagation();
			event.preventDefault();
			return false;
		};


		return {
			addEvent: addEvent,
			removeEvent: removeEvent,

			wrap: wrap,
			stopEvent: stopEvent
		};
	};

	/* BBAPI Event end */


	/* BBAPI css */
	var css = {
		addClass: function(element, class_name){
			return (element.className += " " + class_name, element);
		},

		removeClass: function (element, class_name){
			var classes = element.className.split(' ');

			for(var i = 0; i < classes.length; i++) {
				if (classes[i] == class_name) {
					classes.splice(i, 1);
					i--;
				}
			};

			return (element.className = classes.join(' '), element);
		},

		style: function(element, styles){
			return (win.BBAPI.utils.extend(element.style, styles), element);
		},

		show: function(element){
			return this.style(element, {display: "block"});
		},

		hide: function(element){
			return this.style(element, {display: "none"});
		},

		showV: function(element){
			return this.style(element, {visibility: "inherit"});
		},

		hideV: function(element){
			return this.style(element, {visibility: "hidden"});
		},

		showIb: function(element){
			return this.style(element, {display: "inline-block"});
		}
	};
	/* BBAPI css end */


	/* BBAPI utils */
	var utils = {
		isDebug: function(){
			try {
				return 'localStorage' in window && window['localStorage'] !== null && localStorage.getItem("bb-debug");
			} catch (e) {
				return false;
			}
		},

		closure: function (self, f) { return function () { return f.apply(self, arguments); }},

		callbackDelay: function(delay){
			this.delay = delay || 300;
			this.timeout_id = null;

			return win.BBAPI.utils.closure(this, function(callback){
				clearTimeout(this.timeout_id);

				this.timeout_id = setTimeout(callback, this.delay);
			});
		},

		waitingFor: function (f_cond, f_call, args) {
			var x = function () { f_cond() ? f_call(args) : setTimeout(x, 50); };
			return x;
		},

		scrollTop: function(){
			return win.pageYOffset || document.documentElement.scrollTop;
		},

		coordinates: function(element){
			var box = element.getBoundingClientRect();

			var body = document.body;
			var docEl = document.documentElement;

			var scrollTop = win.pageYOffset || docEl.scrollTop || body.scrollTop;
			var scrollLeft = win.pageXOffset || docEl.scrollLeft || body.scrollLeft;

			var clientTop = docEl.clientTop || body.clientTop || 0;
			var clientLeft = docEl.clientLeft || body.clientLeft || 0;

			var top  = box.top +  scrollTop - clientTop;
			var left = box.left + scrollLeft - clientLeft;

			return { top: Math.round(top), left: Math.round(left) };
		},

		requestAnimFrame: (function(){
			return win.requestAnimationFrame  ||
				win.webkitRequestAnimationFrame ||
				win.mozRequestAnimationFrame    ||
				win.oRequestAnimationFrame      ||
				win.msRequestAnimationFrame     ||
				function(callback){
					setTimeout(callback, 16.66);
				}
		})(),

		extend: function(to, from) {
			for(var i in from) {
				to[i] = from[i];
			};

			return to;
		},

		isNotNull: function(obj){
			var i = 0;
			for(var key in obj){
				++i;
				break;
			};

			return i != 0;
		},

		length: function(obj) {
			var size = 0, key;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) size++;
			};

			return size;
		},

		placeholder: function(root, color){
			if(!!("placeholder" in BBAPI.dom()("input"))){
				return;
			};

			var isPassword = function(input){
				return input.type.toLowerCase() == "password";
			};

			var inputs = BBAPI.dom(root).lookup("input");
			color = color || "#757575";

			for(var i=0; i<inputs.length; i++){
				var input = inputs[i];

				if(!input || !input.getAttribute("placeholder") || !input.type.toLowerCase().match(/text|password/)) continue;

				var self_color = input.style.color;
				var placeholder = input.getAttribute("placeholder");
				var is_password = isPassword(input);

				var showFakePassword = (function(){
					var fakePassword;

					return function(input, placeholder){
						return {
							show: function(){
								BBAPI.css.hide(input);

								if(!fakePassword){
									fakePassword = BBAPI.dom()("input", input.className, {type: "text", value: placeholder});
									fakePassword.style.color = color;

									input.parentNode.insertBefore(fakePassword, input.nextSibling);

									BBAPI.event.addEvent(fakePassword, "focus", function(){
										BBAPI.css.hide(this);
										BBAPI.css.show(input);

										input.focus();
									});

								} else {
									BBAPI.css.show(fakePassword);
								};
							},

							hide: function(){
								BBAPI.css.hide(fakePassword);
								BBAPI.css.show(input);
							}
						};
					};
				})();

				if(input.value === "" || input.value == placeholder) {
					if (is_password) {
						showFakePassword(input, placeholder).show();
					};

					input.value = placeholder;
					input.style.color = color;
					input.setAttribute("data-placeholder-on", "true");
				};


				BBAPI.event.addEvent(input, "focus", (function(input, self_color){
					return function(){
						input.style.color = self_color;
						if(input.getAttribute("data-placeholder-on")) {
							input.setAttribute("data-placeholder-on", "");
							input.value = "";
						};
					};
				})(input, self_color));

				BBAPI.event.addEvent(input, "blur", (function(input, self_color, placeholder, is_password, showFakePassword){
					return function(){
						if(input.value === "") {
							is_password && showFakePassword(input, placeholder).show();

							input.setAttribute("data-placeholder-on", "true");
							input.value = placeholder;
							input.style.color = color;
						} else {
							is_password && showFakePassword(input, placeholder).hide();

							input.style.color = self_color;
							input.setAttribute("data-placeholder-on", "");
						};
					};
				})(input, self_color, placeholder, is_password, showFakePassword));

				// устанавливаем value в "" при сабмите
				input.form && BBAPI.event.addEvent(input.form, "submit", (function(input){
					return function(){
						if(input.getAttribute("data-placeholder-on")){
							input.value = "";
						};
					};
				})(input));

			};

			return inputs;
		},

		cookie: {
			getCookie: function(name){
				var matches = document.cookie.match(new RegExp(
					"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
				));

				return matches ? decodeURIComponent(matches[1]) : undefined;
			}
		},

		text: {
			cleanPost: function(str){
				return str.replace(/(?:class|style|id)="[^"]*"/ig, function(a, i){
					return a.match(/user_link_post/) ? a : "";
				});
			}
		},

		rangeHelper: function(){
			var isW3C = !!win.getSelection,
				doc = document,
				currentSelection,
				$editorContainer,
				isSelectionCheckPending,
				characterStr = 'character'; // Used to improve minification;


			var rangeHelper = {

				config: {
					startMarker: "bbrange-start-marker",
					endMarker:   "bbrange-end-marker"
				},

				selectedRange: function() {
					var	range, parent,
						sel = isW3C ? win.getSelection() : doc.selection;

					if(!sel)
						return;

					// When creating a new range, set the start to the body
					// element to avoid errors in FF.
					if(sel.getRangeAt && sel.rangeCount <= 0){
						range = doc.createRange();
						range.setStart(doc.body, 0);
						sel.addRange(range);
					}

					range = isW3C ? sel.getRangeAt(0) : sel.createRange();

					return range;
				},

				insertHTML: function(html, endHTML) {
					var	node, div,
						range = this.selectedRange();

					if(endHTML)
						html += this.selectedHtml() + endHTML;

					if(isW3C){
						div           = doc.createElement('div');
						node          = doc.createDocumentFragment();
						div.innerHTML = html;

						while(div.firstChild)
							node.appendChild(div.firstChild);

						this.insertNode(node);
					} else {
						if(!range)
							return false;

						range.pasteHTML(html);
					}
				},

				insertNode: function(node, endNode) {
					if(isW3C){
						var	selection, selectAfter,
							toInsert = doc.createDocumentFragment(),
							range    = this.selectedRange();

						if(!range)
							return false;

						toInsert.appendChild(node);

						if(endNode){
							toInsert.appendChild(range.extractContents());
							toInsert.appendChild(endNode);
						}

						selectAfter = toInsert.lastChild;

						// If the last child is undefined then there is nothing to insert so return
						if(!selectAfter)
							return;

						range.deleteContents();
						range.insertNode(toInsert);

						selection = doc.createRange();
						selection.setStartAfter(selectAfter);
						this.selectRange(selection);
					}
					else
						this.insertHTML(node.outerHTML, endNode?endNode.outerHTML:null);
				},

				selectedHtml: function() {
					var	div,
						range = this.selectedRange();

					if(!range)
						return '';

					// IE < 9
					if(!isW3C && range.text !== '' && range.htmlText)
						return range.htmlText;


					// IE9+ and all other browsers
					if(isW3C){
						div = doc.createElement('div');
						div.appendChild(range.cloneContents());

						return div.innerHTML;
					}

					return '';
				},

				cloneSelected: function() {
					var range = this.selectedRange();

					if(range)
						return isW3C ? range.cloneRange() : range.duplicate();
				},

				checkSelectionChanged: function() {
					var check = function() {
						// rangeHelper could be null if editor was destoryed
						// before the timeout had finished
						if(rangeHelper && !rangeHelper.compare(currentSelection)){
							currentSelection = rangeHelper.cloneSelected();
							$editorContainer.trigger($.Event('selectionchanged'));
						}

						isSelectionCheckPending = false;
					};

					if(isSelectionCheckPending)
						return;

					isSelectionCheckPending = true;

					// In IE, this is only called on the selectionchanged event so no need to
					// limit checking as it should always be valid to do.
					if(typeof(window.addEventListener) == "undefined")
						check();
					else
						setTimeout(check, 100);
				},

				insertNodeAt: function(start, node) {
					var	currentRange = this.selectedRange(),
						range        = this.cloneSelected();

					if(!range)
						return false;

					range.collapse(start);

					if(range.insertNode)
						range.insertNode(node);
					else
						range.pasteHTML(node.outerHTML);

					// Reselect the current range.
					// Fixes issue with Chrome losing the selection. Issue#82
					this.selectRange(currentRange);
				},

				saveRange: function() {
					this.insertMarkers();
				},

				selectRange: function(range) {
					if(!isW3C)
						range.select();
					else {
						win.getSelection().removeAllRanges();
						win.getSelection().addRange(range);
					}
				},

				restoreRange: function() {
					var	marker,
						range = this.selectedRange(),
						start = this.getMarker(this.config.startMarker),
						end   = this.getMarker(this.config.endMarker);

					if(!start || !end || !range)
						return false;

					if(!isW3C){
						range  = doc.body.createTextRange();
						marker = doc.body.createTextRange();

						marker.moveToElementText(start);
						range.setEndPoint('StartToStart', marker);
						range.moveStart(characterStr, 0);

						marker.moveToElementText(end);
						range.setEndPoint('EndToStart', marker);
						range.moveEnd(characterStr, 0);

						this.selectRange(range);
					} else {
						range = doc.createRange();

						range.setStartBefore(start);
						range.setEndAfter(end);

						this.selectRange(range);
					}

					this.removeMarkers();
				},
				removeMarkers: function() {
					this.removeMarker(this.config.startMarker);
					this.removeMarker(this.config.endMarker);
				},

				_createMarker: function(id) {
					this.removeMarker(id);

					var marker              = doc.createElement("span");
					marker.id               = id;
					marker.style.lineHeight = "0";
					marker.style.display    = "none";
					marker.className        = "bbrange-selection bbrange-ignore";

					return marker;
				},

				insertMarkers: function() {
					this.insertNodeAt(true, this._createMarker(this.config.startMarker));
					this.insertNodeAt(false, this._createMarker(this.config.endMarker));
				},

				getMarker: function(id) {
					return doc.getElementById(id);
				},

				removeMarker: function(id) {
					var marker = this.getMarker(id);

					if(marker)
						marker.parentNode.removeChild(marker);
				},

				compare: function(rangeA, rangeB) {
					if(!rangeB)
						rangeB = this.selectedRange();

					if(!rangeA || !rangeB)
						return !rangeA && !rangeB;

					if(!isW3C){
						return rangeA.compareEndPoints('EndToEnd', rangeB)  === 0 &&
							rangeA.compareEndPoints('StartToStart', rangeB) === 0;
					}

					return rangeA.compareBoundaryPoints(Range.END_TO_END, rangeB)  === 0 &&
						rangeA.compareBoundaryPoints(Range.START_TO_START, rangeB) === 0;
				}
			};

			return rangeHelper;
		},

		getViewportSize: function(doc) {
			doc = doc || document;
			var elem  = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;

			var docHeight = Math.max(
				doc.body.scrollHeight, doc.documentElement.scrollHeight,
				doc.body.offsetHeight, doc.documentElement.offsetHeight,
				doc.body.clientHeight, doc.documentElement.clientHeight
			);

			return {docHeight: docHeight, clientHeight: elem.clientHeight, clientWidth: elem.clientWidth};
		},

		endlessScroll: function(options){

			var endlessScroll = function(){
				var onMove = BBAPI.utils.closure(this, this.tinyScrollEvent);

				this.config = {
					url: "",
					method: "GET",
					data: {},
					container: false,
					tiny: false,
					tiny_options: {},
					_tiny_options: { "onMove": onMove },
					loadOnPercent: 0.7,
					callback: false
				};

				this._isLoading = null;
				this.tinyScrollEventOn = true;

				this._scrollEventCallback = BBAPI.utils.closure(this, this.scrollEvent);
			};

			endlessScroll.prototype = {

				init: function(){
					BBAPI.utils.extend(this.config, options);

					if(this.config.tiny){
						// tiny
						var old_opt = BBAPI.utils.extend({}, this.config.tiny_options);
						var new_opt = BBAPI.utils.extend(old_opt, this.config._tiny_options);

						if(this.config.tiny.data('tsb')) {
							this.config.tiny.tinyscrollbar_update("", new_opt);
						} else {
							this.config.tiny.tinyscrollbar(new_opt);
						}

					} else {
						BBAPI.event.addEvent(window, "scroll", this._scrollEventCallback);
					};


					return this;
				},

				ajax: function(){
					var self = this;

					this._isLoading = true;


					BBAPI.ajax().url(this.config.url).method(this.config.method).data(this.config.data).done(function(xhr){
						if(xhr.status() == "200"){
							var result = JSON.parse(xhr.body());

							if(!result || result.length == 0){
								self.destroy();
							};

							self.config.callback && self.config.callback.call(self, result);
						};

						self._isLoading = false;
					}).run();
				},

				scrollEvent: function(){
					var scrollTop = BBAPI.utils.scrollTop(),
						viewportSize = BBAPI.utils.getViewportSize(),
						container_height = this.config.container ? this.config.container.clientHeight : viewportSize.docHeight;

					if((scrollTop+viewportSize.clientHeight > (container_height*this.config.loadOnPercent)) && !this._isLoading){
						this.ajax();
					}
				},

				tinyScrollEvent: function(current, max, percent){
					this.config.tiny_options.onMove && this.config.tiny_options.onMove.apply(this.config.tiny, arguments);

					if((percent > this.config.loadOnPercent*100) && !this._isLoading && this.tinyScrollEventOn){
						this.ajax();
					}
				},

				run: function(){
					if(this.config.tiny){

					}else {
						this._scrollEventCallback();
					};

					return this;
				},

				destroy: function(){
					if(this.config.tiny){
						// tiny
						this.tinyScrollEventOn = false;
					} else {
						BBAPI.event.removeEvent(window, "scroll", this._scrollEventCallback);
					};
				}
			};

			return new endlessScroll().init();
		}

	};
	/* BBAPI utils end */

	/* BBAPI animate */
	var ANIMATE = function(loop_callback, _duration, after_callback){

		var start = +new Date,
			duration = _duration || 300,
			finish = start + duration,
			running = true,
			easing = function(pos){ return (-Math.cos(pos*Math.PI)/2) + 0.5; },
			pos = 0,

			loop = function(){

				if (!running) {
					after_callback && after_callback();
					return;
				};

				// This is needed for opera. It doesn't pass timestamp as first
				// argument to loop.
				var time = +new Date;

				pos = time > finish ? 1 : (time-start) / duration;

				loop_callback(easing(pos), pos);

				BBAPI.utils.requestAnimFrame.call(window, loop);

				if(time > finish) {
					running = false;
				};
			};

		BBAPI.utils.requestAnimFrame.call(window, loop);
	};
	/* BBAPI animate end*/


	/* BBAPI browser */
	var BROWSER = function(){
		var userAgent = navigator.userAgent;

		return {
			/* some stuff for desktop browsers
			* isFF: {...}
			* isChrome: {...}
			* */

			isChrome: function(){
				return userAgent.toLowerCase().match(/chrome/i);
			},
			isSafari: function(){
				return !this.isChrome() && userAgent.toLowerCase().match(/safari/i);
			},

			isMobile: {
				Android: function() {
					return userAgent.match(/Android/i);
				},
				BlackBerry: function() {
					return userAgent.match(/BlackBerry/i);
				},
				iOS: function() {
					return userAgent.match(/iPhone|iPad|iPod/i);
				},
				Opera: function() {
					return userAgent.match(/Opera Mini/i);
				},
				Windows: function() {
					return userAgent.match(/IEMobile/i);
				},
				it: function() {
					return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
				}
			}
		};
	};
	/* BBAPI browser end */


	/* BBAPI modal */
	var MODAL = function(){
		this._config = {
			close_cb: false,
			url: false,
			id: false,
			delay: 0,
			cached: false,
			type: "0",
			show_cb: false,
			load_cb: false,

			style: {
				width: 250,
				marginLeft: -(250/2)-40
			}
		};
	};

	MODAL.prototype = {

		showAdvAuthorProfile: function(id){
			this._modal = document.getElementById(id);
			this.show();

			return false;
		},

		showAdvComplainForm: function(adv_id){
			this._modal = document.getElementById("adv-complain-form-modal");
			this.show();

			document.getElementById("complain-comment").focus();

			return false;
		},


		_template: function(){

			var templateHelper = function(container, bg, close, content){
				return {
					_modal: container,
					_modalBg: bg,
					_close_btn: close,
					_modal_container: content
				};
			};

			return {
				// default theme
				"0": win.BBAPI.utils.closure(this, function(){
					var dom = win.BBAPI.dom();

					var bg =                dom("div", "bb-modal-bg"),
							close_btn =         dom.append(dom("a", "bb-modal-close", {href: "javascript:void(0);"}), dom.text("×")),
							content_container = dom("div", "bb-modal-container"),
							modal_container =   dom.append(dom("div", "bb-modal"), [close_btn, content_container]);

					return templateHelper(modal_container, bg, close_btn, content_container);
				}),

				F: win.BBAPI.utils.closure(this, function(){
					var dom = win.BBAPI.dom();

					var bg =                dom("div", "bb-modal-bg bb-modal-bg-f"),
							close_btn =         dom("a", "bb-modal-close-f", {href: "javascript:void(0);"}),
							content_container = dom("div", "bb-modal-container bb-modal-container-f"),
							modal_container =   dom.append(dom("div", "bb-modal-f"), [content_container, close_btn]);

					return templateHelper(modal_container, bg, close_btn, content_container);
				}),

				C: win.BBAPI.utils.closure(this, function(){
					var dom = win.BBAPI.dom();
					var
						bg =                dom("div", "overlay crop-overlay popup-overlay"),
						close_btn =         dom("a", "icon icon-popup-close db abs", {href: "#"}),
						content_container = dom("div", "overview"),
						modal_header =      dom.append(dom.append(dom("div", "rel popup-header"), dom.append(dom("b","_21 _georgia _it"),dom.text(this._config.header_title ? this._config.header_title : ''))), close_btn),
						modal_footer =      dom("div", "popup-footer"),
						scroll_container =  dom.append(dom("div", "popup-body p20 scrollbarY"), [dom.append(dom("div", "viewport"), content_container), dom.append(dom("div", "scrollbar"), dom("div", "thumb"))]),
						modal_container =   dom.append(dom("div", "popup css-corner-3 clearfix popup-o"), [modal_header, scroll_container, modal_footer]);

					return templateHelper(modal_container, bg, close_btn, content_container);
				})
			}
		},


		_getAjaxData: function(){
			var self = this;

			BBAPI.ajax().url(this._config.url).done(function(xhr){
				if(xhr.status() == "200"){
					self._modal_container.innerHTML = xhr.body();

					self._config.load_cb && self._config.load_cb.call(self);
				};

				self._modal.style.backgroundImage = "none";
			}).run();
		},

		_destroy: function(){
			this._modalBg = false;
			this._modal = false;
			this._modal_container = false;
			this._close_btn = false;
		},


		init: function(options){
			var dom = BBAPI.dom();

			options && (BBAPI.utils.extend(this._config, options));

			// ссылка на боди
			this.$body = dom.body();

			// шаблон
			var template = this._template()[this._config.type]();

			// создание фона
			this._modalBg = template._modalBg;

			//создание диалога
			this._modal = template._modal;
			this._modal_container = template._modal_container;
			this._close_btn = template._close_btn;

			// стили в {style: {...}}
			if(options && options.style){
				for(var i in this._config.style){
					this._modal.style[i] = this._config.style[i] + "px";
				};
			};

			BBAPI.css.style(this._modal, {marginLeft: -(this._config.style.width/2)-40 + "px"});

			// если есть локальный контент
			if(this._config.id){
				this._modal_container.innerHTML = typeof this._config.id == "string" ? dom.id(this._config.id).innerHTML : this._config.id.innerHTML;
			};


			BBAPI.event.addEvent(this._modalBg, "click", BBAPI.utils.closure(this, this.remove));
			BBAPI.event.addEvent(this._close_btn, "click", BBAPI.utils.closure(this, this.remove));


			this.$body.appendChild(this._modalBg);
			this.$body.appendChild(this._modal);


			if(this._config.url){
				this._getAjaxData();
			};

			return this;
		},

		show: function(){
			setTimeout(BBAPI.utils.closure(this, function(){

				var self = this;
				if(!this._modalBg){
					this.init();
				};

				this._modalBg.style.display = "block";
				this._modal.style.display = "block";

				// обработка отступа сверху(скролл)
				this._modal.style.top = win.BBAPI.utils.scrollTop() + 100 + "px";

				// добавим event по esc для закрытия окна
				// 27 is the keycode for the Escape key
				this.$body_keyup_cb = win.BBAPI.event.addEvent(this.$body, "keyup", function(event){
					if((event.which || event.keyCode) === 27){ self.remove(); };
				});

				// callback на показ.
				self._config.show_cb && self._config.show_cb.call(this);

				// animation
				BBAPI.animate(function(progress){
					self._modalBg.style.opacity = progress;
					self._modal.style.opacity = progress;
				});

			}), this._config.delay);

			return this;
		},

		hide: function(){
			if(!this._modalBg){
				this.init();
			};

			if(this._config.close_cb){
				this._config.close_cb.call(this);
			};


			this._modalBg.style.display = "none";
			this._modal.style.display = "none";

			this._modalBg.style.opacity = "0";
			this._modal.style.opacity = "0";


			// удаляем event keyup у body, что бы при обычной работе на сайте не вызывался event
			win.BBAPI.event.removeEvent(this.$body, "keyup", this.$body_keyup_cb);

			return this;
		},

		remove: function(event){
			event && BBAPI.event.stopEvent(event);

			this.hide();

			if(!this._config.cached){
				this._modal.parentNode.removeChild(this._modal);
				this._modalBg.parentNode.removeChild(this._modalBg);

				this._destroy();
			};

			return this;
		}
	};
	/* BBAPI modal end */


	/* module BBAPI.requerejs */

	var REQUIRE = function(){ };

	REQUIRE.prototype.getConfig = function(){
		return this.config = {
			async: false,
			syncIndex: -1,
			delay: 0,
			noCache: false,
			afterLoad: function(){}
		};
	};

	REQUIRE.prototype.load = function(lists){
		if(lists[0]){
			$.extend(this.getConfig(), lists[0]);

			this.lists = lists;
			this.list = lists[0];

			if(this.config.async){
				this.loadAsync();
			}else{
				this.loadSync();
			};
		};
	};

	REQUIRE.prototype.loadAsync = function(){

		if(this.config.delay){
			this.loadScript(this.list.urls[0], function(){}); // загрузить первый элемент без задержки

			var index = 1, list = this.list, iid = setInterval(win.BBAPI.utils.closure(this, function(){
				if(list.urls[index]){
					this.loadScript(list.urls[index++], function(){});
				}else{
					clearInterval(iid);
				};
			}), this.config.delay);

		}else{
			for(var i=0; i<this.list.urls.length; i++){
				this.loadScript(this.list.urls[i], function(){});
			};
		};

		this.lists.shift();
		this.load(this.lists);
	};

	REQUIRE.prototype.loadSync = function(){

		if(this.list.urls[++this.config.syncIndex]){
			this.loadScript(this.list.urls[this.config.syncIndex], win.BBAPI.utils.closure(this, this.loadSync));
		}else{
			this.config.afterLoad();
			this.lists.shift();
			this.load(this.lists);
		};
	};

	REQUIRE.prototype.loadScript = function(src, callback){

		var loadScript = function (url, jsonp_callback, no_cache) {
			var listener = ie ? function () {(this.readyState.toLowerCase() == "loaded" || this.readyState.toLowerCase() == "complete") && jsonp_callback.apply(this, arguments); } : jsonp_callback;
			var script = document.createElement("script");

			if(no_cache){
				url += (url.indexOf("?") == -1 ? "?" : "&") + "_=" + new Date().getTime();
			};
			script.setAttribute("src", url);
			script.setAttribute("type", "text/javascript");
			listener && win.BBAPI.event.addEvent(script, ie ? "readystatechange" : "load", listener, false);
			return document.getElementsByTagName("head")[0].appendChild(script);
		};

		return loadScript(src, callback || function () { this.parentNode.removeChild(this); }, this.config.noCache);
	};

	/* module BBAPI.requerejs end */



	/* module BAAPI.ad */

	var AD = {}; // magic hide vars

	AD.floatScroll = function() {

		this._show = false;
		this._currentIndex = 0;
		this._state = -1;


		this.windowScrollTop = function(){
			return win.pageYOffset || document.documentElement.scrollTop;
		};

		this.windowScrollHeight = function(){
			var scrollHeight = document.documentElement.scrollHeight;
			var clientHeight = document.documentElement.clientHeight;

			return Math.max(scrollHeight, clientHeight);
		};

		this.getState = function(new_state){
			return new_state != this._state ? (this._state = new_state, true) : false;
		};
	};

	AD.floatScroll.prototype.getConfig = function(options){
		return this.config = {
			containerClassName: "ad_promo_float_block",
			preLoadContainers: [],

			//offsetTopContainer: $("#" + options.containerId).prev(),
			footer: $(options.footerSelector || ".footer"),

			maxHeight: Math.max.apply(null, options.preLoadContainers.map(function (){
				return $(this).height();
			}).get()),

			preLoadContainersLength: options.preLoadContainers.length

		};
	};

	AD.floatScroll.prototype.next = function(){

		this.hide();

		if(this._currentIndex >= this.config.preLoadContainers.length)
			this._currentIndex = 0;

		this.show();

		this._currentIndex++;
	};

	AD.floatScroll.prototype.show = function(){
		this._show = true;

		this.config.preLoadContainers.eq(this._currentIndex).addClass(this.config.containerClassName).fadeIn("slow", function(){
			// запрос на показ в TGB
			if(this.getAttribute("data-tgb")){
//                              временно отключаем сохранение показов, т.к. тормозит монго
				BBAPI.ajax().url("/adlink/view").data({id: this.getAttribute("data-tgb")}).run();
				this.removeAttribute("data-tgb");
			};

		});
	};

	AD.floatScroll.prototype.hide = function(){
		this._show = false;

		this.config.preLoadContainers.eq(this._currentIndex-1)
			.hide()
			.removeClass(this.config.containerClassName);
	};

	AD.floatScroll.prototype.scrollEvent = function () {

		var footerScroll =            this.config.footer.offset().top - 150,
			lastDOMItemScroll =       this.config.offsetTopContainer.offset().top,
			maxAllScroll =            footerScroll - lastDOMItemScroll,
			currentScroll =           this.windowScrollTop() - lastDOMItemScroll,
			_maxCountToView =         Math.floor(maxAllScroll / this.config.maxHeight),
			maxCountToView =          _maxCountToView > this.config.preLoadContainersLength ? this.config.preLoadContainersLength : _maxCountToView,
			heightScrollToView =      maxAllScroll / maxCountToView;

		var show_rule = this.windowScrollTop() > lastDOMItemScroll;
		var hide_rule = show_rule && (this.config.maxHeight + this.windowScrollTop()) > footerScroll;

		if(show_rule && !hide_rule){

			var _state = 0;
			for(var i=0; i<maxCountToView; i++){
				if(currentScroll > i*heightScrollToView && currentScroll < heightScrollToView*(i+1)-1){
					_state = i;
				};
			};

			if(this.getState(_state)) {
				this.next();
			};

			if (!this._show) {
				this.show();
			};
		}	else {
			if (this._show) {
				this.hide();
				this.getState(-1);
			};
		};

	};

	AD.floatScroll.prototype.load = function(options){
		$.extend(this.getConfig(options), options);

		if ($(win).height() < 300 ||
			!this.config.preLoadContainers.length ||
			!$('.footer').length )
			return;

		for(var i=0; i<this.config.preLoadContainers.length; i++){
			if(this.config.preLoadContainers[i].innerHTML.trim() == ""){
				this.config.preLoadContainers.splice(i, 1);
				i--;
			};
		};

		this.config.preLoadContainersLength = this.config.preLoadContainers.length;

		$(win).bind('scroll resize', win.BBAPI.utils.closure(this, this.scrollEvent) );
	};


	AD.floatScrollPush = function() {

		this._show = false;
		this._currentIndex = 0;
		this._state = -1;

		this._offsetTop = 70;
		//this._startPosition = [];


		this.windowScrollTop = function(){
			return win.pageYOffset || document.documentElement.scrollTop;
		};

		this.getState = function(new_state){
			return new_state != this._state ? (this._state = new_state, true) : false;
		};

		this.changeState = function(new_state){
			return new_state != this._state ? (this._state = new_state, true) : false;
		};

		this.getOffsetHeight = function(elements, i){
			return i == 0 ? elements[i].offsetHeight :
				i > 0 ? elements[i].offsetHeight + this.getOffsetHeight(elements, i-1) :
					0;
		};
	};

	AD.floatScrollPush.prototype.getConfig = function(options){
		return this.config = {
			containerClassName: "ad_promo_float_block",
			preLoadContainers: [],
			contentContainer: BBAPI.dom().id("content_container") || BBAPI.dom().body(),

			footer: $(options.footerSelector || ".footer"),

			maxHeight: Math.max.apply(null, options.preLoadContainers.map(function (){
				return $(this).height();
			}).get()),

			preLoadContainersLength: options.preLoadContainers.length

		};
	};


	AD.floatScrollPush.prototype.absolute = function(index, offset){
		this._absolute = true;

		var backOffsetTop = index ? 30 : 0, offsetReply = offset || 0;

		var scrollTop = this.windowScrollTop();

		/*
		if(index){
			for(var i=this._currentIndex- 1, j=0; i>0; i--, j++){
				BBAPI.css.style(this.config.preLoadContainers[i], {
					"display": "block",
					"position": "absolute",
					"top": scrollTop + backOffsetTop - this.getOffsetHeight(this.config.preLoadContainers, j) + "px"
				});
			};
		};
		*/


		if(index && this.config.preLoadContainers[this._currentIndex-1]){
			BBAPI.css.style(this.config.preLoadContainers[this._currentIndex-1], {
				"display": "block",
				"position": "absolute",
				"top": scrollTop + backOffsetTop - this.getOffsetHeight(this.config.preLoadContainers, 0) + "px"
			});
		};


		var copy = this.config.preLoadContainers.slice();
		var containers = copy.splice(this._currentIndex, this._currentIndex+3);

		for(var i=0; i<containers.length; i++){
			BBAPI.css.style(containers[i], {
				"display": "block",
				"position": "absolute",
				"top": scrollTop + backOffsetTop + this.getOffsetHeight(containers, i-1) - (offsetReply*(i+1)) + "px"
			});
		};

		if(!index){
			for(var i=0; i<copy.length; i++){
				BBAPI.css.style(copy[i], {
					"top": parseInt(copy[i].style.top) - (offsetReply*(i+1)) + "px"
				});
				//BBAPI.css.hideV(copy[i]);
			};
		};


		if(index){
			for(var i=this._currentIndex+2; i<this.config.preLoadContainers.length; i++){
				this.config.preLoadContainers[i] && BBAPI.css.hide(this.config.preLoadContainers[i]);
			};
		};
	};


	AD.floatScrollPush.prototype.fixed = function(){
		this._absolute = false;

		var copy = this.config.preLoadContainers.slice();
		var containers = copy.splice(this._currentIndex, this._currentIndex+3);

		for(var i=0; i<containers.length; i++){
			BBAPI.css.style(containers[i], {
				"position": "fixed",
				"top": this._offsetTop + this.getOffsetHeight(containers, i-1) + "px"
			});
		};

		/*
		for(var i=0; i<copy.length; i++){
			BBAPI.css.hide(copy[i]);
		};
		*/

		for(var i=this._currentIndex+2; i<this.config.preLoadContainers.length; i++){
			this.config.preLoadContainers[i] && BBAPI.css.hide(this.config.preLoadContainers[i]);
		};
	};


	AD.floatScrollPush.prototype.inherit = function(){
		BBAPI.css.style(this.config.preLoadContainers[this._currentIndex], {"position": "inherit", "display": "block"});
		BBAPI.css.style(this.config.preLoadContainers[this._currentIndex+1], {"position": "inherit", "display": "block"});

		for(var i=this._currentIndex+2; i<this.config.preLoadContainers.length; i++){
			this.config.preLoadContainers[i] && BBAPI.css.hide(this.config.preLoadContainers[i]);
		};
	};


	AD.floatScrollPush.prototype.scrollEvent = function () {

		var scrollViewAllHeight = this.config.contentContainer.clientHeight;
		var _maxCountToView =         Math.floor(scrollViewAllHeight / this.config.maxHeight);
		var maxCountToView =          _maxCountToView > this.config.preLoadContainersLength ? this.config.preLoadContainersLength : _maxCountToView;
		var scrollViewABlockHeight = scrollViewAllHeight / maxCountToView;

		var windowScrollTop = this.windowScrollTop();

		if(windowScrollTop > this._offsetTop){
			var _state = 0;
			for(var i=0; i<maxCountToView; i++){
				if(windowScrollTop > i*scrollViewABlockHeight && windowScrollTop < scrollViewABlockHeight*(i+1)-1){
					_state = i;
				};
			};

			//this._startPosition.length < 2 && this._startPosition.push(windowScrollTop);

			if(this.changeState(_state)){

				if(this._currentIndex == _state){
					this.fixed();
				} else if(this._currentIndex > _state){
					while(this._currentIndex != _state){
						this._currentIndex--;
						this.absolute();
					};
				} else {
					var _offset = 0;
					while(this._currentIndex != _state){
						this.absolute(false, _offset);
						this._currentIndex++;

						_offset+=this.config.maxHeight;
					};
				};

				//_state > 0 ? this.absolute() : this.fixed();

				/*
				if(this._startPosition[1] > this.config.maxHeight){

					var scrollTop = windowScrollTop;

					for(var i=this._currentIndex; i>0; i--){
						console.log("1111", this.getOffsetHeight(this.config.preLoadContainers, i), i);
						BBAPI.css.style(this.config.preLoadContainers[i], {"top": scrollTop - this.getOffsetHeight(this.config.preLoadContainers, i) + "px"});
					};

					this._startPosition[1] = 0;
				};
				*/


			};

			if(this._absolute && windowScrollTop + this._offsetTop >= BBAPI.utils.coordinates(this.config.preLoadContainers[this._currentIndex]).top){
				this.fixed();
			};

			if(
				!this._absolute &&
				this.config.preLoadContainers[this._currentIndex-1] &&
				BBAPI.utils.coordinates(this.config.preLoadContainers[this._currentIndex-1]).top + this.config.preLoadContainers[this._currentIndex-1].offsetHeight > windowScrollTop + this._offsetTop){
					this.absolute(1);
			};


			if(this.config.preLoadContainers.length-1 == this._currentIndex){
				if(windowScrollTop + this.config.preLoadContainers[this._currentIndex].offsetHeight > scrollViewAllHeight){

					this._absolute_last = true;

					BBAPI.css.style(this.config.preLoadContainers[this._currentIndex], {
						"position": "absolute",
						"top": scrollViewAllHeight + 20 - this.config.preLoadContainers[this._currentIndex].offsetHeight + "px"
					});
				} else {
					if(this._absolute_last) {
						this.fixed();
						this._absolute_last = false;
					};
				};

			} else {
				this._absolute_last = false;
			};

		} else {
			this._state = -1;
			this._currentIndex = 0;
			this.inherit();
		};

	};

	AD.floatScrollPush.prototype.load = function(options){
		$.extend(this.getConfig(options), options);

		if ($(win).height() < 300 || !this.config.preLoadContainers.length)
			return;

		if(this.config.preLoadContainers.length >= 2){
			for(var i=0; i<this.config.preLoadContainers.length; i++){
				BBAPI.css.style(this.config.preLoadContainers[i], {"height": this.config.maxHeight + "px"});
			};

			this.inherit();
		};

		//this._startPosition.push(this.windowScrollTop());

		win.BBAPI.event.addEvent(window, "scroll", win.BBAPI.utils.closure(this, this.scrollEvent));
	};


	/* TGB */
	AD.TGB = function(options){
		this.config = {
			//url: "/adlink" + (options && options.community ? ("?community=" + options.community) : ""),
			host: "http://ad." + (BBAPI.utils.isDebug() ? document.location.host.replace("www.", "") : "babyblog.ru"),

			promoTests: {
				answerUrl: "/adlink/answerTest",

				animateOffset: 213,
				animateSpeed: 300
			}
		};

		this.viewLinksArray = [];

		this.init(options);
	};

	AD.TGB.prototype.init = function(options){
		BBAPI.utils.extend(this.config, options);

		this.ajax();
	};

	AD.TGB.prototype.ajax = function(){
		var self = this;

		BBAPI.ajax().url(this.config.host + "/adlink" + (typeof(this.config.tgbParam) != 'undefined' ? '?tgbParam='+this.config.tgbParam : '')).done(function(json){

			self.is_logged = !!json["return"].is_registered;

			if(json.result.toString().match(/^20\d$/)){
				// проход по "блокам"
				for(var i in json["return"]){
					switch (json["return"][i].type) {
						case "0":
							self.createPromoLenta(json["return"][i]);
							break;
						case "1":
							self.createPromoPost(json["return"][i]);
							break;
						case "2":
							self.createActivity(json["return"][i]);
							break;
						case "3":
							self.createPromoAttention(json["return"][i]);
							break;
						case "4":
							self.createPromoComments(json["return"][i]);
							break;
						case "5":
							//self.createPromoSignUp(json["return"][i]);
							self.createPromoAttentionMini(json["return"][i]);
							break;
						case "6":
                            self.createPromoTests(json["return"][i]);
							//self.createPromoCommunityTopPosts(json["return"][i]);
							break;
						case "7":
							self.createBannersMini(json["return"][i]);
							break;
						case "8":
							self.createBannersSlider(json["return"][i]);
							break;
                    };
				};


				BBAPI.ad.rcis({
					container: BBAPI.dom().id("bbLink"),
					footer_container: BBAPI.dom().id("js__footer-container"),
					header_container: BBAPI.dom().id("js__header-links")
				});

				// проброс до view?id
				setTimeout(BBAPI.utils.closure(self, self.createView), 1000);

			} else {
				// какие либо ошибки
			};
		}).jsonp();

	};

	AD.TGB.prototype.createPixel = function(url){
        if(typeof(url) == 'string' && url.indexOf('%random%') !== -1) {
            url = url.replace('%random%',(new Date()).getTime().toString() + Math.random());
        }
		if(url){
			var dom = BBAPI.dom();
			dom.append(dom.body(),
				BBAPI.css.hide(
					dom.addEvent(dom("img", "", {src: url, height: "0", width: "0"}), "load", function(){
						this.parentNode.removeChild(this);
					})
				)
			);
		};
	};

	AD.TGB.prototype.createView = function(){
		if(this.viewLinksArray.length > 0){
			BBAPI.ajax().url(this.config.host + "/adlink/view?id=" + this.viewLinksArray.join(",")).done(function(json){ }).jsonp();
		};
	};

	AD.TGB.prototype.hide = function(element){
		BBAPI.css.hide(element);
	};

	AD.TGB.prototype.show = function(element){
		BBAPI.css.show(element);
	};

	AD.TGB.prototype.createPromoLenta = function(block){
		var dom = BBAPI.dom(), self = this;

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(data){
				// ссылки в категориях
				var lies = [];
				for(var i in data.links){
					lies.push(dom.append(dom("li"), [
						dom.append(dom("a", "js__Metric", {href: self.config.host + data.links[i].link, target: data.links[i].target, "data-type": "LinksLenta"}), dom.text(data.links[i].title))
					]));

					// проброс до "пикселя"
					self.createPixel(data.links[i].pixel);

					// проброс до view?id
					self.viewLinksArray.push(data.links[i].id);
				};

				// сама категория
				return dom.append(dom("div", "pb-block rel"), [
					// title категории
					dom.append(dom("h4"), dom.text(data.title)),

					// ссылки (li)
					dom.append(dom("ul"), lies),

					// иконка категории
					dom("i", "pb-icon " + (data.icon || ""))
				]);
			};

			var entries = [];
			for(var i in block.categories){
				entries.push(createList(block.categories[i]));
			};

			var html = dom.append(dom("div", "comments-promo comments-promo-blog rel mb3"), [
				dom.append(dom("div", "clearfix _13"), entries)
			]);

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createPromoPost = function(block){
		var dom = BBAPI.dom();

		var container = dom.id(block.container_id);
		if(container){

			var html = [];
			for(var i in block.categories){
				for(var j in block.categories[i].links){
					html.push(
						dom.append(dom("div", "blog-entry clearfix"), [
							dom.append(dom("div", "blog-title rel clear"), [
								dom.append(dom("a", "", {href: this.config.host + block.categories[i].links[j].link}), dom.text(block.categories[i].links[j].title)),
								dom.append(dom("div", "blog-trackers abs"), [
									dom.append(dom("div", "blog-promo rel fr css-corner-3 _10 _up _lh14"), [
										dom.text("промо"),
										dom("i", "icon icon-promo abs i_18 db")
									])
								])
							]),

							dom.append(dom("div", "clear post-data hide rel oh _nw"), [
								dom.append(dom("b", "blog-created rel"), dom.text(block.categories[i].links[j].data.post_date || "")),

								dom.append(dom("a", "blog-label rel _12 _lgr", {href: this.config.host + block.categories[i].links[j].link}), [
									dom.html(dom("b", "bull"), "&nbsp;&nbsp;•&nbsp;&nbsp;"),
									dom.text(block.categories[i].links[j].data.post_category || "")
								]),

								dom("i")
							]),

							dom.html(dom("div", "blog-text user-used clear"), block.categories[i].links[j].data.post_body || "")
						])
					);

					// проброс до "пикселя"
					this.createPixel(block.categories[i].links[j].pixel);

					// проброс до view?id
					this.viewLinksArray.push(block.categories[i].links[j].id);
				};
			};


			this.hide(container);
			dom.append(container, html);
			this.show(container);
		};
	};

	AD.TGB.prototype.createPromoTests = function(block){
		var dom = BBAPI.dom(), self = this, controls = {};

		var createResult = function(data){
			return dom.append(dom("div", "interview mb2"), [
				dom.append(dom("b", "interview-title _12 _up db mb1"), dom.text(block.title)),
                ( this.image ? dom.append(dom("p"),
					dom.append(dom("a", "", {href: this.link, target: this.target}), dom("img", "", {src: this.image}))
				) : dom.text('')),
				dom.append(dom("b", "_16 _up _bd _narrow db mb1 _231"), dom.text(this.title)),

				dom.append(dom("div", "interview-result x21 oh mb1 clearfix"), [
                    dom.text(''),

                    ( data.results[data.user_result].title ? dom.append(dom("div", "_georgia _18 _it _lh24 _227"), dom.text(data.results[data.user_result].title)) : dom.text('')),
                    ( data.results[data.user_result].result ? dom.append(dom("p", "_231 _14 _lh18 mb3 mt1"), dom.text(data.results[data.user_result].result)) : dom.text('')),

                    ( data.additionalTexts.result_title ? dom.append(dom("div", "_16 _up _bd _narrow mb1 _231"), dom.text(data.additionalTexts.result_title)) : dom.text('')),

					controls[this.id].result_link = dom.append(dom("a", "", {href: self.config.host + data.result_link + (data.additionalTexts.share_to_lenta && self.is_logged ? "&sp=1" : ""), target: (self.is_logged ? "_blank" : "_self")}),
						dom.append(dom("button", "btn _b _b_s _b_btn _13 noi sgn css-corner-3 mt1 ml0 x20"), dom.text(data.additionalTexts.result_button))
					),

					dom.append(dom("div", "js-pseudo-checkbox form-checkbox form-checkbox fl _14 _lh18 _231"), (data.additionalTexts.share_to_lenta && self.is_logged ? [
						dom("input", "", {type: "checkbox", value:"0", "name": "bb-r-input-name", id: "bb-r-input-id-" + block.id, "checked": "checked"}),
						dom.append(dom("label", "", {"for": "bb-r-input-id-" + block.id}), dom.text(data.additionalTexts.share_to_lenta))
					] : []))
				])
			]);
		};

        var createStat = function(data){
            var statHtml = [];
            for(var i in data.questions[0].answers) {
                if(typeof(data.stat.answersPercent[0][i]) == "undefined"){ data.stat.answersPercent[0][i] = 0; }

                statHtml.push(dom.append(dom("div","interview-result-i mb1 rel _14 _222 _lh15" + (data.user_answers[0] == i ? ' win' : '')),[
                    dom.append(dom("span","fr abs _222"),dom.text(data.stat.answersPercent[0][i]+'%')),
                    dom.text(data.questions[0].answers[i].answer),
                    dom.append(dom("div","interview-result-il abs"), (function(){var elm = dom("div","interview-result-il-w"); elm.style.width = data.stat.answersPercent[0][i]+'%'; return elm;})())
                ]));
            }
            statHtml.push(dom.append(dom("div","_14 _636 _ar"),dom.text("Всего "+data.stat.count)));

            return dom.append(dom("div", "interview mb2"), [
                dom.append(dom("b", "interview-title _12 _up db mb1"), dom.text(block.title)),
                ( this.image ? dom.append(dom("p"),
                    dom.append(dom("a", "", {href: this.link, target: this.target}), dom("img", "", {src: this.image}))
                ) : dom.text('')),
                dom.append(dom("b", "_16 _up _bd _narrow db mb1 _231"), dom.text(this.title)),
                dom.append(dom("div","interview-result x21 oh mb1 clearfix"),statHtml)
            ]);
        };

		var createQuestions = function(questions){
			var html = [], test = this;

			var createAnswers = function(answers, question_index){
				var html = [], name = "bb-q-input-name-" + Math.round(Math.random() * 10000);

				for(var a in answers){
					var r = Math.round(Math.random() * 10000), input;

					html.push(
						dom.append(dom("div", "js-pseudo-radio form-radio"), [
							input = dom("input", "", {type: "radio", id: "bb-q-input-" + a + "-" + r, value: a, "name": name, "data-q-index": question_index}),
							dom.append(dom("label", "", {"for": "bb-q-input-" + a + "-" + r}), dom.text(answers[a].answer))
						])
					);

					// блокирование radiobutton, если на этот вопрос уже отвечали
					if(test.data.user_answers && test.data.user_answers[question_index]){

						if(a == test.data.user_answers[question_index]){
							input.setAttribute("checked", "checked");
						};

						input.setAttribute("disabled", "disabled");
					};
				};


				var submit_button = dom.append(dom("button", "btn _b _b_s _b_btn _13 noi sgn css-corner-3 mt1 ml0"), dom.text(test.data.additionalTexts.answer_button));

				// блокирование сабмита вопроса, если на него уже есть ответ
				if(test.data.user_answers && test.data.user_answers[question_index]){
					BBAPI.css.addClass(submit_button, "disabled").setAttribute("loading", "1");
				};

				html.push(
					dom.addEvent(
						submit_button, "click", function(){
							if(controls[test.id].q && controls[test.id].q[question_index] && controls[test.id].q[question_index].current_value && !this.getAttribute("loading")){
								var data = {t: test.id};
								data["a[" + question_index + "]"] = controls[test.id].q[question_index].current_value;

								controls[test.id].q[question_index].current_value = false;

								// disabled кнопку "Ответить"
								BBAPI.css.addClass(this, "disabled").setAttribute("loading", "1");

								// disabled inputs после нажатия на "ответить"
								(typeof jQuery != "undefined") && !!jQuery.fn.iCheck && jQuery(this.parentNode).iCheck("disable");

								navigate.next(test);

                                var queryParams = '';
                                for(var i in data) {
                                    if(data.hasOwnProperty(i)){
                                        queryParams += (queryParams.length ? '&' : '?') + i + '=' + data[i];
                                    }
                                }

								BBAPI.ajax().url(self.config.host + self.config.promoTests.answerUrl + queryParams).done(BBAPI.utils.closure(this, function(result){
									//BBAPI.css.removeClass(this, "disabled");
									//this.removeAttribute("loading");

									//var result = JSON.parse(xhr.body());

									// есть ответы на все вопросы
									if(result["return"].user_result){
										controls[test.id].data.user_result = result["return"].user_result;
										controls[test.id].html.parentNode.removeChild(controls[test.id].html);

										makeResult(test);
									};

								})).jsonp();
							};
						}
					)
				);

				return html;
			};


			for(var q in questions){
				html.push(
					dom.append(dom("li", "x21"), [
						dom.append(dom("span", "_georgia _18 _it _lh24 _227"), dom.text(questions[q].question)),
						dom.append(dom("div", "mt1 _14 _222"),
							createAnswers(questions[q].answers, q)
						)
					])
				);
			};

			return html;
		};


		var navigate = {
			next: function(test){
				if(!controls[test.id].animate && controls[test.id].current_index < BBAPI.utils.length(test.data.questions)){
					var from = parseInt(controls[test.id].questionsListContainer.style.left), to = self.config.promoTests.animateOffset;

					controls[test.id].animate = true;
					BBAPI.animate(function(progress){
						BBAPI.css.style(controls[test.id].questionsListContainer, {left: (from || 0) - (to*progress) + "px"});
					}, self.config.promoTests.animateSpeed, function(){
						controls[test.id].animate = false;
					});

					//BBAPI.css.style(controls[test.id].questionsListContainer, {left: -(controls[test.id].current_index * self.config.promoTests.animateOffset) + "px"});

					controls[test.id].current_index++;

					controls[test.id].arrowCount.innerHTML = controls[test.id].current_index;
				};
			},

			prev: function(test){
				if(!controls[test.id].animate && controls[test.id].current_index > 1){
					controls[test.id].current_index--;

					//BBAPI.css.style(controls[test.id].questionsListContainer, {left: -((controls[test.id].current_index-1) * self.config.promoTests.animateOffset) + "px"});

					var from = parseInt(controls[test.id].questionsListContainer.style.left), to = -self.config.promoTests.animateOffset;

					controls[test.id].animate = true;
					BBAPI.animate(function(progress){
						BBAPI.css.style(controls[test.id].questionsListContainer, {left: from - (to*progress) + "px"});
					}, self.config.promoTests.animateSpeed, function(){
						controls[test.id].animate = false;
					});

					controls[test.id].arrowCount.innerHTML = controls[test.id].current_index;
				};
			}
		};


		// создать результаты
		var makeResult = function(test){
			var result_html = createResult.call(test, controls[test.id].data);

			self.hide(result_html);

			// атач html результатов
			dom.append(container, result_html);

			self.show(result_html);

			// custom checkbox
			dom.checkbox(result_html).on('ifToggled', function(event){
				controls[test.id].result_link.setAttribute("target", this.checked ? "_blank": "_self");
				controls[test.id].result_link.setAttribute("href", this.checked ? controls[test.id].data.result_link + "&sp=1" : controls[test.id].data.result_link);
			});
		};

        //показать статистику
        var makeStat = function(test){
            var result_html = createStat.call(test, controls[test.id].data);
            self.hide(result_html);
            // атач html результатов
            dom.append(container, result_html);
            self.show(result_html);

        };

		// создать вопросы
		var makeTests = function(test){
			self.hide(controls[test.id].html);

			// аттач вопросов
			dom.append(container, controls[test.id].html);

			self.show(controls[test.id].html);

			// custom radioButtons
			dom.radio(controls[test.id].html).on('ifChecked', function(event){
				var q_index = this.getAttribute("data-q-index");

				controls[test.id].q = controls[test.id].q || {};
				controls[test.id].q[q_index] = controls[test.id].q[q_index] || {};

				controls[test.id].q[q_index].current_value = this.value;
			});
		};


		var container = dom.id(block.container_id);
		if(container){

			for(var category in block.categories){
				for(var entry in block.categories[category].links){
					var test = block.categories[category].links[entry];

					// проброс для fixedPromo данных о id links
					container.setAttribute("data-tgb", test.id);

					controls[test.id] = {current_index: 1, data: test.data, self: test};
					controls[test.id].html = dom.append(dom("div", "interview mb2"), [
						dom.append(dom("b", "interview-title _12 _up db mb1"), dom.text(block.title)),
                        (test.image ? dom.append(dom("p"), dom("img", "", {src: test.image})) : dom('p')),
						dom.append(dom("b", "_16 _up _bd _narrow db mb1 _231"), dom.text(test.title)),

						dom.append(dom("div", "interview-quetions x21 oh mb1 clearfix"), [
                            (test.data.questions.length > 1 ? dom.append(dom("div", "clearfix mb15"), [
								controls[test.id].arrowLeft = dom.append(dom("a", "sh-2 css-round oh fl rel interview-quetions-prev", {title: "", href: "#"}),
									dom("i", "icon icon-arrow-small-left db i_18 abs")
								),

								dom.append(dom("b", "_14 fl"), [
									dom.text("Вопрос "),
									controls[test.id].arrowCount = dom.append(dom("span"), dom.text("1")),
									dom.text(" из "),
									dom.text(BBAPI.utils.length(test.data.questions))
								]),

								controls[test.id].arrowRight = dom.append(dom("a", "sh-2 css-round oh fl rel interview-quetions-next", {title: "", href: "#"}),
									dom("i", "icon icon-arrow-small-right db i_18 abs")
								)
							]) : dom('p') ),

							dom.append(dom("div", "oh x21 ulfl"), [
								controls[test.id].questionsListContainer = dom.append(dom("ul", "rel"),
									createQuestions.call(test, test.data.questions)
								)
							])
						])
					]);

                    if(test.data.questions.length > 1) {
                        BBAPI.event.addEvent(controls[test.id].arrowLeft, "click", (function(test){ return function(event){
                            BBAPI.event.stopEvent(event);

                            navigate.prev(test);
                        }})(test));

                        BBAPI.event.addEvent(controls[test.id].arrowRight, "click", (function(test){ return function(event){
                            BBAPI.event.stopEvent(event);

                            navigate.next(test);
                        }})(test));
                    }

                    if(controls[test.id].data.stat) {
                        // если вопрос один и есть ответ
                        makeStat(test);
                    }
					else if(controls[test.id].data.user_result){
						// если есть ответы на все вопросы
						makeResult(test);
					}else{
						// атач всего опроса
						makeTests(test);
					};

					// проброс до "пикселя"
					this.createPixel(test.pixel);

					// проброс до view?id
					this.viewLinksArray.push(test.id);
				};
			};

		};

	};

	AD.TGB.prototype.createPromoAttention = function(block){
		var dom = BBAPI.dom(), self = this;

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(category){

				var entries = [], links_ids = [];
				for(var j in category.links){
					entries.push(
						dom.append(dom("tr", "see-also-tr"), [
							dom.append(dom("td"), [
								dom("img", "", {width: 50, height: 50, src: category.links[j].image})
							]),
							dom.append(dom("td"), [
								dom.append(dom("a", "_link _it _16 _georgia", {href: self.config.host + category.links[j].link}), dom.text(category.links[j].title))
							])
						]),

						dom.append(dom("tr", "see-also-tr-desc"), [
							dom.append(dom("td", "_14 _181 _lh18", {colspan: "2"}), [
								dom.append(dom("div"), dom.text(category.links[j].description))
							])
						])
					);

					links_ids.push(category.links[j].id);

					// проброс до "пикселя"
					self.createPixel(category.links[j].pixel);

					// проброс до view?id
					self.viewLinksArray.push(category.links[j].id);
				};

				// проброс для fixedPromo данных о id links
				container.setAttribute("data-tgb", links_ids.join(","));

				return entries;
			};


			var html = dom("div", "interview mb2");
			for(var i in block.categories){
				dom.append(html, [
					dom.append(dom("b", "interview-title _12 _up db"), dom.text(block.categories[i].title)),
					dom.append(dom("table", "see-also-table"), [
						dom.append(dom("tbody"),
							createList(block.categories[i])
						)
					])
				]);
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createPromoComments = function(block){
		var dom = BBAPI.dom();

		var container = dom.id(block.container_id);
		if(container){

			var entries = [];
			for(var i in block.categories){
				for(var l in block.categories[i].links){
					var entry = dom("div", "pb-block rel");
					entry.innerHTML = block.categories[i].links[l].description;

					entries.push(
						dom.append(entry, [
							dom("i", "pb-icon " + (block.categories[i].icon || ""))
						])
					);

					// проброс до "пикселя"
					this.createPixel(block.categories[i].links[l].pixel);

					// проброс до view?id
					this.viewLinksArray.push(block.categories[i].links[l].id);
				};
			};

			var html = dom.append(dom("div", "comments-promo comments-promo-blog rel clearfix mb3"), [
				dom.append(dom("div", "clearfix _13"), entries)
			]);

			/* add some attr to all <a> in block */
			var html_links = Array.prototype.slice.call(BBAPI.dom(html).lookup("a"));
			for(var j=0; j<html_links.length; j++){
				BBAPI.css.addClass(html_links[j], "js__Metric");
				html_links[j].setAttribute("data-type", "LinksComments");
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createBannersMini = function (block) {
		var dom = BBAPI.dom();
		var container = dom.id(block.container_id);
		if (container) {
			var entries = [];
			for (var i in block.categories) {
				for (var l in block.categories[i].links) {
					var entry = dom.append(dom("div", "inside-promo-small-item oh dib"), [
						dom.append(dom("a", "db", {"href": this.config.host + block.categories[i].links[l].link, "target": block.categories[i].links[l].target}), [
							dom("img", "", {"src": block.categories[i].links[l].image})
						])
					]);
					entries.push(entry);
					// проброс до "пикселя"
					this.createPixel(block.categories[i].links[l].pixel);
					// проброс до view?id
					this.viewLinksArray.push(block.categories[i].links[l].id);
				};
			};

			var html = dom.append(dom("div", "inside-promo"), [
				dom.append(dom("div", "inside-promo-static dfix"), entries)
			]);

			/* add some attr to all <a> in block */
			var html_links = Array.prototype.slice.call(BBAPI.dom(html).lookup("a"));
			for (var j = 0; j < html_links.length; j++) {
				BBAPI.css.addClass(html_links[j], "js__Metric");
				html_links[j].setAttribute("data-type", "BannerMini");
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createBannersSlider = function (block) {
		var dom = BBAPI.dom();
		var container = dom.id(block.container_id);
		if (container) {
			var entries = [];
			var controls = [];
			for (var i in block.categories) {
				for (var l in block.categories[i].links) {
					var entry = dom.append(dom("div", "inside-promo-item oh dib"), [
						dom.append(dom("a", "db", {"href": this.config.host + block.categories[i].links[l].link, "target": block.categories[i].links[l].target}), [
							dom("img", "", {"src": block.categories[i].links[l].image})
						])
					]);
					entries.push(entry);
					controls.push(dom("div", "inside-promo-control dib css-round animate"));
					// проброс до "пикселя"
					this.createPixel(block.categories[i].links[l].pixel);
					// проброс до view?id
					this.viewLinksArray.push(block.categories[i].links[l].id);
				}
				;
			}
			;
			var rotatorHolder = dom("div", "inside-promo-rotator dfix")
			var entriesHtml = dom.append(rotatorHolder, entries);
			var controlsHtml = dom.append(dom("div", "inside-promo-controls dfix _ac"), controls);
			var html = dom.append(dom("div", "inside-promo promo-rotation"), [entriesHtml, controlsHtml]);

			if (controls.length < 2) {
				this.hide(controlsHtml);
			}
			else {
				BBAPI.css.addClass(controls[0], "active");
				var self = this;
				for (var i in controls) {
					controls[i].setAttribute("data-index", i);
					dom.addEvent(controls[i], "click", function () {
						AD.TGB.prototype.bannerSlide.call(this, rotatorHolder, controls, this.getAttribute("data-index"));
					});
				}
				setInterval(function () {
					if (AD.TGB.prototype.skipNextStep) {
						AD.TGB.prototype.skipNextStep = false;
						return true;
					}
					var nextIndex = AD.TGB.prototype.currentBannerIndex + 1;
					if (nextIndex >= controls.length) {
						nextIndex = 0;
					}
					AD.TGB.prototype.bannerSlide.call(controls[nextIndex], rotatorHolder, controls, nextIndex);
				}, 5000);
			}

			/* add some attr to all <a> in block */
			var html_links = Array.prototype.slice.call(BBAPI.dom(html).lookup("a"));
			for (var j = 0; j < html_links.length; j++) {
				BBAPI.css.addClass(html_links[j], "js__Metric");
				html_links[j].setAttribute("data-type", "BannerSlider");
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.currentBannerIndex = 0;
	AD.TGB.prototype.skipNextStep = false;
	AD.TGB.prototype.bannerSlide = function (rotatorHolder, controls, index) {
		index = parseInt(index);
		for (var k in controls) {
			BBAPI.css.removeClass(controls[k], "active");
		}
		BBAPI.css.addClass(this, "active");
		var stepPx = -640,
			startPx = (rotatorHolder.style.left ? parseInt(rotatorHolder.style.left) : 0),
			stopPx = index * stepPx,
			diffPx = stopPx - startPx;
		BBAPI.animate(function (progress) {
			BBAPI.css.style(rotatorHolder, {'left': ((startPx + parseInt(diffPx * progress))) + "px"});
		}, 300);
		AD.TGB.prototype.currentBannerIndex = index;
		AD.TGB.prototype.skipNextStep = true;
	};

	AD.TGB.prototype.createPromoSignUp = function(block){
		var dom = BBAPI.dom(), self = this;

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(links){

				var createListItems = function(list){
					var items = [];

					for(var i in list){
						items.push(
							dom.append(dom("li"), [
								dom.text(list[i].text),
								dom("i", "icon " + list[i].css_class + " db abs i_18 ifix")
							])
						);
					};

					return items;
				};

				var entries = [];
				for(var j in links){

					// проброс для fixedPromo данных о id links
					container.setAttribute("data-tgb", links[j].id);

					entries.push(
						// title списка - "Начните пользоваться всеми..."
						dom.append(dom("b", "_16 _up _bd _narrow db _227"), dom.text(links[j].title)),

						// список причин для регистрации
						dom.append(dom("ul", "register _14 clear"),
							createListItems(links[j].data.listItems)
						),

						// кнопка "Начать пользоваться"
						dom.append(dom("a", links[j].data.button[0].css_class + " _16 _bd fl mt3 css-corner-3", {href: links[j].link, target: links[j].target}),
							dom.text(links[j].data.button[0].text)
						)
					);

					// проброс до "пикселя"
					self.createPixel(links[j].pixel);

					// проброс до view?id
					self.viewLinksArray.push(links[j].id);
				};

				return entries;
			};


			var html = dom("div", "interview mb2 clearfix");
			for(var i in block.categories){
				dom.append(html, [
					dom.append(dom("b", "interview-title _12 _up db mb1"), dom.text(block.categories[i].title)),
					createList(block.categories[i].links)
				]);
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createActivity = function(block){
		var dom = BBAPI.dom(), self = this;

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(links){
				var entries = [];
				for(var j in links){
					entries.push(
						dom.append(dom("div", "mb02"),
							dom.append(dom("a", "js__Metric _link _13 _lh19", {href: self.config.host + links[j].link, target: links[j].target}),
								dom.text(links[j].title)
							)
						)
					);

					// проброс до "пикселя"
					self.createPixel(links[j].pixel);

					// проброс до view?id
					self.viewLinksArray.push(links[j].id);
				};

				return entries;
			};


			var html = dom("div", "x23 mt2");
			for(var i in block.categories){
				dom.append(html,
					dom.append(dom("div", "pb_promo mb2 mr2 ml2"), [
						dom.append(dom("div", "_13 _up _bd _pnk mb05"), dom.text(block.categories[i].title)),
						createList(block.categories[i].links)
					])
				);
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createPromoAttentionMini = function(block){
		var dom = BBAPI.dom(), self = this;

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(links){
				var entries = [];
				for(var j in links){
					entries.push(
						dom.append(dom("div", "pb_promo mb2 mr2 ml2"), [
							dom.append(dom("div"),
								dom.append(dom("a", "", {href: self.config.host + links[j].link, target: links[j].target, "rel": "nofollow"}),
									dom("img", "", {src: links[j].image})
								)
							),
							dom.append(dom("div", "mb2"),
								dom.append(dom("a", "_b_b _b_s _b_blk _blk _lh24", {href: self.config.host + links[j].link, target: links[j].target, "rel": "nofollow"}),
									dom.text(links[j].title)
								)
							)
						])
					);

					// проброс до "пикселя"
					self.createPixel(links[j].pixel);

					// проброс до view?id
					self.viewLinksArray.push(links[j].id);
				};

				return entries;
			};


			var html = dom("div", "x23 mt2");
			for(var i in block.categories){
				dom.append(html,
					createList(block.categories[i].links)
				);
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	AD.TGB.prototype.createPromoCommunityTopPosts = function(block){
		var dom = BBAPI.dom(), self = this, controls = {};

		var container = dom.id(block.container_id);
		if(container){

			var createList = function(links){

				var entries = [];
				for(var j in links){
					dom.html(controls.links_title, links[j].title);

					// проброс для fixedPromo данных о id links
					container.setAttribute("data-tgb", links[j].id);

					for(var d in links[j].data){
						var entry = links[j].data[d];
						entries.push(
							dom.append(dom("li"), [
								dom.append(dom("a", "_14 _link _georgia _it", {href: entry.url}), dom.text(entry.title)),
								dom.append(dom("div"), [
									dom.append(dom("a", "_dgr", {href: entry.user_url}), dom.text(entry.fio)),
									dom.append(dom("b", "rel ml3"), [
										dom.text(entry.comments_count),
										dom("i", "icon icon-comments-count db abs i_18 ifix")
									])
								])
							])
						)
					};

					// проброс до "пикселя"
					self.createPixel(links[j].pixel);

					// проброс до view?id
					self.viewLinksArray.push(links[j].id);
				};

				return entries;
			};


			var html = dom("div", "interview b_green mb2");
			for(var i in block.categories){
				dom.append(html, [
					dom.append(dom("b", "interview-title _12 _up db mb1"), dom.text(block.categories[i].title)),
					controls.links_title = dom("b", "16 _up _bd _narrow db _231"),
					dom.append(dom("ul", "interview-links _13"),
						createList(block.categories[i].links)
					)
				]);
			};

			this.hide(html);
			dom.append(container, html);
			this.show(html);
		};
	};

	/* RCIS */
	AD.RCIS = function(options){
		var dom = win.BBAPI.dom();

		this.config = {
			container: dom.id("bbLink"),
			footer_container: dom.id("js__footer-container"),
			header_container: dom.id("js__header-links"),
			transparent_container: dom.id("js__transparent-separator"),
			attention_container: dom.id("js__attention-container")
		};

		this.all_offset =
			(this.config.header_container ? this.config.header_container.offsetHeight : 0) +
			(this.config.transparent_container ? this.config.transparent_container.offsetHeight : 0) +
			(this.config.attention_container ? this.config.attention_container.offsetHeight + 30 : 0);

		this.direction_state = win.BBAPI.utils.scrollTop();

		this.cached_coordinate = 0;
		this.cached_footer_coordinate = 0;
		this.is_absolute = null;

		this.fixed_in_bottom = 0;

		this.scroll_count = 0;

		this.delta = 25;

		this.scroll_top_last = null;

		this.getViewportSize = function(doc) {
			doc = doc || document;
			var elem  = doc.compatMode == 'CSS1Compat' ? doc.documentElement : doc.body;
			var scrollTop = win.pageYOffset || (doc.documentElement && doc.documentElement.scrollTop) || (doc.body && doc.body.scrollTop);
			var scrollLeft = win.pageXOffset || (doc.documentElement && doc.documentElement.scrollLeft) || (doc.body && doc.body.scrollLeft);
			return {top: elem.clientHeight + scrollTop, left: elem.clientWidth + scrollLeft, clientHeight: elem.clientHeight, clientWidth: elem.clientWidth};
		};

		this.setMainContainerHeight = BBAPI.utils.closure(this, function(){
			var container = $(".container");

			if(container.height() < this.config.container.offsetHeight){
				container.css("minHeight", this.config.container.offsetHeight + 50);
			}
		});

		this.has3d = (function(){
			var el = dom('p'),
				has3d,
				transforms = {
					'webkitTransform':'-webkit-transform',
					'OTransform':'-o-transform',
					'msTransform':'-ms-transform',
					'MozTransform':'-moz-transform',
					'transform':'transform'
				};

			// Add it to the body to get the computed style
			dom.body().insertBefore(el, null);

			for(var t in transforms){
				if( el.style[t] !== undefined ){
					el.style[t] = 'translate3d(1px,1px,1px)';
					has3d = win.getComputedStyle(el).getPropertyValue(transforms[t]);
				}
			}

			dom.body().removeChild(el);

			return (has3d !== undefined && has3d.length > 0 && has3d !== "none");
		})();

		this.init(options);
	};

	AD.RCIS.prototype.init = function(options){
		BBAPI.utils.extend(this.config, options);

		BBAPI.event.addEvent(window, "scroll", BBAPI.utils.closure(this, this.scrollEvent));

		this.setMainContainerHeight();

		//this.scrollEvent();

		var i_cb = BBAPI.utils.closure(this, function(){
			/*
			if(this.is_absolute)
				this.is_absolute = false;
			*/

			if(this.scroll_count < 5){
				this.scrollEvent();
			}

			this.setMainContainerHeight();
		});
		var i_id = setInterval(i_cb, 200);

		setTimeout(BBAPI.utils.closure(this, function(){
			this.cached_footer_coordinate = BBAPI.utils.coordinates(this.config.footer_container).top;

			//this.scrollEvent();

			clearInterval(i_id);

			this.setMainContainerHeight();
		}), 3000);
	};

	AD.RCIS.prototype.direction = function(scrollTop){
		if(this.direction_state - scrollTop < 0){
			// down
			this.direction_state = scrollTop;
			return 1;
		} else {
			// up
			this.direction_state = scrollTop;
			return 0;
		};
	};

	AD.RCIS.prototype.setCssTransform = function(value){
		BBAPI.css.style(this.config.container, {"position": "absolute", "bottom": ""});

		var transform = [
			'-webkit-transform',
			'-o-transform',
			'-ms-transform',
			'-moz-transform',
			'transform'
		];

		// experimental. off by default
		if(false && this.has3d){
			for(var i=0; i<transform.length; i++){
				var o = {};
				o[transform[i]] = "translate3d(0px," + value + "px,0px)";
				BBAPI.css.style(this.config.container, o);
			}
		}else{
			BBAPI.css.style(this.config.container, {
				"top": value + "px"
			});
		};

	};

	AD.RCIS.prototype.setCssFixed = function(style){
		BBAPI.css.style(this.config.container, BBAPI.utils.extend({"position": "fixed"}, style));

		var transform = [
			'-webkit-transform',
			'-o-transform',
			'-ms-transform',
			'-moz-transform',
			'transform'
		];

		if(false && this.has3d){
			for(var i=0; i<transform.length; i++){
				var o = {};
				o[transform[i]] = "";
				BBAPI.css.style(this.config.container, o);
			}
		};

	};

	AD.RCIS.prototype.scrollEvent = function(){
		if(this.scroll_count < 5){
			this.scroll_count++;
		};

		var api = win.BBAPI;

		var coordinate = this.cached_coordinate || api.utils.coordinates(this.config.container).top;
		var footer_coordinate = this.cached_footer_coordinate || api.utils.coordinates(this.config.footer_container).top;

		var scrollTop = api.utils.scrollTop(), viewportSize = this.getViewportSize();
		if(coordinate > scrollTop+50){

			if(this.cached_coordinate){
				api.css.style(this.config.container, {"position": "", "marginTop": "0px", "bottom": ""});

				this.is_absolute = false;
				this.cached_coordinate = 0;
				this.fixed_in_bottom = 0;
			};

		} else {
			if(!this.cached_coordinate){
				this.cached_coordinate = api.utils.coordinates(this.config.container).top;
				this.cached_footer_coordinate = api.utils.coordinates(this.config.footer_container).top;

				this.setCssFixed({"top": "70px", "visibility": "", "marginTop": "0px", "bottom": ""});
			};

			if(!this.is_absolute && viewportSize.clientHeight < this.config.container.offsetHeight + 70){
				var top = api.utils.coordinates(this.config.container).top;

				//var delta = (this.config.container.offsetHeight / (api.dom().body().clientHeight - viewportSize.clientHeight)) * this.delta;

				if(this.direction(scrollTop) == 1){
					// down

					if(top + this.config.container.offsetHeight > viewportSize.top){
						if(!this.fixed_in_bottom){
							var s = (scrollTop-(this.scroll_top_last ? this.scroll_top_last : scrollTop))/2;
//							this.setCssTransform(scrollTop-(scrollTop-top+70-(delta<1?1:delta)) - this.config.header_container.offsetHeight - (this.config.transparent_container ? this.config.transparent_container.offsetHeight : 0));
//							api.css.style(this.config.container, {"position": "absolute", "top": scrollTop-(scrollTop-top+70-(delta<1?1:delta)) - this.config.header_container.offsetHeight + "px", "bottom": ""});

							this.setCssTransform(scrollTop-70-(scrollTop-top-(s)) - this.config.header_container.offsetHeight - (this.config.transparent_container ? this.config.transparent_container.offsetHeight : 0));
						}
					} else {
						this.fixed_in_bottom = 1;
						this.setCssFixed({"bottom": "0px", "top": ""});
					}
				} else {
					// up

					if(top - 70 > viewportSize.top - viewportSize.clientHeight){
						this.setCssFixed({"top": "70px", "visibility": "", "marginTop": "0px", "bottom": ""});
						this.fixed_in_bottom = 0;

					} else {
						if(this.fixed_in_bottom){
							var s = (this.scroll_top_last-scrollTop)/2;
//							api.css.style(this.config.container, {"position": "absolute", "top": ((scrollTop-(delta<1?1:delta)-(scrollTop-top) - this.config.header_container.offsetHeight) - 70) + "px", "bottom": ""});
//							this.setCssTransform((scrollTop-(delta<1?1:delta)-(scrollTop-top) - this.config.header_container.offsetHeight - (this.config.transparent_container ? this.config.transparent_container.offsetHeight : 0)) - 70);

							this.setCssTransform((scrollTop-(s)-(scrollTop-top) - this.config.header_container.offsetHeight - (this.config.transparent_container ? this.config.transparent_container.offsetHeight : 0)) - 70);
						}
					}
				}


			};



			// позиция absolute. если видимая часть меньше высоты контейнера
			var ad_offset = viewportSize.clientHeight < this.config.container.offsetHeight + 70 ? this.config.container.offsetHeight + 70 - viewportSize.clientHeight : 0;
			if(scrollTop + (this.config.attention_container ? this.config.attention_container.offsetHeight + 30 : 0) + this.config.container.offsetHeight+30 - ad_offset > footer_coordinate-95){
				if(!this.is_absolute){
					/*
					var o = 0;
					if(viewportSize.clientHeight < this.config.container.offsetHeight + 70){
						o = this.config.container.offsetHeight + 70 - viewportSize.clientHeight;
					};
					*/

					this.setCssTransform(footer_coordinate - this.all_offset - this.config.container.offsetHeight - 125);

					/*
					api.css.style(this.config.container, {
						"position": "absolute",
						"top": footer_coordinate - this.all_offset - this.config.container.offsetHeight - 125 + "px",
						"bottom": ""
					});
					*/


					this.is_absolute = true;
				};

			} else {
				if(this.is_absolute){

					if(viewportSize.clientHeight < this.config.container.offsetHeight + 70){
						this.setCssFixed({"bottom": "0px", "top": ""});
						this.fixed_in_bottom = 1;
						//api.css.style(this.config.container, {"position": "fixed", "bottom": "0px", "top": ""});
					} else {
						this.setCssFixed({"bottom": "", "top": "70px"});
//						api.css.style(this.config.container, {"position": "fixed", "top": "70px", "bottom": ""});
					};

					this.is_absolute = false;
				};
			};

			this.scroll_top_last = scrollTop;
		};
	};

	AD.RCIS.prototype.update = function(){
		this.cached_coordinate = BBAPI.utils.coordinates(this.config.container).top;
		this.cached_footer_coordinate = BBAPI.utils.coordinates(this.config.footer_container).top;
	};

	/* module BAAPI.ad end */


	/* modue BBAPI.dom */

	var Dom = function (doc) {
		var D = doc || document;

		var appendList = function (element, list, prepend) {
			for(var i = 0; i < list.length; i++) {
				list[i] instanceof Array ?
                    appendList(element, list[i], prepend) :
                    (prepend ?
                        element.insertBefore(list[i], element.firstChild) :
                        element.appendChild(list[i])
                    );
			}
			return element;
		};


		var dom = function (tag_name, css, attributes) {
			var e = D.createElement(tag_name);
			css && (e.setAttribute("class", css), (e.className = css));
			attributes && (function () { for (var i in attributes) { e.setAttribute(i, attributes[i]); } })();
			return e;
		};

		dom.id = function (id) {
			return D.getElementById(id);
		};

		dom.clear = function (element) {
			return (element.innerHTML = "", element);
		};

		dom.text = function (string) {
			return D.createTextNode(string);
		};

		dom.append = function (/* element */) {
			var element = arguments[0], i = 0;
			while(++i < arguments.length) {
				arguments[i] instanceof Array ? appendList(element, arguments[i]) : element.appendChild(arguments[i]);
			}
			return element;
		};

        dom.prepend = function (/* element */) {
            var element = arguments[0], i = 0;
            while(++i < arguments.length) {
                arguments[i] instanceof Array ? appendList(element, arguments[i], true) : element.insertBefore(arguments[i], element.firstChild);
            }
            return element;
        };


        dom.lookup = function (tag_name) {
			return D.getElementsByTagName(tag_name);
		};

		dom.head = function () {
			return this.lookup("head")[0];
		};

		dom.body = function () {
			return this.lookup("body")[0];
		};

		dom.script = function (url) {
			return this("script", "", { src: url, type: "text/javascript" });
		};

		dom.addEvent = function(element, event_name, listener){
			return (win.BBAPI.event.addEvent(element, event_name, listener), element);
		};

		dom.html = function(element, html){
			return html ? (element.innerHTML = html, element) : element.innerHTML;
		};



		/* custom select */
		dom.select = function(after_append_el, options){

			var cached = (BBAPI.dom._cashed_select = BBAPI.dom._cashed_select || {});

			options = options || {};

			var expand_class_name = "expand", controls = {
                options: options,

				selected: {
					current: {},
					prev: {}
				},

				_disabled: false,

				disable: function(){
					BBAPI.css.addClass(controls.container, "disabled");

					this._disabled = true;

                    return this;
				},
				enable: function(){
					BBAPI.css.removeClass(controls.container, "disabled");

					this._disabled = false;

                    return this;
				},

                destroy: function(hard){
                    this.container.parentNode.removeChild(this.container);

                    if(hard){
                        after_append_el.parentNode.removeChild(after_append_el);
                    }
                },

                addOptions: function(options){
                    var ul = _getOptionsContainer();

                    for(var i=0; i<options.length; i++){
                        var li = dom.append(dom.addEvent(dom("li", false, {"data-rel": options[i][0]}), "click", on_change),
                            dom.text(options[i][1])
                        );

                        if(options[i][2]){
                            if(options[i][2].prepend){
                                if(ul.firstChild.getAttribute("data-rel") == ""){
                                    ul.insertBefore(li, ul.firstChild.nextSibling);
                                } else {
                                    dom.prepend(ul, li);
                                }
                            } else {
                                dom.append(ul, li);
                            };

                            if(options[i][2].selected){
                                on_change.call(li, false);
                            };
                        } else {
                            dom.append(ul, li);
                        };
                    };

                    this.tinyscrollbarUpdate();

                    return this;
                },

                removeOptionByValue: function(value){
                    var ul = _getOptionsContainer(),
                        childNodes = ul.childNodes;

                    for(var i=0; i<childNodes.length; i++){
                        if(childNodes[i].getAttribute("data-rel") == value){
                            childNodes[i].parentNode.removeChild(childNodes[i]);

                            if(after_append_el.value == value){
                                if(ul.firstChild){
                                    after_append_el.value = ul.firstChild.getAttribute("data-rel");
                                    controls.text.innerHTML = ul.firstChild.innerHTML;
                                } else {
                                    after_append_el.value = controls.text.innerHTML = "";
                                }
                            };
                        }
                    };

                    this.tinyscrollbarUpdate();

                    return this;
                },

                removeOptionByText: function(text){
                    var ul = _getOptionsContainer(),
                        childNodes = ul.childNodes;

                    for(var i=0; i<childNodes.length; i++){
                        if(childNodes[i].innerHTML == text){
                            var value = childNodes[i].getAttribute("data-rel");

                            childNodes[i].parentNode.removeChild(childNodes[i]);

                            if(after_append_el.value == value){
                                if(ul.firstChild){
                                    after_append_el.value = ul.firstChild.getAttribute("data-rel");
                                    controls.text.innerHTML = ul.firstChild.innerHTML;
                                } else {
                                    after_append_el.value = controls.text.innerHTML = "";
                                }

                            };
                        }
                    };

                    this.tinyscrollbarUpdate();

                    return this;
                },

                removeAllOptions: function(){
                    _getOptionsContainer().innerHTML = "";

                    after_append_el.value = controls.text.innerHTML = "";

                    this.tinyscrollbarUpdate();

                    return this;
                },

                tinyscrollbarUpdate: function(position, opts){
                    _setTinyHeight();
                    $(this.scrollbarY).tinyscrollbar_update(position, opts);

                    return this;
                }
			};

			var wrapper_cb = function() {
				win.BBAPI.css.removeClass(BBAPI.dom._expand_select ? BBAPI.dom._expand_select.controls.container : controls.container, expand_class_name);
				win.BBAPI.event.removeEvent(document, "click", BBAPI.dom._expand_select ? BBAPI.dom._expand_select.wrapper_cb : wrapper_cb);

				win.BBAPI.dom._expand_select = undefined;
			};


			var on_change = function(event){
				controls.selected.prev.text = controls.text.innerHTML;
				controls.selected.prev.value = after_append_el.value;

				controls.selected.current.text = controls.text.innerHTML = this.innerHTML;
				controls.selected.current.value = after_append_el.value = this.getAttribute("data-rel");

				if(!!event && controls.selected.prev.value != controls.selected.current.value){
					if (options.onBlur){
						options.onBlur[controls.selected.prev.value] && options.onBlur[controls.selected.prev.value].call(controls, after_append_el);
					};

					if (options.onFocus) {
						if ( typeof options.onFocus === 'object' ) {
							options.onFocus[controls.selected.current.value] && options.onFocus[controls.selected.current.value].call(controls, after_append_el);
						} else {
							options.onFocus.call(controls, after_append_el);
						};
					};

					options.onChange && options.onChange.call(controls, controls.selected.current.value);
				};
			};

			var _createList = function(){
				var result = [];

				var createFirst = function(){
					result.unshift(dom.append(dom.addEvent(dom("li", false, {"data-rel": ""}), "click", on_change),
						dom.text(options.alt_text || "Выберите...")
					));

					on_change.call(result[0], false);
				};

				if (options.data){
					for(var i = 0; i<options.data.length; i++){
						result.push(dom.append(dom.addEvent(dom("li", false, {"data-rel": options.data[i].value}), "click", on_change),
							dom.text(options.data[i].text)
						));

						if(
							(
								typeof options.selected == "string"
								&& options.selected != ""
								&& options.selected == options.data[i].value
							) || (
								!options.selected &&
								after_append_el.value === options.data[i].value
							)
						){
							controls.selected.current = options.data[i];

							on_change.call(result[i], false);
						};
					};
				};

				if(after_append_el.value == "" || (!isNaN(after_append_el.value) && !BBAPI.utils.isNotNull(controls.selected.current))){
					createFirst();
				};

				if(isNaN(after_append_el.value) && !options.selected){
					options.alt_text = after_append_el.value;

					createFirst();
				};

				return result;
			};

			var select = function(){
				var _select = this.append(controls.container = this("div", "pseudo-form pseudo-select-list js-pseudo-select css-corner-3 clearfix fl"), [

					controls.text = this.append(this("s"), this.text(" ")),
					this("i", "icon i_18 db abs"),

					this.append(this("div", "pseudo-select-list-scrollbar btn-drop sh-10"),
						controls.scrollbarY = this.append(this("div", "scrollbarY"), [
							this.append(this("div", "scrollbar"),
								this.append(this("div", "thumb"))
							),
							this.append(this("div", "viewport"),
								controls.scrollbarYoverview = this.append(this("div", "overview"),
									this.append(this("ul"), _createList())
								)
							)
						])
					)
				]);

				win.BBAPI.css.addClass(_select, after_append_el.className != "" ? after_append_el.className : "wa");

				this.addEvent(controls.container, "click", function(event){
					if(!controls._disabled){
						event = event || win.event;
						event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);

						if(BBAPI.dom._expand_select && BBAPI.dom._expand_select.controls.container != controls.container){
							wrapper_cb();
						};

						if(new RegExp(expand_class_name).test(this.className)){
							wrapper_cb();
						} else {
							win.BBAPI.css.addClass(this, expand_class_name);
							win.BBAPI.event.addEvent(document, "click", wrapper_cb);

							win.BBAPI.dom._expand_select = {controls: controls, wrapper_cb: wrapper_cb};
						};
					};
				});

				return _select;
			};

            var _setTinyHeight = function(){
                options.maxHeight = options.maxHeight || 200;
                var offsetHeight = controls.scrollbarYoverview.offsetHeight,
                    height = offsetHeight > options.maxHeight ? options.maxHeight : offsetHeight;

                BBAPI.css.style(controls.scrollbarYoverview.parentNode, {height : height + "px"});
            };

            var _getOptionsContainer = function(){
                return BBAPI.dom(controls.scrollbarYoverview).lookup("ul")[0];
            };


			if(after_append_el && after_append_el.nodeType == "1"){
				var unique_id = Math.round(Math.random()*10000);

				if(cached[after_append_el.getAttribute("data-uid")] && !options.createNew){
					return cached[after_append_el.getAttribute("data-uid")];
				};

				after_append_el.setAttribute("autocomplete", "off"); // FF solution - keeps form data on reload
				after_append_el.setAttribute("data-type", "select"); // set data to "select" - for validator
				after_append_el.setAttribute("data-uid", unique_id); // set unique id for cache

				after_append_el.parentNode.insertBefore(win.BBAPI.utils.closure(this, select)(), after_append_el.nextSibling);

				if(options.disabled){
					controls.disable();
				};


                _setTinyHeight();
				$(controls.scrollbarY).tinyscrollbar(); // TODO: refactoring; jquery -> native;

			};

			return cached[unique_id] = controls;
		};

		/* custom radio */
		dom.radio = function(root){
			// TODO: jquery -> native
			var _root = BBAPI.dom().body();

			if(root){
				if(typeof root == "string"){
					_root = BBAPI.dom().id(root);
				}else{
					_root = root;
				};
			};

			return $(_root).find(".js-pseudo-radio").iCheck({disabledClass: "_disabled"});
		};

		/* custom checkbox */
		dom.checkbox = function(root){
			// TODO: jquery -> native
			var _root = BBAPI.dom().body();

			if(root){
				if(typeof root == "string"){
					_root = BBAPI.dom().id(root);
				}else{
					_root = root;
				};
			};

			return $(_root).find(".js-pseudo-checkbox").iCheck().on('ifChanged',function(ev){$(this).trigger('change');});
		};

		return dom;
	};
	/* module BBAPI.dom end */

	/* module BBAPI.ajax */
	var AJAX = function () {

		var hash2array = function (hash) {
			var a = [];
			for(var k in hash) {
				a.push(encodeURIComponent(k) + "=" + encodeURIComponent(hash[k]));
			}
			return a;
		};

		var XhrResponse = function (xhr) {
			return {
				header: function (name) {
					return xhr.getResponseHeader(name);
				},

				body: function () {
					return xhr.responseText;
				},

				xml: function () {
					return xhr.responseXML;
				},

				status: function () {
					return xhr.status;
				}
			};
		};

		var loadScript = function (src) {

			var loadScript = function (url, jsonp_callback) {
				var dom = BBAPI.dom();
				var ie = win.addEventListener == undefined;
				var listener = ie ? function () {(this.readyState.toLowerCase() == "loaded" || this.readyState.toLowerCase() == "complete") && jsonp_callback.apply(this, arguments); } : jsonp_callback;
				var script = dom("script", "" , {"src": url, "type": "text/javascript"});
				listener && BBAPI.event.addEvent(script, ie ? "readystatechange" : "load", listener, false);
				return dom.head().appendChild(script);
			};

			return loadScript(src, function () { this.parentNode.removeChild(this); });
		};

		var createCallback = function (f, script_ttl, f_timeout) {
			var randomString = function (length) {
				var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz_0123456789";
				var l = length || 16;
				var cb_name = [];
				for(var i = 0, sl = chars.length-1; i < l; i++) {
					cb_name.push(chars.charAt(Math.round(Math.random()*sl)));
				}
				return "_" + cb_name.join("");
			};

			var attachCallback = function (name) {
				var timeout = function () {
					win[name] = function () {
						try { win[name] = undefined; delete win[name]; } catch (e) {};
					};
					f_timeout && f_timeout();
				};

				var t_id = setTimeout(timeout, script_ttl);
				win[name] = function () {
					clearTimeout(t_id);
					try { win[name] = undefined; delete win[name]; } catch (e) {};
					f.call(win, arguments[0]);
				};
				return name;
			};

			var i = 0;
			while(i++ < 10) {
				var name = "BBJSONP" + randomString(16);
				if(typeof(window[name]) == "undefined") {
					return attachCallback(name);
				}
			}
			throw new Error("BBAPI.JSONP.createCallback: cannot create unique name for callback");
		};

		var data2string = function (data, filter) {
			if(typeof(data) == "string") {
				return data;
			}
			var f = filter || function () { return true; };
			var s = [];
			for(var i in data) {
				f(data[i], i) && s.push(encodeURI(i) + "=" + encodeURIComponent(data[i]));
			}
			return s.join("&");
		};

		var action2string = function (params) {
			return data2string(params, function (value) { return [undefined, null, false, "false", "null"].indexOf(value) == -1});
		};

		var makeSendbody = function(callback_build, callback_error) {
			var cb = createCallback(callback_build, 10000, callback_error);
			var data = {callback: cb};
			return action2string(data);
		};


		var Ajax = function () {
			var url, callback, fail, method = "GET", data = {}, content_type = "application/x-www-form-urlencoded";
			return {
				done: function(cb){
					return (callback = cb, this);
				},

				fail: function(cb){
					return (fail = cb, this);
				},

				url: function (string) {
					return (url = string, this);
				},

				method: function (string) {
					return (method = string, this);
				},

				content_type: function(c_type){
					return (content_type = c_type, this);
				},

				data: function (hash) {
					return (data = hash, this);
				},

				run: function () {
					var r = (typeof(XMLHttpRequest) != "undefined") ? new XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");

					var get = function () {
						var u = url + (BBAPI.utils.isNotNull(data) ? (url.indexOf("?") == -1 ? "?" : "&") : "") + hash2array(data).join("&");
						r.open(method, u, !!callback);
						return send(null);
					};

					var post = function () {
						r.open(method, url, !!callback);
						r.setRequestHeader("Content-Type", content_type);
						return send(hash2array(data).join("&"));
					};

					var send = function (data) {
						//r.setRequestHeader("If-Modified-Since", new Date(0).toUTCString());
						r.setRequestHeader("Content-Type", content_type);
						if(!!callback) {
							r.onreadystatechange = function () {
								if(r.readyState == 4) {
									callback(new XhrResponse(r));
								};
							};
						};
						r.send(data);
						return new XhrResponse(r);
					};

					return method == "GET" ? get() : post();
				},

				jsonp: function(){
					loadScript(url + (url.indexOf("?") == -1 ? "?" : "&") + makeSendbody(callback, fail));
				}
			}
		};

		return new Ajax();
	};
	/* module BBAPI.ajax end */

	/* module BBAPI.fileUploader */
	var FILE_UPLOADER = function(){
		this.config = {
			login: "",
			folder: "/",
			url: bbM.stPath("") + "js/uploader.php",
			start: function(){},
			done: function(){},
			fail: function(){},
			statusCode: {}
		};

		this.input = !0;
	};

	FILE_UPLOADER.prototype.init = function(element, options){

		BBAPI.utils.extend(this.config, options);

		// если это input type="file" - работаем с ним, иначе создаем новый input в element, который получили
		if(element.tagName.toUpperCase() == "INPUT" && element.type.toUpperCase() == "FILE"){
			this.input = element;
		} else {
			this.input = this.createInput(element);
		};

		// создание <form>
		this.input.parentNode.insertBefore(this.createForm(), this.input);

		// перенос input-а в форму
		this.form.insertBefore(this.input, null);

		// собыия по onchange
		BBAPI.event.addEvent(this.input, "change", BBAPI.utils.closure(this, this.onchange));

		return this;
	};

	FILE_UPLOADER.prototype.createForm = function(){
		var dom = BBAPI.dom();

		var unique_name = "file_uploader_" + Math.round(Math.random()*1000000);
		var iframe = BBAPI.css.hide(dom("iframe", "", {name: unique_name, width: "0", height: "0"}));

		return this.form = dom.append(dom("form", "", {enctype: "multipart/form-data", method: "post", target: unique_name, action: this.config.url}), [
			iframe,
			dom("input", "", {type: "hidden", name: "login", value: this.config.login}),
			dom("input", "", {type: "hidden", name: "folder", value: this.config.folder})
		]);
	};

	FILE_UPLOADER.prototype.createInput = function(element){
		var dom = BBAPI.dom();

		var input = dom("input", "", {type: "file", "name": "file"});
		dom.append(element, input);

		return input;
	};

	FILE_UPLOADER.prototype.createCallback = function(f){

		var randomString = function (length) {
			var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz_0123456789";
			var l = length || 16;
			var cb_name = [];
			for(var i = 0, sl = chars.length-1; i < l; i++) {
				cb_name.push(chars.charAt(Math.round(Math.random()*sl)));
			};
			return "_" + cb_name.join("");
		};

		var attachCallback = function (name) {
			win[name] = function () {
				try { win[name] = undefined; delete win[name]; } catch (e) {};
				f.call(win, arguments[0]);
			};
			return name;
		};

		var i = 0;
		while(i++ < 10) {
			var name = "fileUploader" + randomString();
			if(typeof(win[name]) == "undefined") {
				return attachCallback(name);
			};
		};

		throw new Error("BBAPI.fileUploader.createCallback: cannot create unique name for callback");
	};

	FILE_UPLOADER.prototype.onchange = function(){
		var dom = BBAPI.dom();

		var input_callback = dom("input", "", {type: "hidden", name: "namecallback", value: this.createCallback(BBAPI.utils.closure(this, this.done))});
		dom.append(this.form, input_callback);

		this.config.start.call(this);
		this.form.submit();

		input_callback.parentNode.removeChild(input_callback);
	};

	FILE_UPLOADER.prototype.done = function(result){
		(this.config.statusCode[result.status] || (result.status.toString().match(/^20\d$/) ? this.config.done : this.config.fail)).call(this, result.data, result);
	};
	/* module BBAPI.fileUploader end */

	/* module BBAPI.misc */
	var MISC = {
		"_bfsd": function(){
			if(!document.location.host.match(/.babyblog.ru$/)){
				var dom = BBAPI.dom();
				dom.append(dom.body(), BBAPI.css.hide(dom("img", "", {src: "http://www.babyblog.ru/fish?url=" + document.location.host, height: "0", width: "0"})));
			};
		},

		"identifyGuest": function(){
			if(!BBAPI.utils.cookie.getCookie("bbguest")){
				BBAPI.ajax().url("/user/identifyGuest").run();
			};
		}
	};
	/* module BBAPI.misc end */


	/* placeholder */
	$(document).ready(function(){
		var api = win.BBAPI;

		api.utils.placeholder();

		api.misc._bfsd();

		// if is it mobile
		if(api.browser().isMobile.it()){
			api.css.addClass(api.dom().body(), "is-mobile");

			if(api.browser().isMobile.iOS()){
				api.css.addClass(api.dom().body(), "ios");
			};
		};

		//BBAPI.ad.tgb();
	});
	/* placeholder end */


	/* make public api available */
	win.BBAPI = {
		dom: Dom,

		ajax: AJAX,

		event: Event(),

		utils: utils,

		animate: ANIMATE,

		browser: BROWSER,

		css: css,

		modal: function(){ return new MODAL(); },

		require: function(){ return new REQUIRE(); },

		fileUploader: function(el, opt){ return new FILE_UPLOADER().init(el, opt); },

		ad: {
			floatScroll: new AD.floatScroll(),
			floatScrollPush: new AD.floatScrollPush(),

			tgb: function(opt){ return new AD.TGB(opt); },

			rcis: function(opt){ return new AD.RCIS(opt); }
		},

		misc: MISC

	};

})(window);


/*!
 * iCheck v0.9.1, http://git.io/uhUPMA
 * =================================
 * Powerful jQuery plugin for checkboxes and radio buttons customization
 *
 * (c) 2013 Damir Foy, http://damirfoy.com
 * MIT Licensed
 */

(function($) {

	// Cached vars
	var _iCheck = 'iCheck',
		_iCheckHelper = _iCheck + '-helper',
		_checkbox = 'checkbox',
		_radio = 'radio',
		_checked = 'checked',
		_unchecked = 'un' + _checked,
		_disabled = 'disabled',
		_determinate = 'determinate',
		_indeterminate = 'in' + _determinate,
		_update = 'update',
		_type = 'type',
		_click = 'click',
		_touch = 'touchbegin.i touchend.i',
		_add = 'addClass',
		_remove = 'removeClass',
		_callback = 'trigger',
		_label = 'label',
		_cursor = 'cursor',
		_mobile = /ipad|iphone|ipod|android|blackberry|windows phone|opera mini|silk/i.test(navigator.userAgent);

	// Plugin init
	$.fn[_iCheck] = function(options, fire) {

		// Walker
		var handle = ':' + _checkbox + ', :' + _radio,
			stack = $(),
			walker = function(object) {
				object.each(function() {
					var self = $(this);

					if (self.is(handle)) {
						stack = stack.add(self);
					} else {
						stack = stack.add(self.find(handle));
					};
				});
			};

		// Check if we should operate with some method
		if (/^(check|uncheck|toggle|indeterminate|determinate|disable|enable|update|destroy)$/i.test(options)) {

			// Normalize method's name
			options = options.toLowerCase();

			// Find checkboxes and radio buttons
			walker(this);

			return stack.each(function() {
				if (options == 'destroy') {
					tidy(this, 'ifDestroyed');
				} else {
					operate($(this), true, options);
				};

				// Fire method's callback
				if ($.isFunction(fire)) {
					fire();
				};
			});

			// Customization
		} else if (typeof options == 'object' || !options) {

			// Check if any options were passed
			var settings = $.extend({
					checkedClass: _checked,
					disabledClass: _disabled,
					indeterminateClass: _indeterminate,
					labelHover: true
				}, options),

				selector = settings.handle,
				hoverClass = settings.hoverClass || 'hover',
				focusClass = settings.focusClass || 'focus',
				activeClass = settings.activeClass || 'active',
				labelHover = !!settings.labelHover,
				labelHoverClass = settings.labelHoverClass || 'hover',

			// Setup clickable area
				area = ('' + settings.increaseArea).replace('%', '') | 0;

			// Selector limit
			if (selector == _checkbox || selector == _radio) {
				handle = ':' + selector;
			};

			// Clickable area limit
			if (area < -50) {
				area = -50;
			};

			// Walk around the selector
			walker(this);

			return stack.each(function() {

				// If already customized
				tidy(this);

				var self = $(this),
					node = this,
					id = node.id,

				// Layer styles
					offset = -area + '%',
					size = 100 + (area * 2) + '%',
					layer = {

					},

				// Choose how to hide input
					hide = _mobile ? {
						position: 'absolute',
						visibility: 'hidden'
					} : area ? layer : {
						position: 'absolute',
						opacity: 0
					},

				// Get proper class
					className = node[_type] == _checkbox ? settings.checkboxClass || 'i' + _checkbox : settings.radioClass || 'i' + _radio,

				// Find assigned labels
					label = $(_label + '[for="' + id + '"]').add(self.closest(_label)),

				// Wrap input
					parent = self.wrap('<div class="' + className + '"/>')[_callback]('ifCreated').parent().append(settings.insert),

				// Layer addition
					helper = $('<i class="icon icon-'+className+' i_18 db abs"></i><ins class="' + _iCheckHelper + '"/>').css(layer).appendTo(parent);

				// Finalize customization
				self.data(_iCheck, {o: settings, s: self.attr('style')}).css(hide);
				!!settings.inheritClass && parent[_add](node.className);
				!!settings.inheritID && id && parent.attr('id', _iCheck + '-' + id);
				operate(self, true, _update);

				// Label events
				if (label.length) {
					label.on(_click + '.i mouseenter.i mouseleave.i ' + _touch, function(event) {
						var type = event[_type],
							item = $(this);

						// Do nothing if input is disabled
						if (!node[_disabled]) {

							// Click
							if (type == _click) {
								operate(self, false, true);

								// Hover state
							} else if (labelHover) {

								// mouseleave|touchend
								if (/ve|nd/.test(type)) {
									parent[_remove](hoverClass);
									item[_remove](labelHoverClass);
								} else {
									parent[_add](hoverClass);
									item[_add](labelHoverClass);
								};
							};

							if (_mobile) {
								event.stopPropagation();
							} else {
								return false;
							};
						};
					});
				};

				// Input events
				self.on(_click + '.i focus.i blur.i keyup.i keydown.i keypress.i', function(event) {
					var type = event[_type],
						key = event.keyCode;

					// Click
					if (type == _click) {
						return false;

						// Keydown
					} else if (type == 'keydown' && key == 32) {
						if (!(node[_type] == _radio && node[_checked])) {
							if (node[_checked]) {
								off(self, _checked);
							} else {
								on(self, _checked);
							};
						};

						return false;

						// Keyup
					} else if (type == 'keyup' && node[_type] == _radio) {
						!node[_checked] && on(self, _checked);

						// Focus/blur
					} else if (/us|ur/.test(type)) {
						parent[type == 'blur' ? _remove : _add](focusClass);
					};
				});

				// Helper events
				helper.on(_click + ' mousedown mouseup mouseover mouseout ' + _touch, function(event) {
					var type = event[_type],

					// mousedown|mouseup
						toggle = /wn|up/.test(type) ? activeClass : hoverClass;

					// Do nothing if input is disabled
					if (!node[_disabled]) {

						// Click
						if (type == _click) {
							operate(self, false, true);

							// Active and hover states
						} else {

							// State is on
							if (/wn|er|in/.test(type)) {

								// mousedown|mouseover|touchbegin
								parent[_add](toggle);

								// State is off
							} else {
								parent[_remove](toggle + ' ' + activeClass);
							};

							// Label hover
							if (label.length && labelHover && toggle == hoverClass) {

								// mouseout|touchend
								label[/ut|nd/.test(type) ? _remove : _add](labelHoverClass);
							};
						};

						if (_mobile) {
							event.stopPropagation();
						} else {
							return false;
						};
					};
				});
			});
		} else {
			return this;
		};
	};

	// Do something with inputs
	function operate(input, direct, method) {
		var node = input[0];
		state = /er/.test(method) ? _indeterminate : /bl/.test(method) ? _disabled : _checked,
			active = method == _update ? {
				checked: node[_checked],
				disabled: node[_disabled],
				indeterminate: input.attr(_indeterminate) == 'true' || input.attr(_determinate) == 'false'
			} : node[state];

		// Check, disable or indeterminate
		if (/^(ch|di|in)/.test(method) && !active) {
			on(input, state);

			// Uncheck, enable or determinate
		} else if (/^(un|en|de)/.test(method) && active) {
			off(input, state);

			// Update
		} else if (method == _update) {

			// Handle states
			for (var state in active) {
				if (active[state]) {
					on(input, state, true);
				} else {
					off(input, state, true);
				};
			};

		} else if (!direct || method == 'toggle') {

			// Helper or label was clicked
			if (!direct) {
				input[_callback]('ifClicked');
			};

			// Toggle checked state
			if (active) {
				if (node[_type] !== _radio) {
					off(input, state);
				};
			} else {
				on(input, state);
			};
		};
	};

	// Add checked, disabled or indeterminate state
	function on(input, state, keep) {
		var node = input[0],
			parent = input.parent(),
			checked = state == _checked,
			indeterminate = state == _indeterminate,
			callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
			regular = option(node, callback + capitalize(node[_type])),
			specific = option(node, state + capitalize(node[_type]));

		// Prevent unnecessary actions
		if (node[state] !== true) {

			// Toggle assigned radio buttons
			if (!keep && state == _checked && node[_type] == _radio && node.name) {
				var form = input.closest('form'),
					inputs = 'input[name="' + node.name + '"]';

				inputs = form.length ? form.find(inputs) : $(inputs);

				inputs.each(function() {
					if (this !== node && $.data(this, _iCheck)) {
						off($(this), state);
					};
				});
			};

			// Indeterminate state
			if (indeterminate) {

				// Add indeterminate state
				node[state] = true;

				// Remove checked state
				if (node[_checked]) {
					off(input, _checked, 'force');
				};

				// Checked or disabled state
			} else {

				// Add checked or disabled state
				if (!keep) {
					node[state] = true;
				};

				// Remove indeterminate state
				if (checked && node[_indeterminate]) {
					off(input, _indeterminate, false);
				};
			};

			// Trigger callbacks
			callbacks(input, checked, state, keep);
		};

		// Add proper cursor
		if (node[_disabled] && !!option(node, _cursor, true)) {
			parent.find('.' + _iCheckHelper).css(_cursor, 'default');
		};

		// Add state class
		parent[_add](specific || option(node, state));

		// Remove regular state class
		parent[_remove](regular || option(node, callback) || '');
	};

	// Remove checked, disabled or indeterminate state
	function off(input, state, keep) {
		var node = input[0],
			parent = input.parent(),
			checked = state == _checked,
			indeterminate = state == _indeterminate,
			callback = indeterminate ? _determinate : checked ? _unchecked : 'enabled',
			regular = option(node, callback + capitalize(node[_type])),
			specific = option(node, state + capitalize(node[_type]));

		// Prevent unnecessary actions
		if (node[state] !== false) {

			// Toggle state
			if (indeterminate || !keep || keep == 'force') {
				node[state] = false;
			};

			// Trigger callbacks
			callbacks(input, checked, callback, keep);
		};

		// Add proper cursor
		if (!node[_disabled] && !!option(node, _cursor, true)) {
			parent.find('.' + _iCheckHelper).css(_cursor, 'pointer');
		};

		// Remove state class
		parent[_remove](specific || option(node, state) || '');

		// Add regular state class
		parent[_add](regular || option(node, callback));
	};

	// Remove all traces
	function tidy(node, callback) {
		if ($.data(node, _iCheck)) {
			var input = $(node);

			// Remove everything except input
			input.parent().html(input.attr('style', $.data(node, _iCheck).s || '')[_callback](callback || ''));

			// Unbind events
			input.off('.i').unwrap();
			$(_label + '[for="' + node.id + '"]').add(input.closest(_label)).off('.i');
		};
	};

	// Get some option
	function option(node, state, regular) {
		if ($.data(node, _iCheck)) {
			return $.data(node, _iCheck).o[state + (regular ? '' : 'Class')];
		};
	};

	// Capitalize some string
	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	// Executable handlers
	function callbacks(input, checked, callback, keep) {
		if (!keep) {
			if (checked) {
				input[_callback]('ifToggled');
			};

			input[_callback]('ifChanged')[_callback]('if' + capitalize(callback));
		};
	};
})(jQuery);
