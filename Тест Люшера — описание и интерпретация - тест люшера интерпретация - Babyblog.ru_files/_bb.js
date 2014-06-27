// jQuery regex filter selector
// @see http://james.padolsey.com/javascript/regex-selector-for-jquery/
jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
            validLabels = /^(data|css):/,
            attr = {
        method: matchParams[0].match(validLabels) ?
                matchParams[0].split(':')[0] : 'attr',
        property: matchParams.shift().replace(validLabels, '')
    },
    regexFlags = 'ig',
            regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g, ''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(searchElement /*, fromIndex */) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

// делаем для строк, метод, который превращает адреса в ссылки <a href="">
if(!String.linkify) {
    String.prototype.linkify = function() {

	// http://, https://, ftp://
	var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;
	// www. sans http:// or https://
	var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	var emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;

	return this
	    .replace(urlPattern, '<a href="$&">$&</a>')
	    .replace(pseudoUrlPattern, '$1<a href="http://$2">$2</a>')
	    .replace(emailAddressPattern, '<a href="mailto:$1">$1</a>');
    };
}
if (!String.striptags) {
    String.prototype.striptags = function(allowed) {
	allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
	  commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	return this
	    .replace(commentsAndPhpTags, '')
	    .replace(tags, function ($0, $1) {
		return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
	    });
    }
}

////переопределям конслоль, чтобы не возникали ошибки в браузерах не поддерживающих ее
//для IE отключаем консоль вообще

var ua = navigator.userAgent;
var BbDebug = true;
if (ua.match(/MSIE/)) {
    window.console = {
        log: function() {
        },
        group: function() {
        },
        groupEnd: function() {
        },
        warn: function() {
        },
        error: function() {
        },
        time: function() {
        },
        timeEnd: function() {
        }
    }
} else {
    /*    new function () {
     var original = window.console;
     window.console = {};
     ['log', 'group', 'groupEnd', 'warn', 'error', 'time', 'timeEnd'].forEach(function (method) {
     console[method] = function () {
     return (BbDebug && original) ? original[method].apply(original, arguments) : '';
     }
     });
     };*/
}


//функция для получения LANG переменных из lang файла
//lang файл грузится во view
var bbLang = function(langName, etc) {
    var arg = arguments;
    var i = 1;

    if (bbLangContent && bbLangContent[langName]) {
        if (etc) {
            return bbLangContent[langName].replace(/%((%)|s)/g, function(m) {
                return m[2] || arg[i++]
            });
        } else {
            return bbLangContent[langName];
        }
    }

    //return bbLangContent[langName];
    return langName;
}

var dateClassic = function(str) {
    var date = [];
    var expl = str.split("-");

    if (expl.length != 3)
        return false;

    for (var key in expl) {
        date.push(parseInt(expl[key], 10));
    }

    return ' ' + date[2] + ' ' + bbLang('MONTHES_GENITIVE')[ date[1] ] + ' ' + date[0];
}

function sprintf(format, etc) {
    var arg = arguments;
    var i = 1;
    return format.replace(/%((%)|s)/g, function(m) {
        return m[2] || arg[i++]
    })
}


//общие методы для использования
var bbM = {
    check_is_logged: false, //залогинен ли пользователь
    redactor: 'SCeditor', //либо  redactorJS
    cacheVersion: '', //кэширование версии
    cacheStPath: '', //кэширование пути
    //определяем путь до папки st

    stPath: function(path) {
        if (!bbM.cacheStPath) {
            $('script').each(function(i, e) {
                var src = $(e).attr('src');
                if (src) {
                    var ma = src.match(/(st(\d+|\/).*)js\/_bb.js$/);
                    if (ma) {
                        bbM.cacheStPath = "/" + ma[1];
                        bbM.cacheVersion = ma[2] != "/" ? ma[2] : bbM.cacheVersion;
                    }
                    ;
                }
                ;
            });

        }
        ;

        return bbM.cacheStPath + path;
    },

    // проверка на мобильное устройство
    isMobile: function() {
        return /(iPhone|iPad|iPod|BlackBerry|Android)/.test(navigator.userAgent);
    },
    //получение куки. возвращает cookie если есть или undefined
    getCookie: function(name) {
        var matches = document.cookie.match(new RegExp(
                "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
                ))
        return matches ? decodeURIComponent(matches[1]) : undefined
    },
    //устанавка cookie
    setCookie: function(name, value, props) {
        props = props || {};
        var exp = props.expires;
        if (typeof exp == "number" && exp) {
            var d = new Date();
            d.setTime(d.getTime() + exp * 1000);
            exp = props.expires = d;
        }
        if (exp && exp.toUTCString) {
            props.expires = exp.toUTCString();
        }

        value = encodeURIComponent(value);
        var updatedCookie = name + "=" + value;
        for (var propName in props) {
            updatedCookie += "; " + propName;
            var propValue = props[propName];
            if (propValue !== true) {
                updatedCookie += "=" + propValue;
            }
        }
        document.cookie = updatedCookie;
    },
    //удаление cookie
    delCookie: function(name) {
        bbM.setCookie(name, null, {
            expires: -1
        })
    },
    //удаление пробелов и custom символов в строке
    trim: function(str, charlist) {
        charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
        var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
        return str.replace(re, '');
    },
    //Генерируем функцию, которая и непосредственно рендерит шаблон
    buildTmplFn: function(str) {
        var fn = new Function("obj",
                "var p=[],print=function(){p.push.apply(p,arguments);};" +
                // Сделать данные доступными локально при помощи with(){}
                "with(obj){p.push('" +
                // Превратить шаблон в чистый JavaScript
                str
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("p.push('")
                .split("\r").join("\\'")
                + "');}return p.join('');"
                );
        return fn;
    },
    //отображение информации пользователю
    flashEvent: function(text, type, postLocation, time) {
        if (!time) {
            time = 800;
        }

        //тип уведомления
        var eventType = type ? 'f_success' : 'f_error';

        //шаблон
        var tpl = '<div class="flash-notice fxd css-corner-5" style="display:none"><div class="flash-desc _24 _it _georgia ' + eventType + ' css-corner-5 _ac">' + text + '</div></div>';

        //отображение
        var eventBlock = $(tpl).appendTo('body');
        eventBlock.fadeIn('fast').delay(time).fadeOut('slow', function() {
            $(this).remove();

            //если нужно то делаем редирект
            if (postLocation) {
                window.location.href = postLocation;
            }
        });
    },
    //отображение информации пользователю ввиде маленького блока
    flashEventCustom: function(object, postLocation, time) {
        if (!time) {
            time = 800;
        }

        object.fadeIn('fast').delay(time).fadeOut('slow', function() {
            $(this).remove();

            //если нужно то делаем редирект
            if (postLocation) {
                window.location.href = postLocation;
            }
        });
    },
    //формирование данных для создания select
    daySelectData: function() {
        var days = [];
        for (var i = 1; i <= 31; i++) {
            days.push({
                value: i,
                text: i
            });
        }

        return days;
    },
    monthSelectData: function() {
        var month = [];
        var m = bbLang('MONTHES_GENITIVE');
        for (var i = 1; i <= 12; i++) {
            month.push({
                value: i,
                text: m[i]
            });
        }

        return month;
    },
    yearSelectData: function(startYear, reverse) {
        var year = [];
        if (!startYear)
            startYear = 1940;

        if (reverse) {
            for (var i = new Date().getFullYear(); i >= startYear; i--) {
                year.push({
                    value: i,
                    text: i
                });
            }
        } else {
            for (var i = startYear; i <= new Date().getFullYear(); i++) {
                year.push({
                    value: i,
                    text: i
                });
            }
        }

        return year;
    },
    //вывод текущей даты
    today: function() {
        var d = new Date();
        var day = d.getDate();
        var month = d.getMonth() + 1;
        var year = d.getFullYear();

        if (day < 10)
            day = '0' + day;
        if (month < 10)
            month = '0' + month;

        return year + '-' + month + '-' + day;
    }
};

//плагины jquery
(function($) {
    var tpl_cache = {}, cacheAjax = {},
            userPopupCache = {};
    userPopupCommentCache = {};
    childPopupCommentCache = {};

    // Форма
    $.fn.bbValidateForm = function(method) {
        if (bbValidateFormMethods[method]) {
            return bbValidateFormMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return bbValidateFormMethods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbValidateFormMethods');
        }
    };

    var bbValidateFormMethods = {
        init: function(param) {
            var windowForm = $(this), //форма
                opts = bbValidateFormMethods.initData.apply(this, [param]);

            if (!windowForm.data('formInit')) {

                windowForm.data('formInit', 1);
                //событие на submit формы
                windowForm.submit(function() {
                    //выполнение отправкой формы
                    if (param.preExec) {
                        param.preExec();
                    }

                    return bbValidateFormMethods.formSubmit.apply(this, [windowForm, opts]);
                });
            }
        },
        //данные при инициализации formValidation
        initData: function(param) {
            var windowForm = $(this);

            var opts = $.extend({
                _tmp_init_: true,
                successText: '',
                postLocation: '', //редирект в случае необходимости
                errorTextPosition: '', //позиция для вывода текстовой подсказки
                errorTextShowed: true, //выводить ошибка без текстовых подсказок
                onComplete: function() {
                    //console.log('bbValidateForm onComplete');
                },
                onError: function () {
                    //console.log('bbValidateForm onError');
                },
	            errorTextPositionFor: {
		            input: null
	            },
                statusCode: {}
            }, param);

            opts.statusCode = $.extend({
                504: function(response) {
                    //console.log('%cformValidation 504 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                501: function(response) {
                    //console.log('%cformValidation 501 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                500: function(response) {
                    //console.log('%cformValidation 501 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                400: function(response) {
                    //console.log('%cformValidation 400 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                403: function(response) {
                    //console.log('%cformValidation 403 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                404: function(response) {
                    //console.log('%cformValidation 404 %O', 'color:red', response);
                    bbValidateFormMethods.formSubmitError.apply(this, [windowForm, jQuery.parseJSON(response.responseText), opts]);
                },
                406: function(response) {
                    //callback функция, может описываться при инициализации
                    opts.onError(response);
                    windowForm.data('is_send', 0);
                }
            }, opts.statusCode);

            return opts;
        },
        formSubmit: function(windowForm, opts) {
            if(!opts._tmp_init_){
                opts = bbValidateFormMethods.initData.apply(this, [opts]);
            };

            if (windowForm.data('is_send') == 1)
                return false;

            windowForm.data('is_send', 1);

            //определяем на какой урл посылаем запрос
            var submitUrl = windowForm.attr('action') ? windowForm.attr('action') : window.location.href;
            var sendData = windowForm.serialize();

            $.ajax(submitUrl, {
                type: "POST",
                data: sendData,
                statusCode: opts.statusCode,
                success: function(response) {
                    bbValidateFormMethods.formSubmitSuccess.apply(this, [windowForm, response, opts]);
                }
            });

            return false;
        },
        formSubmitSuccess: function(windowForm, response, opts) {
            windowForm.data('is_send', 0);
            //console.log('%cformSubmitSuccess %O', 'color:green', response);

            //если сообщение по окончанию выполнения, то показываем его
            if (opts.successText) {
                bbM.flashEvent(opts.successText, true, opts.postLocation);
            }


	    //callback функция, может описываться при инициализации
	    opts.onComplete(response, windowForm);
	},

        showFieldError: function ($parent, field, errors, opts) {
            var $that = $(this);

	        /*
            if (!$parent.parent().hasClass('_dataerror')) {
                $parent.wrap('<div class="_dataerror">', '</div>');
            }
	        */

	        if (!$parent.hasClass('_dataerror')) {
		        $parent.addClass("_dataerror");
	        }

            if (opts.errorTextShowed) {
                $('#'+$that.attr('name')+'_error').remove();
                var positionclass = '';
                switch(opts.errorTextPosition) {
                        case 'top': positionclass = '_err-tp'; break;
                        case 'left': positionclass = '_err-lt'; break;
                        case 'bottom': positionclass = '_err-bt'; break;
                        case 'right': default: positionclass = ''; break;
                }

                $('<span id="'+field+'_error" class="db _14 _err _it clear ' + positionclass + '">'+errors[field]+'</span>').on("click",function(){ $(this).hide(); }).appendTo( $parent );
            }

            if($that.data('type') == 'select' || $that[0].tagName == 'INPUT' && $that[0].type == 'radio') {

                //к сожалению пока так, т.к. проблема с радиобаттоном, почему то не ставится на label событие click
                function focusEvt ($that, $selector) {
                    $selector.off('click.validateField').on('click.validateField', function () {
                        var that = this;
                        $('#'+$that.attr('name')+'_error').fadeOut('fast', function () {
                            $(this).remove();
	                        /*
                            if($parent.parent('div._dataerror').length && !$parent.parent('div._dataerror').find('._err').size()  ) {
                                $parent.unwrap('<div class="_dataerror">');
                            }
	                        */
	                        $parent.removeClass("_dataerror");
                            $(that).off('focus.validateField').focus();
                        });
                    });
                }

                if ($that.data('type') == 'select') {
                    focusEvt( $that, $that.next() );
                } else {
                    focusEvt( $that, $that.next() );
                    focusEvt( $that, $that.parent().next() );
                }

            } else {
                //убираем ошибки при фокусе на проблемном поле
                $that.off('focus.validateField').on('focus.validateField', function () {
                    var that = this;
                    $('#'+$(this).attr('name')+'_error').fadeOut('fast', function () {
                        //$parent.unwrap('<div class="_dataerror">');
	                    $parent.removeClass("_dataerror");
                        $(this).remove();
                        $(that).off('focus.validateField').focus();
                    });
                });
            }
        },
        formSubmitError: function(windowForm, errors, opts) {
            windowForm.data('is_send', 0);

            if (opts.onError) {
                opts.onError.call(this, errors);
            }

            for (var field in errors) {
                var $parent;
                var el = windowForm.find('[name="' + field + '"]');

	            var opts_errorTextPosition = opts.errorTextPosition;

                if (el.size()) {
                    if (el[0].tagName == 'INPUT') { //для элементов INPUT
                        if (el.data('type') == 'select') {
	                        /*
                            if (el.parent().hasClass('js__groupSelect')) {
                                $parent = el.parent();
                            } else {
                                $parent = el.next();
                            }
	                        */
	                        $parent = el.next();
	                        opts.errorTextPositionFor && opts.errorTextPositionFor.input && opts.errorTextPositionFor.input.select && (opts.errorTextPosition = opts.errorTextPositionFor.input.select);
                        } else if (el[0].type == "radio") { //для типа радио button
                            $parent = el.parents('.radiogroup');
	                        opts.errorTextPositionFor && opts.errorTextPositionFor.input && opts.errorTextPositionFor.input.radio && (opts.errorTextPosition = opts.errorTextPositionFor.input.radio);
                        } else if (el[0].type == "checkbox") { //для типа радио button
                            $parent = el.parents('.form-checkbox');
	                        opts.errorTextPositionFor && opts.errorTextPositionFor.input && opts.errorTextPositionFor.input.checkbox && (opts.errorTextPosition = opts.errorTextPositionFor.input.checkbox);
                        } else {//остальные типы
                            $parent = el.parents('.pseudo-input');
	                        opts.errorTextPositionFor && opts.errorTextPositionFor.input && opts.errorTextPositionFor.input.self && (opts.errorTextPosition = opts.errorTextPositionFor.input.self);
                        }
                    } else if (el[0].tagName == 'SELECT') { //для элементов SELECT
                        $parent = el.parents('.pseudo-select-list');
	                    opts.errorTextPositionFor && opts.errorTextPositionFor.select && (opts.errorTextPosition = opts.errorTextPositionFor.select);
                    } else if (el[0].tagName == 'TEXTAREA') { //для элементов TEXTAREA
                        $parent = el.parents('.pseudo-textarea');
	                    opts.errorTextPositionFor && opts.errorTextPositionFor.textarea && (opts.errorTextPosition = opts.errorTextPositionFor.textarea);
                    }

                    bbValidateFormMethods.showFieldError.apply(el, [$parent, field, errors, opts]);
	                opts.errorTextPosition = opts_errorTextPosition;
                }
            }
        }
    };

    //Построение кастомного по виду выпадающего списка. В коде делаем input text в имени которого указываем то название переменной, которую нам нужно получить со значением выпадающего списка, но с подчекиванием.
    // например <input type="text" name="_parent">. Применяем к этому инпуту наш метод  $('input[name="_parent"]').bbCustomSelect({data: [{value: 1,text: 'Категория 1'}, {value: 2,text: 'Категория 2'}], selected: 2}); и в итоге получаем:
    // при выборе какого-то значения в выпадающем списке скрипту из формы приде $parent = "category_id" и $_parent = "category_text". В коде за инпутом, к которому мы привязываем метод будет прикреплен <select>
    // options.selected - устанавливает выбранный элемент по умолчанию
    // options.createNew: "Новое значение" - задает дополнительный элемент в выпадающем списке, предназначенный для создания "под-селектов"
    // options.createNewBlur: function(){} - колбэк, который будет выполнен, в случае выбора элемента в списке, отличного от options.createNew
    // options.createNewFocus: function(){} - колбэк, который будет выполнен, в случае выбора элемента для создания "под-селекта"
    $.fn.bbCustomSelect = function(options) {
        var self = this;
        var selectedOption = options.selected ? options.selected : false;
        var prevSelectedOption = false;
        var select = $('<select size="1"><option value=""' + (!selectedOption ? ' selected' : '') + '>' + $(self).val() + '</option></select>');
        if (options.data) {
            for (var key in options.data) {
                select.append($('<option>', {
                    value: options.data[key].value,
                    text: options.data[key].text
                }))
            }
        }
        if ($(self).attr('name')) {
            select.attr('name', bbM.trim($(self).attr('name'), "_ \n"));
        }
        if (selectedOption) {
            select.find('[value="' + selectedOption + '"]').attr("selected", "selected");
            self.val(select.find('[value="' + selectedOption + '"]').text());
        }
        if (options.createNew) {
            select.append($('<option>', {
                value: '_new',
                text: options.createNew
            }));
        }
        select.on('change', function() {
            if (options.onBlur) {
                if (prevSelectedOption) {
                    options.onBlur[prevSelectedOption].call(this, self);
                    prevSelectedOption = false;
                }
            }

            if (options.createNew && $(this).find("option:selected").val() == '_new' && options.createNewFocus && typeof options.createNewFocus == 'function') {
                options.createNewFocus.call(this, self);
            }
            else if (options.createNew && options.createNewBlur && typeof options.createNewBlur == 'function') {
                options.createNewBlur.call(this, self);
            }
            else if (options.onFocus) {

                if (typeof options.onFocus === 'object') {
                    if (options.onFocus[$(this).find("option:selected").val()]) { //событие по фокусу на определенное значение
                        options.onFocus[$(this).find("option:selected").val()].call(this, self);
                        prevSelectedOption = $(this).find("option:selected").val();
                    }
                } else {
                    options.onFocus.call(this, self);
                }
            }

            $(self).val($(this).find("option:selected").text());
        });
        $(this).after(select);
    };

    //добавление/редактирование аватарки пользователя
    //инициализация плагина
    $.fn.bbAvatarForm = function(method) {
        if (typeof method === 'object' || !method) {
            bbAvatarFormMethods.init.apply(this, [arguments[0]]);
        } else if (bbAvatarFormMethods[method]) {
            bbAvatarFormMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbAvatarFormMethods');
        }

        return this;

        //return bbAvatarFormMethods.init.apply( this, [params] );
    };

    //методы
    var bbAvatarFormMethods = {
        paramData: {},
        //инициализируем входный параметров
        init: function(params) {
            var self = this,
                opts = $(this).data();

            bbAvatarFormMethods.paramData = params;

            if(params && params.regwizard) return;
            return bbAvatarFormMethods.preLoaderForm.apply(this, [self, opts]);
        },
        //инициализируем форму по наведению мыши на аватарку
        preLoaderForm: function(self, opts) {
            var objectWin = $('<div/>');
            //отрисовываем шаблон
            $.when(objectWin.bbTpl("//user/AvatarFormPreLoader")).then(function() {
                $(self).html(objectWin.html());
                $(self).find('div.avatar-change').on('click.bbAvatarFormShow', function() {
                    bbAvatarFormMethods.showForm.apply(this, [self, opts])
                    return false;
                });
            });
        },
        //инициализируем входный параметров
        initCommunity: function(params) {
            var self = this,
                    opts = $(this).data();

            bbAvatarFormMethods.paramData = params;

            return bbAvatarFormMethods.preLoaderCommunityForm.apply(this, [self, opts]);
        },
        //инициализируем форму по наведению мыши на аватарку
        preLoaderCommunityForm: function(self, opts) {
            var objectWin = $('<div/>');
            //отрисовываем шаблон
            $.when(objectWin.bbTpl("//community/AvatarFormPreLoader")).then(function() {
                $(self).html(objectWin.html());

                $(self).find('.js__ChangeComAvatar').on('click.bbAvatarFormShow', function() {
                    bbAvatarFormMethods.showForm.apply(this, [self, opts]);
                    return false;
                });
            });
        },
        // дополнительная функция со всякими математическими штуками для обработки выбора кропаемой области аватара
        showFormCrop: function(self, windowForm, opts, result) {

            if (opts.type&&opts.type=='community') {
                windowForm.find('[rel=moveMask]').addClass('overlay-community');
            }

            var imagePreview = windowForm.find('img[rel="imageSrc"]'),
                currentWidth = parseInt(result.size.x, 10), //текущий размер изображения
                currentHeight = parseInt(result.size.y, 10), //текущий размер изображения
                imagePos = [//данные о изображении
                    0, 0, //x,y координаты верхей точки маски
                    currentWidth, currentHeight, //ширина, высота
                    Math.round(currentWidth / 2), Math.round(currentHeight / 2) //x,y координаты центра
                ],
                maskPos = [//данные о маске
                    216, 68, //x,y координаты верхей точки маски
                    164, 162, //ширина, высота
                    216 + 164 / 2, 68 + 162 / 2 //x,y координаты центра
                ],
                imageType, //формат изображения "книжная" или "альбомная" (h, w)
                rateType, //умножитель необходимый для зума изображения, получается по соотношению строн между изображением и маской
                zoomStep = 48; //шаг зума

            //меняем изображение
            imagePreview.attr('src', result.source);

            //проверяем какой тип изображения горизантальное либо вертикальное изображение и определяем умножитель для данной стороны, его используем в зуме
            if (imagePos[2] < imagePos[3]) {
                imageType = 'h';
                rateType = imagePos[3] / imagePos[2];
            } else {
                imageType = 'w';
                rateType = imagePos[2] / imagePos[3];
            }

            //если изображение пользователя маленькое то мы его увеличиваем до минимального значения (равно маске)
            if (imagePos[2] < maskPos[2] || imagePos[3] < maskPos[3]) {
                if (imageType == 'h') {
                    var r = maskPos[2] / imagePos[2]; //получаем промежуточный умножитель

                    currentWidth *= r; //увеличиваем ширину
                    imagePos[4] = Math.round(currentWidth / 2); //меняем значения координаты x центра изображения
                    currentHeight *= r; //увеличиваем высоту
                    imagePos[5] = Math.round(currentHeight / 2); //меняем значения координаты y центра изображения

                    imagePreview.css({
                        'width': currentWidth
                    }); //применяем изменения визульно
                } else {
                    var r = maskPos[3] / imagePos[3]; //получаем промежуточный умножитель

                    currentHeight *= r; //увеличиваем высоту
                    imagePos[5] = Math.round(currentHeight / 2); //меняем значения координаты y центра изображения
                    currentWidth *= r; //увеличиваем ширину
                    imagePos[4] = Math.round(currentWidth / 2); //меняем значения координаты x центра изображения

                    imagePreview.css({
                        'height': currentHeight
                    }); //применяем изменения визульно
                }
            }

            //центрируем изображение относительно маски
            var moveLeft = maskPos[4] - imagePos[4],
                moveTop = maskPos[5] - imagePos[5];
            imagePreview.css({
                'left': moveLeft,
                'top': moveTop
            });

            //обработка событий клика и движений мыши (с учетом возможности использования touchscreen)
            var mL, //временная переменная для хранения начального значения moveLeft после нажатия
                mT; //временная переменная для хранения начального значения moveTop после нажатия
            $('div[rel="moveMask"]').on('mousedown touchstart', function(e) {
                var self = this;
                $(this).addClass('move'); //ставим признак обработки

                var xCoordStart = e.clientX !== undefined ? e.clientX : e.originalEvent.touches[0].pageX, //получаем координаты мыши по x (с учетом возможности использования touchscreen)
                    yCoordStart = e.clientY !== undefined ? e.clientY : e.originalEvent.touches[0].pageY; //получаем координаты мыши по y (с учетом возможности использования touchscreen)
                mL = moveLeft; //начальное значение moveLeft перед перемещением курсора
                mT = moveTop; //начальное значение moveTop перед перемещением курсора

                //обработка события mousemove/touchmove
                $(this).on('mousemove touchmove', function(f) {
                    if ($(self).hasClass('move')) { //если класс в обработке
                        //получаем промежуточные значения сдвига для плавной анимации
                        moveLeft = mL + ((f.clientX !== undefined ? f.clientX : f.originalEvent.touches[0].pageX) - xCoordStart);
                        moveTop = mT + ((f.clientY !== undefined ? f.clientY : f.originalEvent.touches[0].pageY) - yCoordStart);

                        //запрещаем сдвигать изображение за рамки маски по горизонтали
                        if (moveLeft > maskPos[0]) {
                            moveLeft = maskPos[0];
                        } else if (moveLeft < (maskPos[0] + maskPos[2] - currentWidth)) {
                            moveLeft = maskPos[0] + maskPos[2] - currentWidth;
                        }

                        //запрещаем сдвигать изображение за рамки маски по вертикали
                        if (moveTop > maskPos[1]) {
                            moveTop = maskPos[1];
                        } else if (moveTop < (maskPos[1] + maskPos[3] - currentHeight)) {
                            moveTop = maskPos[1] + maskPos[3] - currentHeight;
                        }

                        //анимация движения картинки
                        imagePreview.stop().animate({
                            'left': moveLeft,
                            'top': moveTop
                        }, 1);
                    }
                    
                    return false;
                });
                

                //обработка события mouseup/touchend
                $(this).on('mouseup touchend', function(g) {
                    if ($(self).hasClass('move')) { //если идет обработка
                        $(self).removeClass('move'); //убираем признак обработки
                    }
                    return false;
                });

                //обработка события mouseout
                $(this).mouseout(function(g) {
                    if ($(self).hasClass('move')) { //если идет обработка
                        $(self).removeClass('move'); //убираем признак обработки
                    }
                });
                
                return false;
            });

            //событие по клику увеличение изображение
            windowForm.find('a[rel="zoomInClick"]').off('click.bbZoomInClick').on('click.bbZoomInClick', function() {
                r = (currentWidth + zoomStep) / currentWidth; //получаем умножитель
                currentWidth *= r; //увеличиваем ширину
                currentHeight *= r; //увеличиваем высоту

                //сдвигаем изображение moveLeft и moveTop чтобы точка увеличения осталась на своем месте
                if (imageType == 'h') {
                    //т.к. изображение в книжном формате, то мы увеличиваем зум по ширине
                    moveLeft -= zoomStep / 2;
                    moveTop -= zoomStep * rateType / 2;

                    imagePreview.css('height', '');
                    imagePreview.stop().animate({//анимируем увеличение по ширине
                        'width': currentWidth,
                        'top': moveTop,
                        'left': moveLeft
                    }, 1);
                } else {
                    //т.к. изображение в альбомном формате, то мы увеличиваем зум по высоте
                    moveLeft -= zoomStep * rateType / 2;
                    moveTop -= zoomStep / 2;

                    imagePreview.css('width', '');
                    imagePreview.stop().animate({//анимируем увеличение по высоте
                        'height': currentHeight,
                        'top': moveTop,
                        'left': moveLeft
                    }, 1);
                }

                return false;
            });

            //событие по клику уменьшение изображение
            windowForm.find('a[rel="zoomOutClick"]').off('click.bbZoomOutClick').on('click.bbZoomOutClick', function() {
                //если после зума изображения будет больше маски то выполняем зум
                if ((imageType == 'h' && ((currentWidth - zoomStep) > maskPos[2])) || (imageType == 'w' && ((currentHeight - zoomStep) > maskPos[3]))) {
                    r = (currentWidth - zoomStep) / currentWidth; //получаем умножитель
                    currentWidth *= r; //увеличиваем ширину
                    currentHeight *= r; //увеличиваем высоту

                    moveLeft += zoomStep * rateType / 2;
                    moveTop += zoomStep / 2;

                    imagePreview.css('width', '');
                    imagePreview.stop().animate({
                        'height': currentHeight,
                        'top': moveTop,
                        'left': moveLeft
                    }, 1, function() {
                        //запрещаем сдвигать изображение за рамки маски по горизонтали
                        if (moveLeft > maskPos[0]) {
                            moveLeft = maskPos[0];
                        } else if (moveLeft < (maskPos[0] + maskPos[2] - currentWidth)) {
                            moveLeft = maskPos[0] + maskPos[2] - currentWidth;
                        }

                        //запрещаем сдвигать изображение за рамки маски по вертикали
                        if (moveTop > maskPos[1]) {
                            moveTop = maskPos[1];
                        } else if (moveTop < (maskPos[1] + maskPos[3] - currentHeight)) {
                            moveTop = maskPos[1] + maskPos[3] - currentHeight;
                        }

                        //применяем изменения визульно
                        imagePreview.css({
                            'left': moveLeft,
                            'top': moveTop
                        });
                    });
                }

                return false;
            });

            //событие на "сохранить портрет"
            if(opts&&opts.regwizard) {
                // если загрузка фотографий в визарде регистрации
                $('.js__submitButton').off('click').on('click', function() {
                    bbAvatarFormMethods.prepCoord.apply(this, [windowForm, opts, imagePreview, imagePos, maskPos, currentWidth, currentHeight, moveLeft, moveTop]);
                    return false;
                });
            } else {
                // если загрузка фотографий через обычный попап
                windowForm.find('a[rel="submitResult"]').on('click.bbAvatarSave', function() {
                    bbAvatarFormMethods.prepCoord.apply(this, [windowForm, opts, imagePreview, imagePos, maskPos, currentWidth, currentHeight, moveLeft, moveTop]);
                    return false;
                });
            }
        },
        //событие по клику "изменить портрет" на аватарке пользователя
        showForm: function(self, opts) {
            var objectWin = $('<div/>');
            //первый шаг, шаблон для выбора файлов на закачку

            $.when(objectWin.bbTpl("//user/AvatarFormStep1")).then(function() {
                if (!$('div.popup').size()) {
                    $('body').append('<div class="popup css-corner-5 clearfix"></div><div rel="overlay_avatar" class="overlay crop-overlay"></div>');
                }

                var windowForm = $('div.popup');
                windowForm.html(objectWin.html());

				if (opts.type&&opts.type=='community') {
					windowForm.find('.popup-header b').html(bbLang('USER_AVATAR_COMMUNITY_CHANGE'))
				}

                //в случаем если была ошибка загрузки файла отрисовываем шаблон первого шага с информацией об ошибке
                if (opts.upload_error) {
                    windowForm.find('div.pop_up__window_message').prepend('<p class="text-error">' + bbLang('UPLOAD_ERROR') + '</p>');
                    opts.upload_error = false;
                }

                //если не загружен на странице скрипт загрузчика загружаем его
                if (!$('head').find('script[src="' + bbM.stPath('js/uploader.js"]')).size()) {
                    var JSNode = document.createElement('script')
                    JSNode.setAttribute("type", "text/javascript");
                    JSNode.setAttribute("src", bbM.stPath('js/uploader.js'));
                    $('head').append(JSNode);
                }

                //инициализируем загрузчик
                windowForm.find('.js__fileUploaderPlace').bbImageUpload({
                    size: ['770&info'], //задаем итоговый размер полученного изображения (может быть массивом из нескольких размеров)
                    folder: 'tmp', //корневая папка в глустере где будет хранится
                    login: opts.login, //дополнительные параметры, к примеру логин нужне для нанесения watermark

                    //идет загрузка изображения на сервер
                    progress: function() {
                        //второй шаг, на данном этапе отображается процесс загрузки
                        $('<div class="avatar-upload-step-2"></div>').insertBefore(windowForm.find('div.pop_up__window_mid'));
                    },
                    //изображение пользователя загружено и готово к обработке
                    complete: function(result) {
                        //третий шаг, на котором мы формируем аватарку
                        $.when(objectWin.bbTpl("//user/AvatarFormStep2")).then(function() {

                            windowForm.html(objectWin.html());
                            bbAvatarFormMethods.showFormCrop(self, windowForm, opts, result);

                            //подсказка пользователю
                            if (bbM.getCookie('hAvatar')) { //если пользователь скрыл подсказку то мы ее удаляем перед выводом
                                windowForm.find('[rel="HelpContainer"]').remove();
                            } else {
                                //событие на скрытие подсказки
                                windowForm.find('a[rel="helpToolTipClose"]').on('click.bbHelpToolTipClose', function() {
                                    bbM.setCookie('hAvatar', 1);
                                    windowForm.find('[rel="HelpContainer"]').remove();
                                    return false;
                                });
                            }

                            //событие на закрытие формы
                            windowForm.find('a[rel="closePopupWindow"]').on('click.bbAvatarFormClose', function() {
                                bbAvatarFormMethods.closeForm.apply(this, [windowForm]);
                                return false;
                            });

                            //событие на "загрузить другое изображение"
                            windowForm.find('a[rel="newUpload"]').on('click.bbAvatarNewUpload', function() {
                                bbAvatarFormMethods.showForm.apply(this, [self, opts]);
                                return false;
                            });

                        });
                    },
                    //обработчик ошибок загрузчика
                    error: function(error_text) {
                        //console.log(error_text);
                        //ставим признак ошибки загрузки изображения, пользователю будет показана информация об ошибке в шаблоне
                        opts.upload_error = true;
                        return bbAvatarFormMethods.showForm.apply(this, [self, opts]);
                    }
                });

                //событие "закрыть форму"
                windowForm.find('a[rel="closePopupWindow"]').on('click.bbAvatarFormClose', function() {
                    bbAvatarFormMethods.closeForm.apply(this, [windowForm]);
                    return false;
                });
            });
        },
        //закрытие формы
        closeForm: function(windowForm) {
            windowForm.fadeOut(100, function() {
                $(this).remove();
            });
            $('[rel="overlay_avatar"]').remove();
        },
        //сохраняем аватарку пользователя
        prepCoord: function(windowForm, opts, imagePreview, imagePos, maskPos, currentWidth, currentHeight, moveLeft, moveTop) {
            var incRateX = imagePos[2] / currentWidth, //умножитель по ширине
                    incRateY = imagePos[3] / currentHeight, //умножитель по высоте
                    //координаты итогового пересечения
                    x1,
                    y1,
                    x2,
                    y3,
                    //итоговые данный для кропа в кронтроллере
                    resX,
                    resY,
                    resW,
                    resH;

            //console.log(currentWidth, imagePos);
            //console.log(moveLeft, moveTop);

            if (imagePos[2] < currentWidth) { //если zoomIn
                x1 = maskPos[0] - moveLeft;
                if (maskPos[1] <= moveTop || moveTop > 0) { //в верхней части относительно центра
                    y1 = maskPos[1] - Math.abs(moveTop);
                    //console.log('-');
                } else { //в нижней части относительно центра
                    y1 = maskPos[1] + Math.abs(moveTop);
                    //console.log('+');
                }
                //console.log('zoom in');
            } else { //если zoomOut
                x1 = maskPos[0] - moveLeft;
                y1 = maskPos[1] - moveTop;
                //console.log('zoom out');
            }

            //зумируем полученные координаты
            resX = Math.round(x1 * incRateX);
            resY = Math.round(y1 * incRateY);
            resW = Math.round(maskPos[2] * incRateX);
            resH = Math.round(maskPos[3] * incRateY);

            //console.log('incRateX - %O, incRateY - %O, x1 - %O, y1 - %O, maskPos - %O',incRateX, incRateY, x1, y1, maskPos);
            //console.log('resX - %O, resY - %O, resW - %O, resH - %O',resX, resY, resW, resH);

            if (opts.type == 'child') {
                return bbUserChildrenAvatarFormMethods.saveAvatar.apply(this, [windowForm, resX, resY, resW, resH, imagePreview.attr('src')]);
            } else {
                return bbAvatarFormMethods.saveAvatar.apply(this, [windowForm, resX, resY, resW, resH, imagePreview.attr('src')]);
            }
        },
        //сохраняем аватарку
        saveAvatar: function(windowForm, resX, resY, resW, resH, imageSrc) {
            if (windowForm.data('is_send') == 1)
                return false;
            windowForm.data('is_send', 1);

            $.post(bbAvatarFormMethods.paramData.saveAvatarUrl, {
                x: resX,
                y: resY,
                w: resW,
                h: resH,
                src: imageSrc,
                type: 'user'
            }, function(data) {
                windowForm.data('is_send', 0);
                if (data.src) { //если аватарка была изменена, то меняем старые аватарки на странице на новые и закрываем форму
                    bbAvatarFormMethods.paramData.onDoneAvatar(data.src);
                    return bbAvatarFormMethods.closeForm.apply(this, [windowForm]);
                } else { //если в контроллере возникла ошибка
                    console.error('Avatar not saved');
                }
            });
        }
    };

    //Настройки дневника пользователя
    //добавление/редактирование аватарки ребенка пользователя
    $.fn.bbUserChildrenAvatarForm = function(params) {
        return bbUserChildrenAvatarFormMethods.init.apply(this, [params]);
    }

    //методы
    var bbUserChildrenAvatarFormMethods = {
        paramData: {},
        opts: {},
        //инициализируем входный параметров
        init: function(params) {
            var self = this;

            bbUserChildrenAvatarFormMethods.opts = $(this).data();
            bbUserChildrenAvatarFormMethods.paramData = params;

            $(this).on('click.bbChildrenAvatarFormShow', function() {
                bbAvatarFormMethods.showForm.apply(this, [self, bbUserChildrenAvatarFormMethods.opts]);
                return false;
            });
        },
        //сохраняем аватарку
        saveAvatar: function(windowForm, resX, resY, resW, resH, imageSrc) {
            if (windowForm.data('is_send') == 1)
                return false;
            windowForm.data('is_send', 1);

            $.post(bbUserChildrenAvatarFormMethods.paramData.saveAvatarUrl, {
                x: resX,
                y: resY,
                w: resW,
                h: resH,
                src: imageSrc,
                type: 'child',
                child_id: bbUserChildrenAvatarFormMethods.opts.child_id ? bbUserChildrenAvatarFormMethods.opts.child_id : 0
            }, function(data) {
                windowForm.data('is_send', 0);
                if (data.src) { //если аватарка была изменена, то меняем старые аватарки на странице на новые и закрываем форму
                    bbUserChildrenAvatarFormMethods.paramData.onDoneAvatar(data.src);
                    return bbAvatarFormMethods.closeForm.apply(this, [windowForm]);
                } else { //если в контроллере возникла ошибка
                    console.error('Avatar not saved');
                }
            });
        }
    };

    //Журнал пользователя
    //Форма добавления/редактирования поста
    $.fn.bbUserJournalPostForm = function(params) {
        return bbUserJournalPostFormMethods.init.apply(this, [params]);
    };
    //методы
    var bbUserJournalPostFormMethods = {
        init: function(params) {
            var self = this,
                    windowForm = $(this);

            // redactor ini
            windowForm.find('textarea[name="post"]').bbSCEditor('initPost', {login: params.login, folder: 'user'});

            windowForm.append($('<input type="hidden" name="is_ajax" value="1">'))

            windowForm.bbValidateForm({
                preExec: function() {
                    if (!!$.sceditor) {
                        $.sceditor._rangeHelper.removeMarkers();
                        $.sceditor._updateOriginal();
                    }
                },
                onComplete: function(result, windowForm) {
                    if (params.onDone) {
                        params.onDone(result, windowForm);
                    }
                }
            });



            //init select lenta
            BBAPI.dom().select($('input[name="child_id"]')[0], {
                data: params['lentas'] && params['lentas']['data'] ? params['lentas']['data'] : [],
                selected: params['lentas'] && params['lentas']['selected'] ? params['lentas']['selected'] : false
            });

            //init select categories
            BBAPI.dom().select($('input[name="user_cat_id"]')[0], {
                data: params['categories'] && params['categories']['data'] ? params['categories']['data'] : [],
                selected: params['categories'] && params['categories']['selected'] ? params['categories']['selected'] : false
            });


            //show|hide settings form
            var hidden_dates_created = 0;
            windowForm.find('.js__link_settings').off('click').on('click', function() {

                windowForm.find('.js__settings_container').fadeToggle();
                //init select day
                if (!hidden_dates_created) {
                    BBAPI.dom().select($('input[name="lenta_date_day"]')[0], {
                        data: bbM.daySelectData(),
                        selected: params['postDay']
                    });
                    //init select month

                    BBAPI.dom().select($('input[name="lenta_date_month"]')[0], {
                        data: bbM.monthSelectData(),
                        selected: params['postMonth']
                    });

                    //init select year

                    BBAPI.dom().select($('input[name="lenta_date_year"]')[0], {
                        data: bbM.yearSelectData(params['start_year'] ? params['start_year'] : 2004),
                        selected: params['postYear']
                    });
                    hidden_dates_created = 1;
                }
                return false;
            });

            //show|hide groups select

            var user_post_access = windowForm.find('input[name="access"]');
            var group_created = 0;
            var create_group_select = function() {
                if (!group_created) {
                    //init select groups
                    BBAPI.dom().select($('input[name="group"]')[0], {
                        data: params['groups'] && params['groups']['data'] ? params['groups']['data'] : [],
                        selected: params['groups'] && params['groups']['selected'] ? params['groups']['selected'] : false
                    });
                    group_created = 1;
                }
            }

            user_post_access.on('ifChecked', function(event) {
                if ($(this).val() && $(this).val() == '4friend') {
                    windowForm.find('.js__groupsContainer').fadeIn();
                    create_group_select();
                } else {
                    windowForm.find('.js__groupsContainer').fadeOut();
                }
            });


            if (params.access == '4friend') {
                windowForm.find('.js__groupsContainer').fadeIn();
                create_group_select();
            }

            //show|hide new category
            windowForm.find('.js__newcategory_link').off('click').on('click', function() {
                var newcategory = windowForm.find('.js__newcategory_input');
                var categorySelect = windowForm.find('.js__category_select');
                if (newcategory.css('display') == 'none') {
                    categorySelect.hide();
                    newcategory.fadeIn();
                    windowForm.find('[name="user_cat_id"]').attr('disabled', 'disabled');
                    newcategory.find('input').removeAttr('disabled');
                }
                else {
                    newcategory.hide();
                    categorySelect.fadeIn();
                    windowForm.find('[name="user_cat_id"]').removeAttr('disabled');
                    newcategory.find('input').attr('disabled', 'disabled');
                }
                return false;
            });

            // работаем с голосованиеями (открытие/закрытие/удаление сушествующего/добавление ответа)
            windowForm.find('.js__vote_link').off('click').on('click', function() {
                var container = windowForm.find('.js__vote_container');
                if ($(this).hasClass('link-muted')) {
                    var pollId = windowForm.find('input[name="vote_id"]').val();
                    if (pollId && pollId > 0) {
                        windowForm.find('.js__existedAns').remove();
                        windowForm.find('input[name="vote_id"]').val('');
                        windowForm.append($('<input type="hidden" name="vote_id_old" value="' + pollId + '">'));
                        windowForm.find('textarea[name="vote_question"]').val('');
                        windowForm.find('input[name="one_answer"]').attr('checked', false);
                    }
                    container.fadeOut();
                    $(this).removeClass('link-muted').find('span').text(bbLang('USER_SETPOST_VODE_ADD'));
                }
                else {
                    container.fadeIn();
                    $(this).addClass('link-muted').find('span').text(bbLang('USER_SETPOST_VODE_DEL'));
                }
                windowForm.find('.js__vote_addanswer').off('click').on('click', function() {
                    var bbVotenewAnswer = $('<div/>');
                    $.when(bbVotenewAnswer.bbTpl("//user/PostFormVoteAnswer")).then(function() {
                        windowForm.find('.js__vote_answerContainer').before(bbVotenewAnswer.html());
                    });
                    return false;
                });
                return false;
            });
            if (params.votePreopen) {
                windowForm.find('.js__vote_link').trigger('click');
            }

            windowForm.find('.js__2draft').off('click').on('click', function() {
                windowForm.append($('<input type="hidden" name="2draft" value="1">'));
                windowForm.submit();
                return false;
            });
        }
    };



    //Дневник пользователя
    //Закладки Folder
    $.fn.bbUserBookmarkFolder = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserBookmarkFolderMethods.initAdd.apply(this, [arguments[0]]);
        } else if (bbUserBookmarkFolderMethods[method]) {
            bbUserBookmarkFolderMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserBookmarkFolder');
        }

        return this;
    }

    var bbUserBookmarkFolderMethods = {
        //инициализируем входные параметры и события
        initAdd: function(params) {
            var self = $(this);

            self.find('.js__addBookmarkFolder').on('click.addBookmarkFolder', function() {
                self.css('display', 'none');
                bbUserBookmarkFolderMethods.addFolder.apply(this, [self, params]);
                return false;
            });
        },
        initEdit: function(params) {
            var self = $(this);

            self.find('.js__editBookmarkFolder').on('click.editBookmarkFolder', function() {
                params.title = self.find('.js__bookMarkTitle').text();

                self.css('display', 'none');
                bbUserBookmarkFolderMethods.editFolder.apply(this, [self, params]);
                return false;
            });
        },
        //форма добавления новой папки
        addFolder: function(self, params) {
            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/BookmarkFolderAdd")).then(function() {

                var windowForm = $(objectWin.html()).insertAfter(self);

                //валидация формы
                windowForm.attr('action', params.submitUrl);
                windowForm.bbValidateForm({
                    errorTextPosition: 'top',
                    onComplete: function(rowId) {
                        var rowName = windowForm.find('input[name="name"]').val();

                        if (params.onDone) {
                            params.onDone(rowId, rowName);
                        }
                        bbUserBookmarkFolderMethods.restoreSelf.apply(this, [self, windowForm]);
                        bbM.flashEvent(bbLang('USER_BOOKMARK_FOLDER_ADDED'), true);
                    }
                });

                //событие "отмена"
                windowForm.find('.js__cancelClick').on('click.cancelClick', function() {
                    bbUserBookmarkFolderMethods.restoreSelf.apply(this, [self, windowForm]);
                    return false;
                });
            });
        },
        restoreSelf: function(self, windowForm) {
            windowForm.remove();
            self.css('display', 'block');
        },
        //форма редактирования папки
        editFolder: function(self, params) {

            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/BookmarkFolderEdit")).then(function() {

                var windowBlock = $(objectWin.html()).insertAfter(self);
                var windowForm = windowBlock.find('form');

                //валидация формы
                windowForm.attr('action', params.submitUrl);
                windowForm.find('input[name="folder_id"]').val(params.folderId);
                windowForm.find('input[name="name"]').val(params.title);
                windowForm.bbValidateForm({
                    errorTextPosition: 'top',
                    onComplete: function(rowId) {
                        var rowName = windowForm.find('input[name="name"]').val();

                        if (params.onDoneUpdate) {
                            params.onDoneUpdate(self, rowName);
                        }
                        bbUserBookmarkFolderMethods.restoreSelf.apply(this, [self, windowBlock]);
                        bbM.flashEvent(bbLang('SAVED'), true);
                    }
                });

                //событие "удалить"
                windowForm.find('a.js__deleteClick').on('click.deleteClick', function() {
                    bbUserBookmarkFolderMethods.deleteFolder.apply(this, [params]);
                    return false;
                });

                //событие "отмена"
                windowForm.find('a.js__cancelClick').on('click.cancelClick', function() {
                    bbUserBookmarkFolderMethods.restoreSelf.apply(this, [self, windowBlock]);
                    return false;
                });
            });
        },
        deleteFolder: function(params) {
            var conf = params.countBookmarks == 0 ? confirm(bbLang('CONFIRM_DELETE')) : confirm(bbLang('USER_BOOKMARK_FOLDER_CONFIRM_DELETE'));
            if (conf) {
                $.get(params.deleteUrl, function() {
                    if (params.onDoneDelete) {
                        params.onDoneDelete();
                    }
                });
            }
        }
    };


    //Дневник пользователя
    //Слежение за постом
    $.fn.bbUserLook = function(method) {
        if (typeof method === 'object' || !method) {
            bbUserLookMethods.initEdit.apply(this, [arguments[0]]);
        } else if (bbUserLookMethods[method]) {
            bbUserLookMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserLook');
        }

        return this;
    }

    var bbUserLookMethods = {
        // инициализируем клики на элементе
        init: function(params) {
            $(this).on('click.bbLookClick', function() {
                var $self = $(this);

                //если у нас есть соответствующий класс - удаляем слежение
                if ($self.hasClass('active')) {
                    bbUserLookMethods.deleteLook.apply(this, [$self, params]);
                    if (params.selectorForHide) {
                        $self.parents(params.selectorForHide).remove();
                    }
                } else {
                    bbUserLookMethods.addLook.apply(this, [$self, params]);
                }
                return false;
            });
        },
        //форма добавления закладки
        addLook: function(self, params) {
            $.post(params.addLookUrl, {
                type: self.data('type'),
                shard_object_id: self.data('shard_object_id'),
                post_id: self.data('post_id'),
                url: self.data('url')
            }, function() {
                self.addClass('active');
                bbUserLookMethods.init.apply(this, [params]);
                bbM.flashEvent(bbLang('LOOK_ADD_EVENT'), true);
            });
        },
        //удаление слежени
        deleteLook: function(self, params) {
            $.post(params.deleteLookUrl, {
                type: self.data('type'),
                shard_object_id: self.data('shard_object_id'),
                post_id: self.data('post_id')
            }, function() {
                self.removeClass('active');
                bbUserLookMethods.init.apply(this, [params]);
                bbM.flashEvent(bbLang('LOOK_DELETE_EVENT'), true);
            });
        }
    }


    //Дневник пользователя
    //Закладки
    $.fn.bbUserBookmark = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserBookmarkMethods.initEdit.apply(this, [arguments[0]]);
        } else if (bbUserBookmarkMethods[method]) {
            bbUserBookmarkMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserBookmark');
        }

        return this;
    }

    var bbUserBookmarkMethods = {
        // инициализируем клики на элементе
        init: function(params) {
            $(this).on('click.bbBookmark', function() {
                var $self = $(this);

                //если у нас есть класс активности - удаляем букмарк
                if ($self.hasClass('active')) {
                    bbUserBookmarkMethods.deleteBookmark.apply(this, [$self, params]);
                } else {
                    if ($self.hasClass('open')) {
                        $self.parents().find('.js__BookmarkAdd').remove();
                        $self.removeClass('open').children().removeClass("icon-checked");
                    } else {
                        bbUserBookmarkMethods.addBookmark.apply(this, [$self, params]);
                    }
                }
                return false;
            });
        },
        initEdit: function(params) {
            var self = $(this);

            self.find('b.js__editBookmark').on('click.editBookmark', function() {
                params.title = self.find('a.js__bookMarkName').text();
                params.url = self.find('a.js__bookMarkName').attr('href');

                self.css('display', 'none');
                bbUserBookmarkMethods.editBookmark.apply(this, [self, params]);
                return false;
            });
        },
        //форма добавления закладки
        addBookmark: function(self, params) {
            self.addClass('open').children().addClass("icon-checked");
            //отрисовываем шаблон
            var objectWin = $('<div/>');

            $.when(objectWin.bbTpl("//user/BookmarkAdd", {})).then(function() {

                var windowBookmark = $(objectWin.html()).insertAfter(self).css({display: 'block', opacity: '1'});
                var windowForm = windowBookmark.find('form');

                windowForm.attr('action', params.submitUrl);
                //init select folder
                $.get(params.getFolderUrl, function(result) {
                    //добавляем данные к result
                    result.push({
                        value: '',
                        text: '---'
                    });
                    result.push({
                        value: 0,
                        text: bbLang('CREATE_FOLDER')
                    });


                    BBAPI.dom().select(windowBookmark.find('input[name="folder_id"]')[0], {
                        data: result,
                        onFocus: {
                            "0": function() {
                                windowBookmark.find('div[rel="newFolderBlock"]').slideDown();
                            }
                        },
                        onBlur: {
                            "0": function() {
                                windowBookmark.find('div[rel="newFolderBlock"]').slideUp();
                                windowBookmark.find('[name="folder_new"]').val('');
                            }
                        }
                    });

                    windowBookmark.find('input[name="url"]').val(self.data('url'));
                    windowBookmark.find('input[name="name"]').val(self.data('title'));

                    windowForm.bbValidateForm({
                        onComplete: function(rowId) {
                            self.addClass('active');
                            windowBookmark.remove();
                            bbM.flashEvent(bbLang('BOOKMARK_ADD_EVENT'), true);
                        }
                    });

                    windowBookmark.show();

                    /*
                     $(self).parents('.js__postLenta').mouseleave( function () {
                     self.removeClass('open');
                     windowBookmark.remove();
                     });
                     */

                }, 'json');
            });

        },
        //форма редактирования закладки
        editBookmark: function(self, params) {

            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/BookmarkEdit")).then(function() {

                var windowBlock = $(objectWin.html()).insertAfter(self);
                var windowForm = windowBlock.find('form');

                //init select folder
                $.get(params.getFolderUrl, function(result) {
                    BBAPI.dom().select(windowForm.find('input[name="folder_id"]')[0], {data: result, selected: params.folderId && params.folderId != 0 ? params.folderId : false});
                }, 'json');

                windowForm.find('input[name="name"]').val(params.title);

                //валидация формы
                windowForm.attr('action', params.submitUrl + self.data('id'));
                windowForm.bbValidateForm({
                    errorTextPosition: 'top',
                    onComplete: function(rowId) {
                        var rowName = windowForm.find('input[name="name"]').val();
                        var folderId = windowForm.find('input[name="folder_id"]').val();

                        if (params.onDoneUpdate) {
                            params.onDoneUpdate(self, rowName, folderId);
                        }
                        bbUserBookmarkMethods.restoreSelf.apply(this, [self, windowBlock]);
                        bbM.flashEvent(bbLang('BOOKMARK_EDIT_EVENT'), true);
                    }
                });

                //событие "удалить"
                windowForm.find('a.js__deleteClick').on('click.deleteClick', function() {
                    $.post(params.deleteUrl, {
                        'url': params.url
                    }, function() {
                        self.remove();
                        windowBlock.remove();
                        bbM.flashEvent(bbLang('BOOKMARK_DELETE_EVENT'), true);
                    });
                    return false;
                });

                //событие "отмена"
                windowForm.find('a.js__cancelClick').on('click.cancelClick', function() {
                    bbUserBookmarkMethods.restoreSelf.apply(this, [self, windowBlock]);
                    return false;
                });
            });
        },
        //удаление закладки
        deleteBookmark: function(self, params) {
            $.post(params.deleteUrl, {
                url: self.data('url')
            }, function() {
                self.removeClass('active');
                self.children().removeClass('icon-checked');
                bbUserBookmarkMethods.init.apply(this, [params]);
                bbM.flashEvent(bbLang('BOOKMARK_DELETE_EVENT'), true);
            });
        },
        restoreSelf: function(self, windowForm) {
            windowForm.remove();
            self.css('display', 'block');
        }
    };


    //Дневник пользователя - Новости
    //Уведомления
    $.fn.bbUserNotify = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserNotifyMethods.init.apply(this, [arguments[0]]);
        } else if (bbUserNotifyMethods[method]) {
            bbUserNotifyMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserNotify');
        }

        return this;
    }

    var bbUserNotifyMethods = {
        init: function(params) {
            //console.log('bbUserNotify init', params);
        },
        //очищаем все уведомления у пользователя
        clearAll: function(params) {
            var self = $(this);
            var sendUrl = self.attr('href');

            self.on('click.clearAll', function() {
                $.get(sendUrl, function(result) {
                    if (params.onDone) {
                        params.onDone(self);
                    }
                });

                return false;
            });
        },
        //очищаем выбранное уведомление у пользователя
        clearOneComment: function(params) {
            $(this).on('click.clearOneComment', function() {
                var self = $(this);
                var sendUrl = self.attr('href');
                var data = self.data();

                $.post(sendUrl, {comment_id: data.comment_id, object_type: data.object_type, object_id: data.object_id, shard_object_id: data.shard_object_id}, function(result) {
                    if (params.onDone) {
                        params.onDone(self);
                    }
                });

                return false;
            });
        }
    };


    //Дневник пользователя
    //Поиск
    $.fn.bbUserSearch = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserSearchMethods.init.apply(this, [arguments[0]]);
        } else if (bbUserSearchMethods[method]) {
            bbUserSearchMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserSearch');
        }

        return this;
    }

    var bbUserSearchMethods = {
        init: function(params) {
            //console.log('bbUserSearch init', params);
        },
        initLeftMenu: function(params) {
            var self = $(this);
            self.on('click.searchJornal', function() {
                if (!$('#journalSearchForm').size()) {
                    params.searchUrl = self.attr('href');
                    bbUserSearchMethods.showForm.apply(this, [params]);
                }

                return false;
            });
        },
        initRightColl: function(params) {
            var self = $(this);

            params.searchUrl = $(this).attr('href');
            bbUserSearchMethods.showForm.apply(this, [params]);
        },
        initSelect: function(params) {
            //init category select
            var categoryData = [];

            categoryData.push({
                value: 0,
                text: bbLang('USER_SEARCH_CHOOSE_CATEGORY')
            });
            $(params.categorySelector).find('a').each(function() {
                var row = $(this);
                categoryData.push({
                    value: "" + row.data('id'),
                    text: row.text()
                });
            });

            BBAPI.dom().select(this.find('input[name="category"]')[0], {
                data: categoryData,
                selected: params.categoryId
            });

            //init period select
            BBAPI.dom().select(this.find('input[name="period"]')[0], {
                data: [
                    {'value': '1', 'text': bbLang('USER_SEARCH_LAST_MONTH')},
                    {'value': '3', 'text': bbLang('USER_SEARCH_LAST_3_MONTH')},
                    {'value': '6', 'text': bbLang('USER_SEARCH_LAST_HALF_YEAR')},
                    {'value': '12', 'text': bbLang('USER_SEARCH_LAST_YEAR')},
                    {'value': '0', 'text': bbLang('USER_SEARCH_ALL_TIME')}
                ],
                selected: params.periodVal
            });
        },
        showForm: function(params) {
            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/searchForm", {})).then(function() {
                var windowForm = $(objectWin.html()).prependTo('.blog');

                windowForm.find('input[name="category"]').val(params.categoryId);

                if (params.isSearched && (params.categoryId != 0 || params.periodVal != 0)) {
                    windowForm.find('#search-more').hide(0, function() {
                        $("#search-advanced").show(0);
                        bbUserSearchMethods.initSelect.apply(windowForm, [params]);
                        return false;
                    });
                } else {
                    windowForm.find('#search-more').on('click', function() {
                        $(this).fadeOut('middle', function() {
                            $("#search-advanced").fadeIn('middle');
                            bbUserSearchMethods.initSelect.apply(windowForm, [params]);
                        });
                        return false;
                    });
                }

                windowForm.attr('action', params.searchUrl);

                windowForm.find('input[name="query"]').val(params.queryVal);

                windowForm.submit(function() {
                    var el = windowForm.find('input[name="query"]');
                    var elValTrimmed = bbM.trim(el.val());
                    if (elValTrimmed && elValTrimmed.length > 2) {
                        return true
                    } else {
                        el.parent().wrap('<div class="_dataerror"></div>');

                        //если сообщение об ошибке не было, то выводим его
                        if (!$('#' + el.attr('name') + '_error').size()) {
                            $('<span id="query_error" class="_err _err-tp">Поле должно быть заполнено</span>').insertAfter(el);
                        }

                        //убираем ошибки при фокусе на проблемном поле
                        el.focus(function() {
                            $(this).removeClass('error');
                            $('#' + $(this).attr('name') + '_error').fadeOut('slow', function() {
                                $(this).remove();
								el.parent().unwrap('<div class="_dataerror"></div>');
								el.focus();
                            });
                        });
                        return false;
                    }
                });
            });
        }
    };


    //Дневник пользователя
    //Архив
    $.fn.bbUserArchive = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserArchiveMethods.init.apply(this, [arguments[0]]);
        } else if (bbUserArchiveMethods[method]) {
            bbUserArchiveMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserArchive');
        }

        return this;
    }

    var bbUserArchiveMethods = {
        init: function(params) {
            //console.log('bbUserArchive init', params);
        },
        //очищаем все уведомления у пользователя
        initLeftMenu: function(params) {
            var self = $(this),
                    today = new Date(),
                    regdate = new Date(params.regDate.replace(/-/g, "/")),
                    menu = [];
            for (var curYear = today.getFullYear(); curYear >= regdate.getFullYear(); curYear--) {
                var tempEl = {
                    'title': curYear,
                    'months': []
                };
                var maxMonth = (curYear == today.getFullYear() ? today.getMonth() : 11) + 1;
                for (var month = 1; month <= maxMonth; month++) {
                    tempEl.months.push({
                        'url': month,
                        'title': bbLang('MONTHES_INFINITIVE')[month]
                    });
                }
                menu.push(tempEl);
            }

            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/menuArchive", {
                years: menu,
                link: params.link,
                login: params.login,
                archiveYear: params.archiveYear,
                archiveMonth: params.archiveMonth
            })).then(function(fileData) {

                var windowForm = self.html(objectWin.html());
                windowForm.find('a[rel="archiveYearClick"]').on('click.slideArchive', function() {
                    $(this).next().fadeToggle(100);
                    return false;
                });

                if (params.archiveYear) {
                    self.removeClass('hidden');
                }

                return this;
            });

            return false;
        }
    };


    //Дневник пользователя
    //Toolbar buttons in post
    $.fn.bbUserPostButton = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserPostButtonMethods.init.apply(this, [arguments[0]]);
        } else if (bbUserPostButtonMethods[method]) {
            bbUserPostButtonMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserPostButton');
        }

        return this;
    }

    var bbUserPostButtonMethods = {
        initTrash: function(params) {
            var self = $(this);
            self.find('.js__recoverClick').on('click.recoverClick', function() {
                var postBlock = $(this).parents(self.selector);
                bbUserPostButtonMethods.recoveryPost.apply(this, [postBlock, params]);
                return false;
            });
            self.find('.js__deleteClick').on('click.deleteClick', function() {
                if (confirm(bbLang('USER_TRASH_CONFIRM_DELETE_MESSAGE'))) {
                    var postBlock = $(this).parents(self.selector);
                    bbUserPostButtonMethods.deleteTrashPost.apply(this, [postBlock, params]);
                }
                return false;
            });
        },
        //восстановление поста из корзины
        recoveryPost: function(self, params) {
            var formData = self.data();
            var objectWin = $('<div/>');

            $.post(params.recoveryUrl, {action: 'recovery', post_id: formData.object_id}, function() {
                if (params.onDoneRecovery) {
                    params.onDoneRecovery(self);
                }

                bbM.flashEvent(bbLang('USER_POST_RECOVERY_EVENT'), true);
            });
        },
        //удаление поста из корзины
        deleteTrashPost: function(self, params) {
            var formData = self.data();
            var objectWin = $('<div/>');

            $.post(params.deleteUrl, {action: 'delete', post_id: formData.object_id}, function() {
                if (params.onDoneDelete) {
                    params.onDoneDelete(self);
                }
            });
        },
        initDotButton: function(params) {
            $(this).on('click.dotButtonClick', function() {
                var self = $(this);
                var postBlock = self.parents('.js__postLenta');

                postBlock.find('.js__deleteClick').on('click.deletePost', function() {
                    params.deleteUrl = $(this).attr('href');
                    bbUserPostButtonMethods.deletePost.apply(this, [postBlock, params]);
                    return false;
                });

                postBlock.find('.js__editClick').on('click.editPost', function() {
                    window.location.href = $(this).attr('href');
                });

                self.prevAll('a.hidden').fadeToggle(100);
                self.remove();
                return false;
            });
        },
        //удаление поста из дневника
        deletePost: function(postBlock, params) {
            var formData = postBlock.data();
            var objectWin = $('<div/>');

            $.post(params.deleteUrl, {action: 'delete', post_id: formData.object_id}, function() {
                $.when(objectWin.bbTpl("//user/deletePost", {id: formData.object_id, trashUrl: params.trashUrl})).then(function() {
                    postBlock.fadeOut('fast', function() {
                        var deleteBlock = $(objectWin.html()).insertAfter(postBlock);
                        //document.location.href = '#trash_'+formData.object_id;

                        deleteBlock.find('.js__recoverPost').on('click.recoverPostClick', function() {
                            $.post(params.trashUrl + '/post', {action: 'recovery', post_id: formData.object_id}, function() {
                                deleteBlock.remove();
                                postBlock.fadeIn('fast');
                            });

                            return false;
                        });
                    });
                });
            });
        },
        //инициализация в черновиках
        initDraft: function(params) {
            var self = $(this);
            self.find('.js__deleteClick').off('click').on('click', function() {
                if (confirm(bbLang('USER_DRAFT_CONFIRM_DELETE'))) {
                    var postBlock = $(this).parents(self.selector);
                    bbUserPostButtonMethods.deleteDraftPost.apply(this, [$(this).attr('href'), postBlock, params]);
                }
                return false;
            });
        },
        //удаление поста из черновиков
        deleteDraftPost: function(delUrl, self, params) {
            var formData = self.data();
            var objectWin = $('<div/>');

            $.post(delUrl, {}, function() {
                if (params.onDoneDelete) {
                    params.onDoneDelete(self);
                }
            });
        }
    };


    $.fn.bbUseFriendRelation = function(params) {
        var $self = $(this);

        $self.on('click', function() {

            //$('.js__sendMessagePopup').remove();
            if ($('.js__relationPopup').html()) {
                $('.js__relationPopup').remove();
                $self.removeClass('active');
            } else {

                var popupWindow = $("<div />");
                $.when(popupWindow.bbTpl("//user/friendRelationPopup")).then(function(r) {
                    $self.addClass('active');

                    var popupObj = $(popupWindow.html()).insertAfter($self);
                    popupObj.css({opacity: 1, display: 'none', top: "35px", left: "13px"});

                    var popupContent = popupObj.find('.js__popupcontent');
                    $.ajax(params.relationUrl, {
                        type: "POST",
                        data: {user_id: params.user_id},
                        dataType: 'json',
                        success: function(response) {
                            if (response) {
                                if (response.friend) {
                                    var tplRenderer = $("<div />");
                                    $.when(tplRenderer.bbTpl("//user/friendRelationUnfriend")).then(function(r) {
                                        popupContent.prepend(tplRenderer.html());
                                        popupObj.css({display: 'block'});
                                    });
                                }
                                else {
                                    if (!response.offer) {
                                        var tplRenderer = $("<div />");
                                        $.when(tplRenderer.bbTpl("//user/friendRelationOfferFriendship")).then(function(r) {
                                            popupContent.prepend(tplRenderer.html());
                                            popupObj.css({display: 'block'});
                                        });
                                    }
                                    if (response.subscriber) {
                                        var tplRenderer = $("<div />");
                                        $.when(tplRenderer.bbTpl("//user/friendRelationUnsubscribe")).then(function(r) {
                                            popupContent.prepend(tplRenderer.html());
                                            popupObj.css({display: 'block'});
                                        });
                                    }
                                    else {
                                        if (!response.offer) {
                                            var tplRenderer = $("<div />");
                                            $.when(tplRenderer.bbTpl("//user/friendRelationOfferSubscribe")).then(function(r) {
                                                popupContent.prepend(tplRenderer.html());
                                                popupObj.css({display: 'block'});
                                            });
                                        }
                                        else {
                                            var tplRenderer = $("<div />");
                                            $.when(tplRenderer.bbTpl("//user/friendRelationAlreadyOffered")).then(function(r) {
                                                popupContent.prepend(tplRenderer.html());
                                                popupObj.css({display: 'block'});
                                            });
                                        }
                                    }
                                }
                                popupObj.find('.js__relationChange').off('click').on('click', function() {
                                    var sendParams = {
                                        friend_id: params.user_id,
                                        direction: $(this).data('direction')
                                    };
                                    $.ajax(params.changeUrl, {
                                        type: "POST",
                                        data: sendParams,
                                        dataType: 'json',
                                        success: function(resp) {
                                            $self.click().click();
                                        }
                                    });
                                    return false;
                                });
                            }
                            popupObj.find('.js__loading').html(bbLang('USER_FRIENDS_POPUP_LOADING_ERROR')).remove();
                        }
                    });
                });
            }
            return false;
        });

        return false;
    };

    $.fn.bbUserMessagePopup = function(params) {
        var $self = $(this);

        $self.on('click', function() {
            window.open($(this).attr('href'), 'msg', 'height=500, width=800, top=300,left=400,status=yes,toolbar=no,menubar=no,location=yes, resizable=yes');
            return false;
        });

        return false;
    }

    $.fn.bbUserMessageQuickSend = function(params) {
	    var $self = $(this);

	    $self.on('click', function() {

				    var $windowForm = null;
				    var layout = $('<div id="modalWindow" class="popup css-corner-3 clearfix" style="z-index: 50001;">\n\
					    <form id="windowForm" method="post" enctype="multipart/form-data">\n\
								<div class="popup-header rel">\n\
										    <b class="_18 _it _georgia">Отправляем сообщение</b>\n\
							    <a class="icon icon-popup-close db abs" title="" href="#"></a>\n\
							  </div>\n\
							    <div class="comment oh rel clearfix ml2" rel="userdata"></div>\n\
							    <input type="hidden" name="login" value="">\n\
							    <div class="pseudo-textarea css-corner-3 sh-1 clearfix mt1 ml2 mr2 mb2"><textarea class="x21">'+bbLang('USER_MESSAGE_NEW_MESSAGE')+'</textarea></div>\n\
							    <div class="popup-footer rel"><a href="#" rel="allchat" class="pt1">Показать переписку</a><button href="#" class="btn _bd  _b _b_s _b_btn _13 noi sgn css-corner-3 fr mb0 ml0" rel="sendmessage">Отправить </button></div>\n\
							</form>\n\
					  </div>');

				    BBAPI.css.style(layout[0], {
					    "position": "absolute",
					    "marginTop": 0,
					    "top": BBAPI.utils.scrollTop() + 100 + "px"
				    });

				    $windowForm = layout.appendTo('body');
				    var $bg = $('<div class="overlay crop-overlay" style="z-index: 50000;"></div>').appendTo('body');

				    layout.find("a.icon-popup-close").on('click.closeModal', function(e) {
					    e.stopPropagation();
					    if ($windowForm) {
						    $windowForm.remove();
						    $bg.remove();
					    }
					    return false;
				    });
				    if (!$windowForm){
					    //console.log(2);
					    return false;
				    }
				    $windowForm.find('textarea').focus(function(){
					    if ($(this).html()==bbLang('USER_MESSAGE_NEW_MESSAGE')){
						    $(this).html('');
					    }
				    }).blur(function(){
						    if ($(this).html()==''){
							    $(this).html(bbLang('USER_MESSAGE_NEW_MESSAGE'));
						    }
					    });
				    if ($self.data('login')){
					    $windowForm.find('input[name="login"]').val($self.data('login'));
				    }
				    $windowForm.find('[rel="allchat"]').attr('href', '/user/message/chat/#'+$self.data('login'));
				    $windowForm.find('[rel="sendmessage"]').off('click').on('click',function(){
					    var el = $('<div>'+ $windowForm.find('textarea').val().split("\n").join('<br>').striptags('<img><p><br><b><div>') +'</div>');
					    el.find('*').each(function(el){
						    $(this).removeAttr('style').removeAttr('class');
					    });
					    var sendParams = {
						    sendUser: $windowForm.find('input[name="login"]').val(),
						    message: el.html().linkify()
					    };

					    if (!sendParams.sendUser){
						    bbM.flashEvent(bbLang('USER_MESSAGE_QUICK_LOGIN_NOT_SET'));
					    }
					    else{
						    if (sendParams.message && sendParams.message != bbLang('USER_MESSAGE_NEW_MESSAGE') && sendParams.message != bbLang('USER_MESSAGE_USER_DELETED') && sendParams.message != bbLang('USER_MESSAGE_FORBIDDEN')){
							    $(this).off('click');
							    $.ajax('/user/message/ajax_sendmessage', {
								    type: "POST",
								    data: sendParams,
								    dataType: 'json',
								    statusCode: {
									    403: function(){
										    if ($windowForm) {
											    $windowForm.remove();
											    $bg.remove();
										    }
										    bbM.flashEvent(bbLang('USER_MESSAGE_FORBIDDEN'));
									    },
									    400: function(){
										    if ($windowForm) {
											    $windowForm.remove();
											    $bg.remove();
										    }
										    bbM.flashEvent('Ошибка отправки');
									    }
								    },
								    success: function (response) {
									    if ($windowForm) {
										    $windowForm.remove();
										    $bg.remove();
									    }
									    bbM.flashEvent(bbLang('USER_MESSAGE_SEND_SUCCESS'), 1);
								    }
							    });
						    }
						    else{
							    bbM.flashEvent(bbLang('USER_MESSAGE_QUICK_MESSAGE_NOT_SET'));
						    }
					    }
					    return false;
				    });
				    $.ajax('/user/info/ajax_get/'+$self.data('login'), {
					    type: "GET",
					    dataType: 'json',
					    success: function (response) {
						    $.when($windowForm.find('[rel="userdata"]').bbTpl("//user/quickMessageUserData",response)).then(function() {});
					    }
				    });

				return false;
	    });
	    return false;
    };

    $.fn.bbVoteInit = function(params) {
        var self = $(this);
        if (self.data('showresult')) {
            $.ajax(self.data('result_url'), {
                type: "POST",
                data: {
                    poll_id: self.attr('rel'),
                    login: self.data('login')
                },
                dataType: 'html',
                success: function(resp) {
                    self.html(resp);
                }
            });
        } else {

            self.find('form').off('submit').on('submit', function() {
                    var answers = [];
                    self.find('input[type="radio"],input[type="checkbox"]').each(function() {
                        if ($(this).attr('checked')) {
                            answers.push($(this).attr('value'));
                        }
                    });
                    if (answers.length < 1) {
                        alert(bbLang('USER_VOTE_MINIMUM_ONE_ANSWER'));
                    }
                    else {
                        $.ajax(self.find('form').attr('action'), {
                            type: "POST",
                            data: {
                                poll_id: self.attr('rel'),
                                post_id: self.data('post_id'),
                                login: self.data('login'),
                                answers: answers
                            },
                            dataType: 'html',
                            success: function(resp) {
                                self.html(resp);
                            }
                        });
                    }
                return false;
            });
        }
        return this;
    }


    //Сообщество
    //Поиск
    $.fn.bbCommunitySearch = function(method) {

        if (typeof method === 'object' || !method) {
            bbCommunitySearchMethods.init.apply(this, [arguments[0]]);
        } else if (bbCommunitySearchMethods[method]) {
            bbCommunitySearchMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunitySearch');
        }

        return this;
    }

    var bbCommunitySearchMethods = {
        init: function(params) {
            //console.log('bbCommunitySearch init', params);
        },
        initLeftMenu: function(params) {
            var self = $(this);
            self.find('a').on('click.searchCommunity', function() {
                if (!$('.js__searchForm').size()) {
                    params.searchUrl = $(this).attr('href');
                    bbCommunitySearchMethods.showForm.apply(this, [params]);
                }

                return false;
            });
        },
        initRightColl: function(params) {
            var self = $(this);

            params.searchUrl = $(this).attr('href');
            bbCommunitySearchMethods.showForm.apply(this, [params]);
        },
        initSelect: function(params) {
            //init category select
            var categoryData = [];

            categoryData.push({
                value: 0,
                text: bbLang('USER_SEARCH_CHOOSE_CATEGORY')
            });
            $(params.categorySelector).find('a').each(function() {
                var row = $(this);
                categoryData.push({
                    value: "" + row.data('id'),
                    text: row.text()
                });
            });


            BBAPI.dom().select(this.find('input[name="category"]')[0], {
                data: categoryData,
                selected: params.categoryId
            });

            //init period select
            BBAPI.dom().select(this.find('input[name="period"]')[0], {
                data: [
                    {'value': '1', 'text': bbLang('USER_SEARCH_LAST_MONTH')},
                    {'value': '3', 'text': bbLang('USER_SEARCH_LAST_3_MONTH')},
                    {'value': '6', 'text': bbLang('USER_SEARCH_LAST_HALF_YEAR')},
                    {'value': '12', 'text': bbLang('USER_SEARCH_LAST_YEAR')},
                    {'value': '0', 'text': bbLang('USER_SEARCH_ALL_TIME')}
                ],
                selected: params.periodVal
            });
        },
        showForm: function(params) {
            var tplData = {
                isCommunity: params.isCommunity
            };

            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//community/searchForm", tplData)).then(function() {

                var windowForm = $(objectWin.html()).prependTo('.js__content_center');

                windowForm.find('input[name="category"]').val(params.categoryId);

                if (params.isSearched && (params.categoryId != 0 || params.periodVal != 0)) {
                    windowForm.find('#search-more').hide(0, function() {
                        $("#search-advanced").show(0);
                        bbCommunitySearchMethods.initSelect.apply(windowForm, [params]);
                        return false;
                    });
                } else {
                    windowForm.find('#search-more').on('click', function() {
                        $(this).fadeOut('middle', function() {
                            $("#search-advanced").fadeIn('middle');
                            bbCommunitySearchMethods.initSelect.apply(windowForm, [params]);
                        });
                        return false;
                    });
                }

                windowForm.attr('action', params.searchUrl);

                windowForm.find('input[name="query"]').val(params.queryVal);

                windowForm.submit(function() {
                    var el = windowForm.find('input[name="query"]');
                    var elValTrimmed = bbM.trim(el.val());
                    if (elValTrimmed && elValTrimmed.length > 2) {
                        return true
                    } else {
                        el.parent().wrap('<div class="_dataerror"></div>');

                        //если сообщение об ошибке не было, то выводим его
                        if (!$('#' + el.attr('name') + '_error').size()) {
                            $('<span id="query_error" class="_err _err-tp">Поле должно быть заполнено</span>').insertAfter(el);
                        }

                        //убираем ошибки при фокусе на проблемном поле
                        el.focus(function() {
                            $(this).removeClass('error');
                            $('#' + $(this).attr('name') + '_error').fadeOut('slow', function() {
                                $(this).remove();
                                el.parent().unwrap('<div class="_dataerror"></div>');
                                el.focus();
                            });
                        });
                        return false;
                    }
                });
            });
        }
    };

    $.fn.bbUserBookmarkCommunities = function(params) {
        $.each($(this), function() {
            var self = $(this);
            self.off('click').on('click', function() {
                var direction = self.parent().hasClass('selected') ? 'del' : 'add';
                $.ajax(params.url, {
                    type: "POST",
                    data: {
                        id: self.data('id'),
                        direction: direction
                    },
                    success: function(response) {
                        if (direction == 'del') {
                            self.parent().removeClass('selected');
                        }
                        else {
                            self.parent().addClass('selected');
                        }
                    }
                });
                return false;
            });
        });
        return this;
    }

    $.fn.bbSearchSort = function() {
        $('.js__searchsort').off('click').on('click', function() {
            var url = $(this).find('a').attr('href');
            document.location.href = url;
            return false;
        });
    };

    $.fn.bbAvatarPopup = function(options) {
        var popupDelay = 400;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);
            if (!hoverObject.data('login') && !options.withAnonim)
                return;

            timerId = setTimeout(function() {
                $(".js__userAvatarPopup").remove();
                if (userPopupCommentCache[hoverObject.data('login')]) {
                    var element = $("<div class='js__userAvatarPopup abs x50'/>");
                    $.when(element.bbTpl("//comment/commentPopupAvatar", userPopupCommentCache[hoverObject.attr('href')])).then(function() {

                        if (hoverObject.hasClass('user_link_post')) { //если упоминание о пользователе
                            var inserted = element.appendTo('body');
                            inserted.css({
                                top: hoverObject.offset().top - 50,
                                left: hoverObject.offset().left
                            });
                        } else { //аватарка у поста/комментария
                            element.appendTo(hoverObject);
                        }

                    });
                } else {
                    if (hoverObject.data('login')) {
                        $.ajax((options.url ? options.url : '/user/info/ajax_get/') + hoverObject.data('login'), {
                            type: "POST",
                            data: {is_ajax: 1},
                            success: function(response) {
                                userPopupCommentCache[hoverObject.attr('href')] = response;
                                var element = $("<div class='js__userAvatarPopup abs x50'/>");
                                $.when(element.bbTpl("//comment/commentPopupAvatar", response)).then(function() {
                                    if (hoverObject.hasClass('user_link_post')) { //если упоминание о пользователе
                                        var inserted = element.appendTo('body');
                                        inserted.css({
                                            top: hoverObject.offset().top - 40,
                                            left: hoverObject.offset().left
                                        });
                                    } else { //аватарка у поста/комментария
                                        element.appendTo(hoverObject);
                                    }
                                });
                            }
                        });
                    } else {
                        var element = $("<div class='js__userAvatarPopup abs x50'/>");
                        $.when(element.bbTpl("//comment/commentAnonimPopup", {})).then(function() {
                            element.appendTo(hoverObject);
                        });
                    }
                }
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__userAvatarPopup").remove();
        });
    };

    $.fn.bbChildPopupComments = function() {
        var popupDelay = 400;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__commentChildPopup").remove();
                if (childPopupCommentCache[hoverObject.attr('href')]) {
                    var element = $("<span class='js__commentChildPopup abs'/>");
                    $.when(element.bbTpl("//comment/commentChildPopup", childPopupCommentCache[hoverObject.attr('href')])).then(function() {
                        element.appendTo(hoverObject);
                    });
                } else {
                    $.ajax(hoverObject.attr('href'), {
                        type: "POST",
                        data: {is_ajax: 1},
                        success: function(response) {
                            childPopupCommentCache[hoverObject.attr('href')] = response;
                            var element = $("<span class='js__commentChildPopup abs'/>");
                            $.when(element.bbTpl("//comment/commentChildPopup", response)).then(function() {
                                element.appendTo(hoverObject);
                            });
                        }
                    });
                }
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__commentChildPopup").remove();
        });
    };

    $.fn.pregnancyPopupComments = function() {
        var popupDelay = 400;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__pregnancyPopupComment").remove();
                var element = $("<span class='js__pregnancyPopupComment' />");
                var tplData = {
                    text: hoverObject.attr('alt'),
                    sex: hoverObject.data('sex')
                };
                $.when(element.bbTpl("//comment/commentPregnancyPopup", tplData)).then(function() {
                    element.appendTo(hoverObject).css({opacity: 1});
                });
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__pregnancyPopupComment").remove();
        });
    };

    $.fn.pregnancyTryPopupComments = function() {
        var popupDelay = 400;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__pregnancyTryPopupComment").remove();
                var element = $("<span class='js__pregnancyTryPopupComment' />");
                var tplData = {
                    text: hoverObject.attr('alt')
                };
                $.when(element.bbTpl("//comment/commentPregnancyTryPopup", tplData)).then(function() {
                    element.appendTo(hoverObject).css({opacity: 1});
                });
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__pregnancyTryPopupComment").remove();
        });
    };

    $.fn.birthdayPopupComments = function() {
        var popupDelay = 400;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__birthdayPopupComment").remove();
                var element = $("<span class='js__birthdayPopupComment' />");
                var tplData = {
                    text: hoverObject.data('age')
                };
                $.when(element.bbTpl("//comment/commentBirthdayPopup", tplData)).then(function() {
                    element.appendTo(hoverObject).css({opacity: 1});
                });
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__birthdayPopupComment").remove();
        });
    };

    $.fn.userBadges = function() {
        var popupDelay = 10;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__headerBadges").remove();
                var element = $("<div class='js__headerBadges badge-tooltip' />");
                var tplData = {
                    text: hoverObject.children('u').html()
                };
                $.when(element.bbTpl("//user/headerBadges", tplData)).then(function() {
                    var inserted = element.appendTo('#userHeaderBlock');
                    var hoverLeft = hoverObject.position("#userHeaderBlock");
                    inserted.children('.tooltip').css({
                        left: 210 + hoverLeft.left,
                        opacity: 1
                    });
                    if (hoverObject.data('callback') && typeof(window[hoverObject.data('callback')]) == 'function')
                        window[hoverObject.data('callback')].apply(inserted);
                });
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__headerBadges").remove();
        });
    };

    $.fn.userBadgesSearch = function() {
        var popupDelay = 10;
        var timerId = false;

        $(this).on('mouseenter', function() {
            var hoverObject = $(this);

            timerId = setTimeout(function() {
                $(".js__headerBadges").remove();
                var element = $("<div class='js__headerBadges badge-tooltip' />");
                var tplData = {
                    text: hoverObject.children('u').html()
                };
                $.when(element.bbTpl("//user/headerBadges", tplData)).then(function() {
                    var inserted = element.appendTo(hoverObject.parent('.user-dossier-childs'));
                    var hoverLeft = hoverObject.position(".user-dossier-childs");

                    inserted.children('.tooltip').css({
                        left: hoverLeft.left,
                        top: "auto",
                        bottom: 70,
                        opacity: 1
                    });
                });
            }, popupDelay);
        }).on('mouseleave', function() {
            clearTimeout(timerId);
            $(".js__headerBadges").remove();
        });
    };

    $.fn.bbUserSocialLogin = function() {
        $(this).off('click').on('click', function() {
            var popwindow = window.open($(this).attr('href'), 'social', 'height=400, width=700, top=200,left=300,status=yes,toolbar=no,menubar=no,location=yes, resizable=yes');
            popwindow.creator = self;
            return false;
        });
    };

    $.fn.bbUserAuthFormes = function(options) {
        var self = $(this), is_ajax;

        $(this).bbValidateForm({
            preExec: function() {
                if(!is_ajax){
                    is_ajax = self.append($('<input type="hidden" name="is_ajax" value="1">'));
                }
            },

            onError: function(errors){

            },

            statusCode: {
                302: function(){
                    if (options.successCallback) {
                        options.successCallback();
                    }
                }
            },

            onComplete: function(response) {
                if (options.successCallback) {
                    options.successCallback();
                } else if (options.replaceContainer) {
                    $.when($(options.replaceContainer).bbTpl("//user/userSocialConnectedExist", response)).then(function() {
                    });
                } else {
                    window.location.href = response;
                }
            }
        });
    };

    $.fn.bbUserNoteForm = function(method) {

        if (typeof method === 'object' || !method) {
            bbUserNoteFormMethods.init.apply(this, [arguments[0]]);
        } else if (bbUserNoteFormMethods[method]) {
            bbUserNoteFormMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserNoteForm');
        }
        return this;
    }

    var bbUserNoteFormMethods = {
        _params: false,
        showedForm: false,
        checkIfShowed: function() {
            var $that = $(this);
            if (bbUserNoteFormMethods.showedForm) {
                if (!$that.hasClass('js__click')) {
                    $that.addClass('js__click');
                    bbUserNoteFormMethods.showedForm.show();
                } else {
                    $that.removeClass('js__click');
                    bbUserNoteFormMethods.showedForm.hide();
                }
                return true;
            }

            return false;
        },
        init: function(params) {
            bbUserNoteFormMethods._params = params;
            var $self = $(this);

            $self.children('a').on('click.addUserNote', function() {
                var $that = $(this);

                //проверяем была ли уже открыта форма
                if (bbUserNoteFormMethods.checkIfShowed.apply(this)) {
                    return false;
                }

                $that.addClass('js__click');
                bbUserNoteFormMethods._params.submitUrl = $that.attr('href');
                bbUserNoteFormMethods.showForm.apply(this, [$self]);

                return false;
            });

            bbUserNoteFormMethods.initDelNote.apply(this);
        },
        initDelNote: function() {
            if ($('#delUserNote').length) {
                $('#delUserNote').on('click.delUserNote', function() {
                    var $that = $(this);
                    bbUserNoteFormMethods._params.submitUrl = $that.attr('href');

                    bbUserNoteFormMethods.delNote.apply(this);
                    return false;
                });
            }
        },
        showForm: function($self) {
            var $that = $(this);
            var tplData = {
                user_id: bbUserNoteFormMethods._params.user_id,
                text: bbUserNoteFormMethods._params.text
            };

            var objectWin = $('<div/>');
            $.when(objectWin.bbTpl("//user/userNoteForm", tplData)).then(function() {
                var windowForm = $(objectWin.html()).appendTo($self);

                windowForm.attr('action', bbUserNoteFormMethods._params.submitUrl);
                windowForm.bbValidateForm({
                    onComplete: function() {
                        var value = windowForm.find('textarea[name="text"]').val();
                        value = value.replace(/(<([^>]+)>)/ig, '');
                        value = value.replace(/\n/g, "<br />");
                        $.when(objectWin.bbTpl("//user/userNote", {text: value, user_id: bbUserNoteFormMethods._params.user_id})).then(function() {
                            $(bbUserNoteFormMethods._params.existSelector).remove();
                            var inserted = $(objectWin.html()).insertAfter($(bbUserNoteFormMethods._params.placeholder));
                            bbUserNoteFormMethods._params.text = value;
                            bbUserNoteFormMethods.initDelNote.apply(this);
                            windowForm.hide();
                            $that.removeClass('js__click');
                        });
                    }
                });

                bbUserNoteFormMethods.showedForm = windowForm;
            });
        },
        delNote: function() {
            $.post(bbUserNoteFormMethods._params.submitUrl, bbUserNoteFormMethods._params, function() {
                $(bbUserNoteFormMethods._params.existSelector).remove();
                bbUserNoteFormMethods._params.text = '';

                if (bbUserNoteFormMethods.showedForm) {
                    bbUserNoteFormMethods.showedForm.find('textarea[name="text"]').val('');
                }
            });
        }
    };
    
    $.fn.bbFooterSubscribe = function(method) {
        if (typeof method === 'object' || !method) {
            bbFooterSubscribeMethods.init.apply(this, [arguments[0]]);
        } else if (bbFooterSubscribeMethods[method]) {
            bbFooterSubscribeMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbUserPostButton');
        }

        return this;
    };

    var bbFooterSubscribeMethods = {
        form_open: false,
        subscribeUrl: '/user/register/subscribe',
        init: function(params) {
            var $that = $(this);
            $that.on('click', function() {
                $.ajax(bbFooterSubscribeMethods.subscribeUrl, {
                    type: "POST",
                    statusCode: {
                        500: function(response) {
                            bbM.flashEvent('Возникла непредвиденная ошибка', false);
                        },
                        400: function(response) {
                            bbFooterSubscribeMethods.showForm.apply($that);
                        },
                        302: function(response) {
                            bbFooterSubscribeMethods.showForm.apply($that);
                        }
                    },
                    success: function() {
                        bbM.flashEvent('Вы подписались на новости', true);
                    }
                });

                return false;
            });
        },
        showForm: function() {
            var $that = $(this);

            if (!bbFooterSubscribeMethods.form_open) {
                var objectWin = $('<div/>');
                $.when(objectWin.bbTpl("//user/newsSubscribeForm")).then(function() {
                    var $windowForm = $(objectWin.html()).insertAfter($that);

                    $windowForm.attr('action', bbFooterSubscribeMethods.subscribeUrl);
                    $windowForm.bbValidateForm({
                        onComplete: function() {
                            bbM.flashEvent('Вы подписались на новости', true);
                            $windowForm.remove();
                            bbFooterSubscribeMethods.form_open = false;
                        }
                    });

                    bbFooterSubscribeMethods.form_open = $windowForm;
                });
            }
        }
    };


    ////////////////////RENDERING TEMPLATE///////////////////////////
    /**
     * Кеширование аякс-запросов к файлам. В случае, если уже был осущетсвлен такой запрос - будет использоваться закешированная версия.
     * Если запрос ещё в процессе выполнения, когда приходит второй запрос на тот же файл - запрашиваемый подписывается и будет ему отдан результат после выполнения запроса.
     * Лучше всего использовать с конструкцией .when().then()
     **/
    $.fn.bbCachebleAjax = function(options) {
        var promise = cacheAjax[options.url];
        if (!promise) {
            promise = $.ajax(options.url || "", {
                data: options.data || {},
                dataType: options.dataType || 'html'
            });
            cacheAjax[options.url] = promise;
            //console.log('%ccache bbCachebleAjax', 'color:magenta', options);
        } else {
            //console.log('%ccache bbCachebleAjax', 'color:green', options);
        }

        return promise;
    }

    /**
     * Отрисовка шаблона. Модифицирует .html() текущего объекта
     *
     * @param str string - название шабона. Может принимать значения
     *	    //fileName/blockName - будет запрошен файл fileName.xml, в котором будет искаться <template id="blockName">
     *	    //fileName - будет запрошен файл fileName.htm, который будет целиком интерпретирован как один шаблон
     *	    blockName - будет искаться в текущей dom-модели элемент с id = blockName
     * @param data - непосредственные данные для вставки в шаблон
     * @return jQuery Element this
     **/
    $.fn.bbTpl = function(str, data) {
        var tplPath = bbM.stPath('js/tpl_js/');
        var self = this;
        var dfd = new $.Deferred();
        if (!data) {
            data = {};
        }
        if (/\//.test(str)) {
            if (str.substr(0, 2) == '//') {
                temp = str.split("/");
                folder = temp[2];
                tplName = temp[3];
            } else {
                temp = str.split("/");
                folder = temp[0];
                tplName = temp[1];
            }

            if (folder && folder != '' && tplName) { //Если у нас есть папка в пути к шаблону
                var tplCacheName = folder + '_' + tplName;
                if (!tpl_cache[tplCacheName] || tpl_cache[tplCacheName] == undefined) {
                    $.when($.fn.bbCachebleAjax({
                        url: tplPath + folder + ".xml",
                        dataType: "xml"
                    }), tplCacheName, tplName).then(function(fileData, tplCacheName, tplName) {
                        tpl_cache[tplCacheName] = bbM.buildTmplFn($(fileData[0]).find("#" + tplName).text());
                        self.html(tpl_cache[tplCacheName](data));
                        dfd.resolve(self);
                    });
                } else {
                    self.html(tpl_cache[tplCacheName](data));
                    dfd.resolve(self);
                }
            } else { //запрашиваем отдельный файл
                if (!tpl_cache[folder]) {
                    $.when($.fn.bbCachebleAjax({
                        url: tplPath + folder + ".htm",
                        dataType: "text"
                    }), folder).then(function(fileData, folder) {
                        tpl_cache[folder] = bbM.buildTmplFn(fileData[0]);
                        self.html(tpl_cache[folder](data));
                        dfd.resolve(self);
                    });
                }
                else {
                    self.html(tpl_cache[folder](data));
                    dfd.resolve(self);
                }
            }
        }
        //если у нас есть inline-элемент с таким id - используем его
        else if ($("#" + str).text()) {
            var fn = tpl_cache[str] ? tpl_cache[str] : tpl_cache[str] = bbM.buildTmplFn($("#" + str).html());
            if (fn) {
                self.html(fn(data));
                dfd.resolve(self);
            }
            else {
                dfd.reject();
            }
        }
        else {
            $.error('bbTPL: use uninitialized tpl element');
            dfd.reject();
        }
        return dfd.promise();
    }


    $.fn.bbTplCached = function(str,data) {
        var tplCacheName = str;
        if (/\//.test(str)) {
            if (str.substr(0, 2) == '//') {
                temp = str.split("/");
                folder = temp[2];
                tplName = temp[3];
            } else {
                temp = str.split("/");
                folder = temp[0];
                tplName = temp[1];
            }
            if (folder && folder != '' && tplName) {
                tplCacheName = folder + '_' + tplName;

            }
            else {
                tplCacheName = folder;
            }
        }

        if(typeof(tpl_cache[tplCacheName]) == 'function') {
            this.html(tpl_cache[tplCacheName](data));
        }
        else {
            $.error('bbTPL: use uninitialized tpl element');
        }
        return this;
    }




    ///////////////////////Не обходимо проверить/////////////////////////////////

    // Комментарии
    $.fn.bbComment = function(method) {
        if (commentMethods[method]) {
            return commentMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return commentMethods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbComment');
        }
    };

    var commentMethods = {
        _su_user: null,
        open_comment_editor: false,
        su_user: function(param) {
            commentMethods._su_user = param;

            return this;
        },
        //инициализируем комментирование для поста
        initPost: function(params) {
            $(this).find('.js__addCommentClick').on('click.bbAddComment', function() {
                var $that = $(this);

                if (!commentMethods.initProcessEvent($that))
                    return false;

                var self = $that.parents('.js__postLenta');

                //инициализируем данные
                $.extend(self, self.data(), true);
                $.extend(self, params, true);
                self.object_title = self.find('.js__objectTitle').text();
                self.typeAddEditor = 'appendTo';
                commentMethods.addComment.apply(this, [self]);
                return false;
            });

            return this;
        },
        //инициализируем плоское комментирование для поста
        initPostFlat: function(params) {
            var postLenta = $(this);
            $(this).siblings('div.js__newCommentFormContainer').find('.js__addCommentClick').on('click.bbAddComment', function() {
                var $that = $(this);

                if (!commentMethods.initProcessEvent($that))
                    return false;

                var formContainer = $that.parents('.js__newCommentFormContainer')

                //инициализируем данные
                $.extend(postLenta, formContainer.data(), true);
                $.extend(postLenta, params, true);
                postLenta.object_title = formContainer.find('.js__objectTitle').text();
                postLenta.typeAddEditor = 'insertAfter';
                postLenta.typeAddComment = "appendTo";
                postLenta.level = '-1';
                commentMethods.addComment.apply(this, [postLenta]);
                return false;
            });

            return this;
        },

        initProcessEvent: function($that) {
            if ($that.hasClass('js__process')) {
                if (commentMethods.open_comment_editor) {
                    $(commentMethods.open_comment_editor).toggle();
                    $that.toggleClass('active');
                }
                return false;
            } else {
                //если на странице уже есть открытая форма комментирования, то мы ее удаляем
                if (commentMethods.open_comment_editor) {
                    $.sceditor._rangeHelper._cached && $.sceditor._rangeHelper._cached.pop();
                    $(commentMethods.open_comment_editor).remove();
                }

                $('.js__process').removeClass('js__process active');
            }

            $that.addClass('js__process active');
            return true;
        },
        //инициализируем комментирование внутри самих комментариев
        initComment: function(params) {
            //кнопка "ответить"
            $(this).find('.js__addCommentClick').on('click.bbAddComment', function() {
                var $that = $(this);

                if (!commentMethods.initProcessEvent($that))
                    return false;

                var self = $that.parents('.js__comment');

                //инициализируем данные
                $.extend(self, self.data(), true);
                $.extend(self, params, true);
                self.typeAddEditor = 'insertAfter';

                commentMethods.addComment.apply(this, [self]);
                return false;
            });

            //кнопка "редактировать"
            $(this).find('.js__editCommentClick').on('click.bbEditComment', function() {
                var $that = $(this);

                if (!commentMethods.initProcessEvent($that))
                    return false;

                var self = $that.parents('.js__comment');

                //инициализируем данные
                $.extend(self, self.data(), true);
                $.extend(self, params, true);
                commentMethods.editComment.apply(this, [self]);
                return false;
            });

            //кнопка "удалить"
            $(this).find('.js__deleteCommentClick').on('click.bbDelComment', function() {
                var $that = $(this);
                var self = $that.parents('.js__comment');

                //инициализируем данные
                $.extend(self, self.data(), true);
                $.extend(self, params, true);
                commentMethods.deleteComment.apply(this, [self]);
                return false;
            });

            //кнопка "точки"
            $(this).find('.js__dotCommentClick').on('click.bbPointComment', function() {
                $(this).prevAll('a.none').fadeToggle(100);
                $(this).remove();
                return false;
            });

            //Подгрузка ранних комментов при плоской моделе
            $(this).find('.js__commentLoadPrevious').on('click.bbLoadPrevious', function() {
                commentMethods.loadPrevious.apply(this);
            });

            return this;
        },
        deleteComment: function(comm_box) {
            var url = '/comments/delete',
                    param = {
                object_type: comm_box.object_type,
                object_id: comm_box.object_id,
                shard_object_id: comm_box.shard_object_id,
                comment_id: comm_box.data('id')
            };

            $.post(url, param, function(res) {
                if (res.result == 200) {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//comment/restoreComment")).then(function() {
                        comm_box.children().hide();
                        comm_box.find('._btn_points').click();
                        comm_box.addClass('deleted');
                        comm_box.append(objectWin);

                        comm_box.find('.js__restoreComment').off('click').on('click.bbRestoreDelComment', function() {
                            commentMethods.restoreComment.apply(this, [comm_box]);
                            return false;
                        });
                    })
                } else
                    return commentMethods.showError.apply(this, [comm_box, res.message]);
            }, 'json');
            return false;
        },
        restoreComment: function(comm_box) {
            var url = '/comments/restore',
                    param = {
                object_type: comm_box.object_type,
                object_id: comm_box.object_id,
                shard_object_id: comm_box.shard_object_id,
                comment_id: comm_box.data('id')
            };

            $.post(url, param, function(res) {
                if (res.result == 200) {
                    comm_box.children().show();
                    comm_box.find('.js__delCommentBlock').remove();
                    comm_box.removeClass('deleted');
                }
            }, 'json');
            return false;
        },
        editComment: function(comm_box) {
            var self = $(this);

            var requestData = {
                object_type: comm_box.object_type,
                shard_object_id: comm_box.shard_object_id,
                replay_user_id: (comm_box.is_post || comm_box.is_lenta) ? 0 : (comm_box.owner_user ? comm_box.owner_user.user_id : 0),
                post_user_id: comm_box.object_user_id
            };

            //проверяем находится ли пользователь в ЧС
            $.ajax('/comments/in_blacklist', {
                type: "POST",
                data: requestData,
                statusCode: {//пользователь в ЧС
                    501: function(response) {
                        self.remove();
                        bbM.flashEvent('Редактирование запрещено', false);
                        return false;
                    }
                },
                success: function(response) { //нормальный пользователь, разрешаем комментировать
                    var objectWin = $("<div/>");
                    $.when(objectWin.bbTpl("//comment/addForm", {})).then(function() {
                        if (commentMethods.open_comment_editor) {
                            $.sceditor._rangeHelper._cached && $.sceditor._rangeHelper._cached.pop();
                            $(commentMethods.open_comment_editor).remove();
                        }
                        ;

                        var windowForm = comm_box.typeAddEditor == 'appendTo' ? $(objectWin.html()).appendTo( comm_box ) : $(objectWin.html()).insertAfter( comm_box );

                        windowForm.find('a[rel="cancelCommentClick"]').on('click.bbCloseComment', function() {
                            windowForm.hide();
                            self.removeClass('active');
                            return false;
                        });

                        var comment = comm_box.find('.js__commentText').html();
                        windowForm.find('textarea')
                                .val(comment)
                                .bbSCEditor('initComment', {login: commentMethods._su_user.login, folder: comm_box.object_type == 1 ? 'user' : 'community'});

                        //событие на submit
                        windowForm.submit(function() {
                            if (!!$.sceditor) {
                                $.sceditor._rangeHelper.removeMarkers();
                                $.sceditor._updateOriginal();
                            }
                            ;
                            return commentMethods.submitForm.apply(windowForm, [self, comm_box, comm_box.data('id')]);
                        });

                        //если на странице уже есть открытая форма комментирования, то мы ее удаляем

                        commentMethods.open_comment_editor = windowForm;
                    });
                }
            });
        },
        addComment: function(comm_box) {
            var self = $(this);
            var requestData = {
                object_type: comm_box.object_type,
                shard_object_id: comm_box.shard_object_id,
                replay_user_id: (comm_box.is_post || comm_box.is_lenta) ? 0 : (comm_box.owner_user ? comm_box.owner_user.user_id : 0),
                post_user_id: comm_box.object_user_id
            };

            //проверяем находится ли пользователь в ЧС
            $.ajax('/comments/in_blacklist', {
                type: "POST",
                data: requestData,
                statusCode: {//пользователь в ЧС
                    501: function(response) {
                        self.remove();
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                        return false;
                    }
                },
                success: function(response) { //нормальный пользователь, разрешаем комментировать
                    var objectWin = $("<div/>");
                    $.when(objectWin.bbTpl("//comment/addForm", {})).then(function() {
                        var windowForm = comm_box.typeAddEditor == 'appendTo' ? $(objectWin.html()).appendTo( comm_box ) : $(objectWin.html()).insertAfter( comm_box );

                        windowForm.find('a[rel="cancelCommentClick"]').on('click.bbCloseComment', function() {
                            windowForm.hide();
                            self.removeClass('active');
                            return false;
                        });
                        windowForm.find('textarea').bbSCEditor('initComment', {login: commentMethods._su_user.login, folder: comm_box.object_type == 1 ? 'user' : 'community'});
                        //событие на submit
                        windowForm.submit(function() {
                            if (!!$.sceditor) {
                                $.sceditor._rangeHelper.removeMarkers();
                                $.sceditor._updateOriginal();
                            }
                            return commentMethods.submitForm.apply(windowForm, [self, comm_box]);
                        });

                        commentMethods.open_comment_editor = windowForm;
                    });
                }
            });
        },

        loadPrevious: function() {
            var url = '/comments/get_flat_previous';
            var commentTmpContainer = $('<div/>');
            var loadPreviousElement = $(this);

            $.ajax({
                'url': url,
                'type': 'POST',
                'dataType': 'json',
                'data' : $(this).data(),
                'success': function(res) {
                    var defaultCommentData = {
                        'chpu_name' : res.data.chpu_name,
                        'shard_object_id': res.data.shard_object_id,
                        'su_user': res.data.su_user
                    };

                    var firstComment = { comm: res.data.comments[Object.keys(res.data.comments)[0]]};
                    firstComment.user = res.data.users[firstComment.comm.user_id];
                    firstComment = BBAPI.utils.extend(defaultCommentData,firstComment);
                    delete(res.data.comments[Object.keys(res.data.comments)[0]]);

                    if(res.result == 200) {
                        var commentsContainer = loadPreviousElement.parents('.js__comments');
                        loadPreviousElement.parents('.js__loadMore').remove();
                        commentTmpContainer.bbTpl("//comment/oneCommentFlat",firstComment).done(function(html){
                            for(var i in res.data.comments) {
                                var tplData = {
                                    'comm': res.data.comments[i],
                                    'user': res.data.users[res.data.comments[i].user_id]
                                };
                                tplData = BBAPI.utils.extend(defaultCommentData,tplData);
                                html.append(tpl_cache['comment_oneCommentFlat'](tplData));
                            }
                            commentsContainer.prepend(html.html());
                        });
                    }
                }
            });
            return false;
        },

        submitForm: function(self, comm_box, comment_id) {
            if (comm_box.data('is_send') == 1)
                return false;

            comm_box.data('is_send', 1);

            var windowCommentForm = this;
            var comment = windowCommentForm.find('textarea[name="comment"]').val();

	          if(comment == ""){
		          comm_box.data('is_send', 0);
		          return commentMethods.showError.apply(this, [windowCommentForm, "Введите комментарий"]);
	          };

            windowCommentForm.find('button[type="submit"]').addClass('inactive');

            if (!comm_box.owner_user_id && !comm_box.data('owner_user'))
                return commentMethods.showError.apply(this, [windowCommentForm, '"Не хватает параметров: owner_user или owner_user_id"']);

            var url = '/comments/add',
                    param = {
                object_type: comm_box.object_type,
                object_id: comm_box.object_id,
                object_title: comm_box.object_title,
                shard_object_id: comm_box.shard_object_id,
                replay_user_id: (comm_box.is_post || comm_box.is_lenta) ? 0 : (comm_box.owner_user_id ? comm_box.owner_user_id : comm_box.data('owner_user').user_id),
                parent_id: $(comm_box).data('id') ? $(comm_box).data('id') : 0,
                master_id: $(comm_box).data('master_id') ? $(comm_box).data('master_id') : 0,
                comment: comment
            };

            if (comment_id) {
                url = '/comments/edit';
                param.comment_id = comment_id;
            }

            $.post(url, param, function(res) {
                if (res.result == 200) {
                    if (comment_id) {
                        //если редиктирование
                        comm_box.find('.js__commentText').html(comment);
                    } else {
                        if (comm_box.is_lenta) { //если комментирование из ленты
                        } else { //если комментирование из поста
                            var tplData = {
                                level: comm_box.data('level') ? comm_box.data('level') : 0,
                                comment: comment,
                                login: commentMethods._su_user.login,
                                avatar: commentMethods._su_user.avatar,
                                fio: commentMethods._su_user.fio,
                                childrens: commentMethods._su_user.childrens,
                                pregnancy: commentMethods._su_user.pregnancy,
                                pregnancy_try: commentMethods._su_user.pregnancy_try
//				ownerUrl: '/user/lenta/' + comm_box.owner_user.login,
//				ownerFio: comm_box.owner_user.fio,
                            };

                            var objectWin = $('<div/>');

                            if(typeof(comm_box.commentTemplate) != 'string') {
                                comm_box.commentTemplate = "//comment/oneComment";
                            }
                            if(typeof(comm_box.level) != "undefined") {
                                tplData.level = comm_box.level;
                            }

                            $.when(objectWin.bbTpl(comm_box.commentTemplate, tplData)).then(function() {
                                var newBlock;
                                if (comm_box.is_post)
                                    newBlock = $(objectWin.html()).insertAfter('.js__newCommentHolder').children('.js__comment');
                                else {
                                    newBlock = comm_box.typeAddComment == "appendTo" ? $(objectWin.html()).appendTo(comm_box) : $(objectWin.html()).insertAfter(comm_box);
                                }

                                var level = comm_box.data('level') ? comm_box.data('level') : 1;

                                newBlock.id = "comm_" + res.comment_id;
                                newBlock.data("level", level < 5 ? level + 1 : 5);
                                newBlock.data("owner_user", commentMethods._su_user);
                                newBlock.data("replay_user", $(comm_box).data('owner_user'));
                                newBlock.data("id", res.comment_id);
                                newBlock.data("parent_id", param['parent_id']);
                                newBlock.data("master_id", $(comm_box).data('master_id') ? $(comm_box).data('master_id') : res.comment_id);

                                //инициализируем новый блок
                                newBlock.bbComment('initComment', {
                                    object_type: comm_box.object_type,
                                    object_id: comm_box.object_id,
                                    object_title: comm_box.object_title,
                                    shard_object_id: comm_box.shard_object_id,
                                    object_user_id: comm_box.object_user_id
                                });
                            });
                        }
                    }

                    windowCommentForm.remove();
                    comm_box.data('is_send', 0);
                } else {
                    comm_box.data('is_send', 0);
                    return commentMethods.showError.apply(this, [windowCommentForm, res.message]);
                }
            }, 'json');
            self.removeClass('js__process active');

            return false;
        },
        showError: function(windowCommentForm, Text) {
            console.error('comment showError');
            alert(Text);
            return false;
        }
    };


    $.fn.bbSCEditor = function(method) {
        var args = arguments;

        var _sceditorInit = window.BBAPI.utils.closure(this, function() {
            if (bbSCEditorMethods[method]) {
                return bbSCEditorMethods[ method ].apply(this, Array.prototype.slice.call(args, 1));
            } else if (typeof method === 'object' || !method) {
                return bbSCEditorMethods.init.apply(this, args);
            } else {
                $.error('Метод с именем ' + method + ' не существует для jQuery.bbSCEditor');
            }
            ;
        });


        if (typeof $.fn.sceditor !== 'function') {

            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = bbM.stPath('css/sceditor.css');
            $('head').append(cssNode);

            window.BBAPI.require().load([{
                    urls: [
                        bbM.stPath('sceditor/jquery.sceditor.js'),
                        bbM.stPath('js/uploader.js'),
                        bbM.stPath('sceditor/plugins/bb.js'),
                        bbM.stPath('sceditor/plugins/spell/spell.js')
                    ],
                    afterLoad: _sceditorInit
                }]);

        } else {
            return _sceditorInit();
        }
        ;

    };

    var bbSCEditorMethods = {
        init: function() {
            return $(this).sceditor({
                width: "100%",
                height: "300px",
                style: bbM.stPath('css/sceditor/contents.css'),
                toolbar: "source|bold,italic,underline,strike|color|maximize",
                emoticonsEnabled: false,
                autofocus: true
            });
        },
        initExt: function(params) {
            return $(this).sceditor({
                folder: params.folder,
                login: params.login,
                width: "100%",
                height: "300px",
                style: bbM.stPath('css/sceditor/contents.css'),
                toolbar: "source|bold,italic,underline,strike|color|bbLink,bbImage|maximize",
                emoticonsEnabled: false,
                autofocus: true
            });
        },
        initPost: function(params) {
            var autoresize = bbM.isMobile() ? true : false;

            return $(this).sceditor({
                folder: params.folder,
                login: params.login,
                width: "100%",
                height: "450px",
                style: bbM.stPath('css/sceditor/contents.css'),
                toolbar: "source|bold,italic,underline,strike|color|bbLink,bbImage,bbMultiImage,bbYouTube,bbSmile,bbUserLink|bbCut,bbSpell,bbTranslit|maximize",
                emoticonsEnabled: false,
                autofocus: false,
                autoExpand: autoresize,
                cleanPost: true
            });
        },
        initComment: function(params) {
            var autoresize = bbM.isMobile() ? true : false;

            return $(this).sceditor({
                folder: params.folder,
                login: params.login,
                width: "100%",
                height: "150px",
                style: bbM.stPath('css/sceditor/contents_comments.css'),
                toolbar: "source|bold,italic,underline,strike|color|bbLink,bbImage,bbSmile|bbSpell,bbTranslit|maximize",
                emoticonsEnabled: false,
                autofocus: true,
                //autofocusEnd: false,
                autoExpand: autoresize,
                cleanPost: true,
	              fixLineBreak: true,
	              delEmptyTag: true
            });
        },
        initMessage: function(params) {
            return $(this).sceditor({
                folder: 'user',
                login: params.login,
                width: "470px",
                height: "180px",
                style: bbM.stPath('css/sceditor/contents_comments.css'),
                toolbar: "source|bold,italic,underline,strike|color|bbLink,bbImage,bbSmile|bbSpell,bbTranslit|maximize",
                emoticonsEnabled: false,
                autofocus: true
            });
        },
        initCbAdmin: function(params) {
            var self = this,
                urls = [bbM.stPath('sceditor/plugins/format.js')],
                plugin = (typeof(params.plugin) == 'string' && params.plugin ? params.plugin: '');

            if(plugin) {
                urls.push(bbM.stPath('sceditor/plugins/'+plugin+'.js'));
            }

            window.BBAPI.require().load([{
                'urls': urls,
                afterLoad: function(){
                    $(self).sceditor({
                        plugins: 'format' + (plugin ? ','+plugin :''),
                        folder: params.folder,
                        login: params.login,
                        width: "100%",
                        height: "300px",
                        style: bbM.stPath('css/sceditor/contents.css'),
                        toolbar: "source|bold,italic,underline,strike,format"+(plugin ? '|bulletlist,orderedlist|left,right,center,justify|'+plugin+',bbYouTube' :'')+"|color|bbLink,bbImage|maximize",
                        emoticonsEnabled: false,
                        autofocus: true
                    });
                }
            }]);
        }
    };


    /**
     * Редактор JS
     * не работает в ИЕ < 9
     */
    $.fn.bbEditor = function(method) {
        if (typeof $.fn.redactor !== 'function') {
            var cssNode = document.createElement('link');
            cssNode.type = 'text/css';
            cssNode.rel = 'stylesheet';
            cssNode.href = bbM.stPath('css/redactor.css');
            $('head').append(cssNode);

            var JSNode = document.createElement('script')
            JSNode.setAttribute("type", "text/javascript");
            JSNode.setAttribute("src", bbM.stPath('redactor/redactor.js'));
            $('head').append(JSNode);

            var JSNode = document.createElement('script')
            JSNode.setAttribute("type", "text/javascript");
            JSNode.setAttribute("src", bbM.stPath('redactor/plugins/post.js'));
            $('head').append(JSNode);

            var JSNode = document.createElement('script')
            JSNode.setAttribute("type", "text/javascript");
            JSNode.setAttribute("src", bbM.stPath('redactor/plugins/spell_checker/spell.js'));
            $('head').append(JSNode);
        }

        if (bbEditorMethods[method]) {
            return bbEditorMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return bbEditorMethods.init.apply(this, arguments);
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbEditor');
        }
    }

    var bbEditorMethods = {
        init: function() {
            $(this).redactor({
                minHeight: 50,
                buttons: ['html', '|', 'bold', 'italic', 'deleted', 'fontcolor', 'backcolor', '|'],
                plugins: ['fullscreen']
            });
        },
        initExt: function() {
            $(this).redactor({
                minHeight: 50,
                buttons: ['html', '|', 'bold', 'italic', 'deleted', '|', 'fontcolor', 'backcolor', '|'],
                plugins: ['link', 'image', '|', 'fullscreen']
            });
        },
        initPost: function(params) {
            var autoresize = bbM.isMobile() ? true : false;
            $(this).redactor({
                folder: params.folder,
                login: params.login,
                imageUpload: bbM.stPath('redactor/plugins/image/upload.php'),
                minHeight: 450,
                autoresize: autoresize,
                buttons: ['html', '|', 'bold', 'italic', 'deleted', '|', 'fontcolor', 'backcolor', '|'],
                plugins: ['link', 'image', 'multiImage', 'video', 'smile', '|', 'cut', 'spell', 'translit', '|', 'fullscreen']
            });
        },
        initComment: function(params) {
            var autoresize = bbM.isMobile() ? true : false;
            $(this).redactor({
                folder: params.folder,
                login: params.login,
                imageUpload: bbM.stPath('redactor/plugins/image/upload.php'),
                minHeight: 80,
                autoresize: true,
                focus: true,
                buttons: ['bold', 'italic', 'deleted', '|'],
                plugins: ['link', 'image', 'smile', '|', 'spell', 'translit', '|', 'fullscreen']
            });
        },
        initMessage: function(params) {
            $(this).redactor({
                folder: 'user',
                login: params.login,
                imageUpload: bbM.stPath('redactor/plugins/image/upload.php'),
                fixed: false,
                minHeight: 50,
                height: 50,
                autoresize: false,
                focus: true,
                buttons: ['bold', 'italic', 'deleted', '|'],
                plugins: ['link', 'image', 'smile', '|', 'spell', 'translit', '|', 'fullscreen']
            });
        }
    };


    //Сообщества
    //Форма добавления/редактирования поста
    $.fn.bbCommunityPostForm = function(params) {
        return bbCommunityPostFormMethods.init.apply(this, [params]);
    }
    //методы
    var bbCommunityPostFormMethods = {
        init: function(params) {
            var self = this,
                    windowForm = $(this);

            // redactor ini
            windowForm.find('textarea[name="post"]').bbSCEditor('initPost', {login: params.login, folder: 'user'});

            windowForm.append($('<input type="hidden" name="is_ajax" value="1">'));
            windowForm.bbValidateForm({
                preExec: function() {
                    if (!!$.sceditor) {
                        $.sceditor._rangeHelper.removeMarkers();
                        $.sceditor._updateOriginal();
                    }
                    ;
                },
                onComplete: function(result, windowForm) {
                    if (params.onDone) {
                        params.onDone(result, windowForm);
                    }
                }
            });

            //init select categories
            BBAPI.dom().select($('input[name="community_cat_id"]')[0], {
                data: params['categories'] && params['categories']['data'] ? params['categories']['data'] : [],
                selected: params['categories'] && params['categories']['selected'] ? params['categories']['selected'] : false
            });

            //init select user categories
            if (params['user_categories'] && params['user_categories']['data'] && params['user_categories']['data'].length) {
                var user_cat_created = 0;
                var create_users_cat = function() {
                    if (!user_cat_created) {
                        BBAPI.dom().select($('input[name="user_cat_id"]')[0], {
                            data: params['user_categories']['data'],
                            selected: params['user_categories']['selected'] ? params['user_categories']['selected'] : false
                        });
                        user_cat_created = 1;
                    }
                }

                var user_cat_id = windowForm.find('input[name="is_dubl_4_dnevnik"]');
                user_cat_id.on('ifToggled', function(event) {
                    windowForm.find('.js__user_cat_id').toggle();
                    create_users_cat();
                });

                if (params.is_dubl_4_dnevnik == 1) {
                    windowForm.find('.js__user_cat_id').toggle();
                    create_users_cat();
                }
            }

            // работаем с голосованиеями (открытие/закрытие/удаление сушествующего/добавление ответа)
            windowForm.find('.js__vote_link').off('click').on('click', function() {
                var container = windowForm.find('.js__vote_container');
                if ($(this).hasClass('link-muted')) {
                    var pollId = windowForm.find('input[name="vote_id"]').val();
                    if (pollId && pollId > 0) {
                        windowForm.find('.js__existedAns').remove();
                        windowForm.find('input[name="vote_id"]').val('');
                        windowForm.append($('<input type="hidden" name="vote_id_old" value="' + pollId + '">'));
                        windowForm.find('textarea[name="vote_question"]').val('');
                        windowForm.find('input[name="one_answer"]').attr('checked', false);
                    }
                    container.fadeOut();
                    $(this).removeClass('link-muted').find('span').text(bbLang('USER_SETPOST_VODE_ADD'));
                }
                else {
                    container.fadeIn();
                    $(this).addClass('link-muted').find('span').text(bbLang('USER_SETPOST_VODE_DEL'));
                }
                windowForm.find('.js__vote_addanswer').off('click').on('click', function() {
                    var bbVotenewAnswer = $('<div/>');
                    $.when(bbVotenewAnswer.bbTpl("//user/PostFormVoteAnswer")).then(function() {
                        windowForm.find('.js__vote_answerContainer').before(bbVotenewAnswer.html());
                    });
                    return false;
                });
                return false;
            });
            if (params.votePreopen) {
                windowForm.find('.js__vote_link').trigger('click');
            }
        }
    };


    //Сообщество
    //Toolbar buttons in post
    $.fn.bbCommunityPostButton = function(method) {

        if (typeof method === 'object' || !method) {
            bbCommunityPostButtonMethods.init.apply(this, [arguments[0]]);
        } else if (bbCommunityPostButtonMethods[method]) {
            bbCommunityPostButtonMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityPostButton');
        }

        return this;
    }

    var bbCommunityPostButtonMethods = {
        //инициализация кнопок у поста
        initDotButton: function(params) {
            $(this).on('click.dotButtonClick', function() {
                var self = $(this),
                        postBlocks = self.parents('.js__postLenta');

                postBlocks.find('.js__deleteClick').on('click.deletePost', function() {
                    bbCommunityPostButtonMethods.deletePost.apply(this);
                    return false;
                });

                postBlocks.find('.js__editClick').on('click.editPost', function() {
                    window.location.href = $(this).attr('href');
                    return false;
                });

                postBlocks.find('.js__modifyDateClick').off('click').on('click.modifyDatePost', function() {
                    bbCommunityPostButtonMethods.modifyDatePost.apply(this);
                    return false;
                });
                self.prevAll('a.hidden').fadeToggle(100);
                self.remove();
                return false;
            });
        },
        //удаление поста
        deletePost: function() {
            if (!confirm(bbLang('COMMUNITY_CONFIRM_POST_DELETED')))
                return false;

            var self = $(this),
                    postBlock = self.parents('.js__postLenta'),
                    submitUrl = $(this).attr('href');
            $.ajax(submitUrl, {
                type: "POST",
                data: {is_ajax: true},
                statusCode: {
                    400: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    },
                    403: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    },
                    404: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    }
                },
                success: function(response) {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/deletePost")).then(function() {
                        postBlock.fadeOut('fast', function() {
                            var deleteBlock = $(objectWin.html()).insertAfter(postBlock);

                            postBlock.remove();
                        });
                    });
                    bbM.flashEvent(bbLang('COMMUNITY_POST_DELETED'), true);
                }
            });
        },
        //обновление даты поста
        modifyDatePost: function() {
            var self = $(this),
                    postBlock = self.parents('.js__postLenta'),
                    submitUrl = $(this).attr('href');
            $.ajax(submitUrl, {
                type: "POST",
                data: {is_ajax: true},
                statusCode: {
                    400: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    },
                    403: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    },
                    404: function(response) {
                        bbM.flashEvent(jQuery.parseJSON(response.responseText), false);
                    }
                },
                success: function(response) {
                    if(typeof(ga) == 'function') {
                        ga('send', 'event', 'Goal', 'PostUp');
                    }
                    bbM.flashEvent(bbLang('MODIFY_DATE_SUCCESS'), true);
                }
            });
        }
    };

    //Сообщество
    // Прикрепить - Открепить пост
    $.fn.bbCommunityPostFixation = function(method) {

        if (typeof method === 'object' || !method) {
            bbCommunityPostFixationMethods.init.apply(this, [arguments[0]]);
        } else if (bbCommunityPostFixationMethods[method]) {
            bbCommunityPostFixationMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityPostFixation');
        }

        return this;
    }


    var bbCommunityPostFixationMethods = {
        init: function(params) {
            var self = $(this);

            self.on('click.PostFixation', function() {

                var sendData = {
                    post_id: self.data('post_id'),
                    action: self.data('action')
                };
                $.post(params.FixPostUrl, sendData, function() {
                    var button_title = self.data('unfix_name');
                    var message = bbLang('COMMUNITY_FIXED');
                    if (self.data('action') == 'unfix') {
                        button_title = self.data('fix_name');
                        self.data('action', 'fix');
                        message = bbLang('COMMUNITY_UNFIXED');
                    } else {
                        self.data('action', 'unfix');
                    }
                    self.html(button_title);
                    bbM.flashEvent(message, true, false, 1100);
                }).fail(function() {
                    alert(bbLang('COMMUNITY_ERROR_COUNT_POST_FIX'));
                });

                return false;
            });
        }
    };

    //Сообщество
    // Подключение/отключение
    $.fn.bbCommunityConnection = function(method) {
        if (typeof method === 'object' || !method) {
            bbCommunityConnectionMethods.init.apply(this, [arguments[0]]);
        } else if (bbCommunityConnectionMethods[method]) {
            bbCommunityConnectionMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityConnection');
        }

        return this;
    }

    var bbCommunityConnectionMethods = {
        init: function(params) {
            var self = $(this);
            typeConnection = self.data('type');

            self.on('click.communityConnect', function() {
                if (typeConnection == 'leave') {
                    bbCommunityConnectionMethods.leaveComm.apply(this, [params]);
                } else if (typeConnection == 'request') {
                    bbCommunityConnectionMethods.requestComm.apply(this, [params]);
                } else if (typeConnection == 'join_request') {
                    bbCommunityConnectionMethods.joinPrivateComm.apply(this, [params]);
                } else {
                    bbCommunityConnectionMethods.joinComm.apply(this, [params]);
                }

                return false;
            });

            //загружаем сразу все необходимые попапы
            bbCommunityConnectionMethods.initMessages.apply(this, [typeConnection, params]);
        },
        initMessages: function(typeConnection, params) {
            if (typeConnection == 'join') {
                var objectWin = $('<div/>');
                $.when(objectWin.bbTpl("//community/connectJoinMessage")).then(function() {
                    var mess = $(objectWin.html()).insertAfter('#connectToCommunity');
                    mess.find('.js__closeClick').on('click.closeMessage', function() {
                        mess.remove();
                        return false;
                    });
                });
            } else if (typeConnection == 'join_request') {

                //заявка отправлена спасибо
                var objectWin = $('<div/>');
                $.when(objectWin.bbTpl("//community/connectJoinRequestSendMessage")).then(function() {
                    var mess = $(objectWin.html()).insertAfter('#connectToCommunity');
                    mess.find('.js__closeClick').on('click.closeMessage', function() {
                        mess.remove();
                        return false;
                    });
                });

                //согласие с правилами
                var objectWin2 = $('<div/>');
                $.when(objectWin2.bbTpl("//community/connectJoinRequestAgreeMessage", {rulesUrl: params.rulesUrl})).then(function() {
                    $(objectWin2.html()).insertAfter('#connectToCommunity');
                });
            } else if (typeConnection == 'request') {
                var objectWin = $('<div/>');
                $.when(objectWin.bbTpl("//community/connectJoinRequestRejectMessage")).then(function() {
                    $(objectWin.html()).insertAfter('#connectToCommunity');
                });
            }
        },
        //подключение к открытому сообществу
        joinComm: function(params) {
            var self = $(this);
            var requestUrl = self.data('login') ? params.joinUrl + self.data('login') : params.joinUrl;
            $.post(requestUrl, function() {
                if (params.onDone) {
                    params.onDone(self);
                } else {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/connectLeave", {login: self.data('login')})).then(function() {
                        var newSelf = $(objectWin.html()).insertAfter(self);
                        bbCommunityConnectionMethods.init.apply(newSelf, [params]);
                        self.remove();

                        //показываем заранее подгруженный popup из initMessages
                        var mess = $('#connectJoinMessage').css({opacity: 1}).fadeIn('fast');

                        //показываем кнопку написать в сообщество
                        $('#writePostButton').fadeIn('fast');
                    });
                }
            });
        },
        //отключение от сообщества
        leaveComm: function(params) {
            var self = $(this);
            var requestUrl = self.data('login') ? params.leaveUrl + self.data('login') : params.leaveUrl;
            $.post(requestUrl, function() {
                if (params.onDone) {
                    params.onDone(self);
                } else {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/connectJoin", {type: 'join', login: self.data('login')})).then(function() {
                        var newSelf = $(objectWin.html()).insertAfter(self);
                        bbCommunityConnectionMethods.init.apply(newSelf, [params]);
                        self.remove();

                        //скрываем кнопку написать в сообщество
                        $('#writePostButton').fadeOut('fast');
                    });
                    bbM.flashEvent(bbLang('COMMUNITY_LEAVE_EVENT'), true);
                }
            });
        },
        //подключение к закрытому сообществу
        joinPrivateComm: function(params) {
            var self = $(this);
            self.toggleClass('active');

            //показываем заранее подгруженный popup из initMessages
            var mess = $('#connectJoinRequestAgree');
            mess.toggle().css({opacity: 1});
            mess.find('.js__agreeClick').on('click.agreeWithRules', function() {
                $.post(params.joinUrl, {is_ajax: 1}, function() {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/connectRequest", {login: self.data('login')})).then(function() {
                        var newSelf = $(objectWin.html()).insertAfter(self);
                        bbCommunityConnectionMethods.init.apply(newSelf, [params]);
                        self.remove();
                        $('#connectJoinRequestAgree').remove();

                        //показываем заранее подгруженный popup из initMessages
                        var mess = $('#connectJoinRequestSend').css({opacity: 1}).fadeIn('fast');
                    });
                });

                return false;
            });
        },
        //отозвать заявку на подключение к сообществу
        requestComm: function(params) {
            var self = $(this);
            self.toggleClass('active');

            //показываем заранее подгруженный popup из initMessages
            var mess = $('#connectJoinRequestReject');
            mess.toggle().css({opacity: 1});
            mess.find('.js__leaveClick').on('click.leaveCommunity', function() {
                $.post(params.leaveUrl, {is_ajax: 1}, function() {
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/connectJoin", {type: 'join_request', login: self.data('login')})).then(function() {
                        var newSelf = $(objectWin.html()).insertAfter(self);
                        bbCommunityConnectionMethods.init.apply(newSelf, [params]);
                        self.remove();
                        $('#connectJoinRequestReject').remove();
                    });
                });

                return false;
            });
        }
    };

    $.fn.bbUserInfoFriends = function(method) {
        if (bbUserInfoFriendsMethods[method]) {
            return bbUserInfoFriendsMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return bbUserInfoFriendsMethods.init.apply(this, arguments);
        }
        return this;
    }

    var bbshowButtonFriendLoadAnother = true;
    var bbUserInfoFriendsMethods = {
        init: function(params) {
            bbUserInfoFriendsMethods.loadAnotherInit(this, params);
            bbUserInfoFriendsMethods.MessageQuickSendInit(this, params);
        },
        loadAnotherInit: function(globSelf, params) {
            //обрабатываем появление кнопки загрузить ещё
            var totalShowed = $('[name="usersList"]').find("tr[rel]").length;
            if (bbshowButtonFriendLoadAnother && totalShowed < params.usersTotal) {

                $('[rel="loadAnother"]').find('a')
                        .html(bbLang('USER_FRIEND_LOAD_ANOTHER'))
                        .off('click')
                        .on('click', function() {
                    var sendParams = {
                        page: parseInt($(this).attr('rel')) + 1
                    }
                    $(this).html(bbLang('USER_FRIEND_PROCESS_REQUEST'));
                    $.ajax($(this).attr('href'), {
                        type: "POST",
                        data: sendParams,
                        dataType: 'json',
                        success: function(response) {
                            $('[rel="loadAnother"]').find('a').attr('rel', sendParams.page);
                            if (response && response.length) {
                                var objectWin = $('<div/>');
                                $.when(objectWin.bbTpl("//friends/friendsInfoUsersList", {
                                    users: response,
                                    pageType: params.pageType
                                })).then(function() {
                                    $('table[name="usersList"]').append(objectWin.html());
                                });
                            }
                            else {
                                bbshowButtonFriendLoadAnother = false;
                            }
                            bbUserInfoFriendsMethods.loadAnotherInit(this, params);
                            bbUserInfoFriendsMethods.MessageQuickSendInit(this, params);
                        }
                    });
                    return false;
                });
                $('[rel="loadAnother"]').show();
            }
            else {
                $('[rel="loadAnother"]').hide();
            }
        },
        MessageQuickSendInit: function(globSelf, params) {
            $('[rel="quickMessage"]').off('click').on('click', function() {
                if ($('.js__sendMessagePopup').html()) {
                    $('.js__sendMessagePopup').remove();
                }
                else {
                    var self = $(this);
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//friends/quickMessage", {})).then(function() {
                        var quickMessageForm = $(objectWin.html()).appendTo($('body'));
                        quickMessageForm.offset({
                            top: self.offset().top + 30,
                            left: self.offset().left - 25
                        }).show();
                        var messageArea = quickMessageForm.find('textarea');
                        messageArea.on('blur', function() {
                            if ($(this).val() == '') {
                                $(this).val(bbLang('USER_MESSAGE_POPUP_MESSAGE'));
                            }
                        }).on('focus', function() {
                            if ($(this).val() == bbLang('USER_MESSAGE_POPUP_MESSAGE')) {
                                $(this).val('');
                            }
                        })
                        var sendForm = quickMessageForm.find('form');
                        sendForm.off('submit').on('submit', function() {
                            if (messageArea.val() != bbLang('USER_MESSAGE_POPUP_MESSAGE')) {
                                $.ajax(sendForm.attr('action'), {
                                    type: "POST",
                                    data: {
                                        sendUser: self.data('login'),
                                        message: messageArea.val()
                                    },
                                    dataType: 'json',
                                    statusCode: {
                                        403: function(response) {
                                            alert(bbLang('USER_MESSAGE_FORBIDDEN'));
                                        }
                                    },
                                    success: function(resp) {
                                        quickMessageForm.html(bbLang('USER_MESSAGE_POPUP_SUCCESS_SENDED')).fadeOut(2000);
                                    }
                                });
                            }
                            return false;
                        });
                    });
                }
                return false;
            });
        }
    };

    $.fn.bbUserInfoReview = function(method) {
        if (bbUserInfoReviewMethods[method]) {
            return bbUserInfoReviewMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            return bbUserInfoReviewMethods.init.apply(this, arguments);
        }
        return this;
    }

    var bbUserInfoReviewMethods = {
        init: function(params) {
            bbUserInfoFriendsMethods.loadAnotherInit(this, params);
            bbUserInfoFriendsMethods.MessageQuickSendInit(this, params);
        },
        form: function(params) {
            var container = $('.js__reviewFormContainer');
            $(this).off('click').on('click', function() {
                var objectWin = $("<div />");
                $.when(objectWin.bbTpl("//user/infoReviewForm", {})).then(function() {
                    var inserted = container.html(objectWin.html());
                    inserted.find('a.js__infoReviewFormCancel').off('click').on('click', function() {
                        $.when(container.bbTpl("//user/infoReviewLink", {})).then(function() {
                            container.find('a.js__reviewForm').bbUserInfoReview('form', params);
                        });
                        return false;
                    });
                    inserted.find('a.js__infoReviewFormSubmit').off('click').on('click', function() {
                        inserted.find('form').submit();
                    });
                    inserted.find('form').off('submit').on('submit', function() {
                        $.ajax(params.addUrl, {
                            type: "POST",
                            data: {text: $(this).find('textarea').val()},
                            dataType: 'json',
                            statusCode: {
                                400: function(response) {
                                    alert(bbLang('USER_REVIEW_BAD_REQUEST'));
                                }
                            },
                            success: function(resp) {
                                container.html(bbLang('USER_REVIEW_SUCCESS_ADD'));
                            }
                        });
                        return false;
                    });
                });
                return false;
            })
        },
        manage: function(params) {
            $(this).each(function() {
                var self = $(this);
                self.find('a.js__delete_review').off('click').on('click', function() {
                    if (confirm(bbLang('CONFIRM_DELETE'))) {
                        $.ajax($(this).attr('href'), {
                            type: "POST",
                            data: {},
                            dataType: 'json',
                            success: function(resp) {
                                self.fadeOut(500, function() {
                                    $(this).remove()
                                });
                                var cnt = $('li.active .js__reviewCount');
                                cnt.html(parseInt(cnt.html()) - 1);
                            }
                        });
                    }
                    return false;
                });
                self.find('a.js__accept_review').off('click').on('click', function() {
                    $.ajax($(this).attr('href'), {
                        type: "POST",
                        data: {},
                        dataType: 'json',
                        success: function(resp) {
                            self.fadeOut(500, function() {
                                $(this).remove()
                            });
                            var totalCnt = $('.js__reviewTotalCount');
                            totalCnt.html(parseInt(totalCnt.html()) + 1);
                            var moderateCnt = $('.js__reviewModerateCount');
                            moderateCnt.html(parseInt(moderateCnt.html()) - 1);
                        }
                    });
                    return false;
                });
            });
        }
    };


    //Сообщество
    //действия пользователя связанные с модераторами, тут могут быть жалобы, переписка с модераторм и прочее
    $.fn.bbCommunityUserToModerator = function(method) {
        if (typeof method === 'object' || !method) {
            bbCommunityUserToModeratorMethods.init.apply(this, [arguments[0]]);
        } else if (bbCommunityUserToModeratorMethods[method]) {
            bbCommunityUserToModeratorMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityUserToModerator');
        }

        return this;
    }

    var bbCommunityUserToModeratorMethods = {
        openPlea: null,
        //переписка с модератором
        initMessage: function(params) {
            var windowForm = $(this);

            windowForm.attr('action', params.submitUrl);
            windowForm.bbValidateForm({
                onComplete: function(result) {
                    var messageElm = windowForm.find('textarea[name="message"]');
                    var objectWin = $('<div/>');
                    $.when(objectWin.bbTpl("//community/moderatorMessageRow", {message: messageElm.val()})).then(function() {
                        var block = $(objectWin.html()).insertAfter($('#top_conversation'));
                        messageElm.val('');
                        bbM.flashEvent(bbLang('COMMUNITY_MESSAGE_SEND'), true);
                    });
                }
            });
        },
        //инициализация жалоб в постах
        initPleaPost: function(params) {
            $(this).on('click.addPlea', function() {
                bbCommunityUserToModeratorMethods.addPlea.apply(this);
                return false;
            });
        },
        //инициализация жалоб в комментариях
        initPleaComment: function(params) {
            bbCommunityUserToModeratorMethods.pleaParam = params;
            $(this).on('click.addPlea', function() {
                bbCommunityUserToModeratorMethods.addPlea.apply(this, [true]);
                return false;
            });
        },
        addPlea: function(isCommentPlea) {
            //если на странице уже есть открытая форма комментирования, то мы ее удаляем
            if (bbCommunityUserToModeratorMethods.openPlea) {
                var $return = $(this).hasClass('active') ? true : false

                $(bbCommunityUserToModeratorMethods.openPlea).prev().removeClass('active');
                $(bbCommunityUserToModeratorMethods.openPlea).remove();

                if ($return) {
                    return false;
                }
            }

            var self = $(this);
            if (isCommentPlea && bbCommunityUserToModeratorMethods.pleaParam) {
                for (var key in bbCommunityUserToModeratorMethods.pleaParam) {
                    self.data(key, bbCommunityUserToModeratorMethods.pleaParam[key]);
                }
            }

            var formData = {
                object_id: self.data('object_id'),
                object_type: self.data('object_type'),
                object_user_id: self.data('object_user_id'),
                object_comment_id: self.data('object_comment_id'),
                object_comment_user_id: self.data('object_comment_user_id')
            };

            var objectWin = $('<div/>');

            $.when(objectWin.bbTpl("//community/pleaForm", formData)).then(function() {
                self.addClass('active');
                var windowForm = $(objectWin.html()).insertAfter(self);
                var $textarea = windowForm.find('textarea[name="pleaText"]');

                BBAPI.dom().radio("js__radioPlea");
                var pleaType = windowForm.find('input[name="pleaType"]');
                pleaType.on('ifChecked', function(event) {
                    //очищаем текст жалобы
                    $textarea.val('');

                    if ($(this).val() && $(this).val() == '3') {
                        $textarea.parent().fadeIn();
                    } else {
                        $textarea.parent().fadeOut();
                    }
                });

                windowForm.offset({
                    left: self.offset().left - 180
                });

                windowForm.attr('action', '/community/moderator/ajax_add_plea/' + self.data('chpu_name'));
                windowForm.bbValidateForm({
                    preExec: function() {
                        var $pleaType = windowForm.find('input[name="pleaType"]:checked');

                        if ($pleaType.val() != 3) {
                            $textarea.val($pleaType.parent().next().html());
                        }

                        var $pleaText = $textarea.val();
                        if (!$pleaText) {
                            alert('Заполните все поля');
                        } else {
                            windowForm.find('input[name="comment"]').val($pleaText);
                        }
                    },
                    onComplete: function(result) {
                        windowForm.remove();
                        self.remove();
                        bbM.flashEvent('Жалоба отправлена модератору', true, false, 1500);
                    }
                });

                bbCommunityUserToModeratorMethods.openPlea = windowForm;
            });
        }
    };

    //Показывать/скрывать блок закрепленных сообщений в ленте сообщества
    $.fn.bbModeratorBlock = function(method) {
        if (typeof method === 'object' || !method) {
            bbModeratorBlockMethods.init.apply(this, [arguments[0]]);
        } else if (bbModeratorBlockMethods[method]) {
            bbModeratorBlockMethods[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityUserToModerator');
        }

        return this;
    }

    var bbModeratorBlockMethods = {
        param: null,
        init: function(param) {
            var self = $(this);
            var ul = self.find('ul');

            bbModeratorBlockMethods.param = param;

            self.find('.js__close').off('click').on('click.bbModeratorBlockClose', function() {
                bbModeratorBlockMethods.actionBlock.apply(this, [self, ul]);
                return false;
            });

        },
        actionBlock: function(self, ul) {

            if (ul.is(':hidden')) {
                bbModeratorBlockMethods.show.apply(this, [self, ul]);
            } else {
                bbModeratorBlockMethods.hide.apply(this, [self, ul]);
            }

            return false;
        },
        show: function(self, ul) {
            $.post('/community/setting/ajax_set_moderator_block', {
                user_id: bbModeratorBlockMethods.param.user_id,
                community_id: bbModeratorBlockMethods.param.community_id,
                status: 0
            }, function(res) {
                ul.show();
                self.find('[rel="close"]').text('Свернуть');
            });
        },
        hide: function(self, ul) {
            $.post('/community/setting/ajax_set_moderator_block', {
                user_id: bbModeratorBlockMethods.param.user_id,
                community_id: bbModeratorBlockMethods.param.community_id,
                status: 1
            }, function(res) {
                ul.hide();
                self.find('[rel="close"]').text('Развернуть');
            });
        }
    };

    $.fn.bbPopupAuthentication = function(method, callback) {
        if (typeof method === 'object' || !method) {
            bbPopupAuthentication.init.apply(this, [arguments[0]]);
        } else if (bbPopupAuthentication[method]) {
	            return bbPopupAuthentication[ method ].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('Метод с именем ' + method + ' не существует для jQuery.bbCommunityUserToModerator');
        }

        return this;
    }

    var bbPopupAuthentication = {
        _popup: false,
        init: function(param) {
            var $that = $(this);

            $that.on('click.popupAuthenticationOpen', function() {
                return bbModeratorBlockMethods.actionBlock.apply(this, [param]);
            });
        },
        checkUser: function (callback) {
            if ( !bbM.check_is_logged ) {
                //проверяем залогинен ли пользователь
                $.get('/user/login/is_logged', function(result) {
                    bbM._isLogged = result ? true : false;
                    bbM.check_is_logged = true;
	                  callback && callback(bbM._isLogged);
                    return bbPopupAuthentication.showPopup.apply(this, [callback]);
                });
            } else {
	              callback && callback(bbM._isLogged);
                return bbPopupAuthentication.showPopup.apply(this, [callback]);
            }
        },
        showPopup: function(param) {
            if (bbM._isLogged)
                return false;

            if (bbPopupAuthentication._popup) {
                bbPopupAuthentication._popup.show();
                return true;
            }

            var objectWin = $('<div/>');
            var formData = {
                comeBackUrl: location.href
            };

            $.when(objectWin.bbTpl("//user/popupAuthentication", formData)).then(function() {
                var $authBlock = $(objectWin.html()).appendTo('body');

                BBAPI.utils.placeholder($authBlock[0]);

                $('#tpl__authBlockClose').on('click.authBlockClose', function() {
                    $authBlock.hide();
                    return false;
                });

                var $registerForm = $('#tpl__registerForm');
                $registerForm.bbValidateForm({
                    preExec: function() {
                        bbPopupAuthentication.markAsNotActive(registerInput, loginInput);
                    },
                    onComplete: function(result) {
                        window.location.href = result;
                    }
                });

                var $loginForm = $('#tpl__loginForm');
                $loginForm.bbValidateForm({
                    preExec: function() {
                        bbPopupAuthentication.markAsNotActive(loginInput, registerInput);
                    },
                    onComplete: function(result) {
                        window.location.href = result;
                    }
                });

                //если пользователь уже пытался зарегистрироваться получаем его данные
                $.get('/user/register/ajax_user_data', function(result) {
                    if (result) {
                        $registerForm.find('input[name="fio"]').val(result.user.fio);
                        $registerForm.find('input[name="password"]').val(result.user.password);
                        $registerForm.find('input[name="email"]').val(result.user.email);
                    }
                });

                var registerInput = $registerForm.find('input');
                var loginInput = $loginForm.find('input');

                bbPopupAuthentication.focusField(registerInput, loginInput);
                bbPopupAuthentication.focusField(loginInput, registerInput);

                bbPopupAuthentication._popup = $authBlock;
            });

            return true;
        },
        focusField: function(activeForm, passiveForm) {
            activeForm.on('focus.inputFocus', function() {
                $(this).off('focus.validateField');
                bbPopupAuthentication.markAsNotActive(activeForm, passiveForm);
            });
        },
        markAsNotActive: function(activeForm, passiveForm) {
            activeForm.parent().removeClass('pseudo-input-blue');
            passiveForm.off('focus.validateField').parent().addClass('pseudo-input-blue');

            passiveForm.each(function() {
                var $that = $(this);

                if ($that.parent().parent().hasClass('_dataerror')) {
                    $that.parent().unwrap('<div class="_dataerror">');
                }

                if ($that.parent().next().attr('id') == $that.attr('name') + '_error') {
                    $that.parent().next().remove();
                }
            });
        }
    };

    $.fn.bbRightHelper = function (method) {
        $(this).off('click').on('click', function () {
            var id = $(this).data('id');
            var title = $(this).attr('data-title');
            if (!title) title = $(this).text();
            var objectWin = $('<div/>');
            if (id) {
                objectWin.html($('#helpitem' + id).html());
                var m = BBAPI.modal().init({
                    id: objectWin[0],
                    type: "C",
                    style: { width: 600 },
                    header_title: title,
                    show_cb: function(){
                        this._modal.style.top = "50%";
                        $('.scrollbarY .viewport').css('height', $('.popup-city-sb').css('height'));
                        $('.scrollbarY').each(function(i) {
                            var s = $(this).tinyscrollbar({delay: 250});
                            s.tinyscrollbar_update("", {delay: 1000});
                        });
                    }
                }).show();
            }
            return false;
        });
        return this;
    };

})(jQuery);
