(function(){

    var likeSendSelector = '.js__me';
    var likeCountSelector = '[rel="cnt"]';
    var listContentSelector = '.overview';
    var listSelector = '.user-likes';
    var listLoadProcessing = false;
    var mainDomain = 'http://act.babyblog.ru';
    var unlikeGlobalUrl = mainDomain + '/set/unlike';
    var likeGlobalUrl = mainDomain + '/set';
    var urlGetUsers = mainDomain + '/get/users';
    var urlLikesInfo = mainDomain + '/like';
    var urlMetric = 'http://www.babyblog.ru/metric.php';

    var templateListUsers = '\n\
		<div class="popup css-corner-3 clearfix user-likes">\n\
			<div class="popup-header rel">\n\
				<b class="_21 _it _georgia _227">Кому понравилось</b>\n\
				<a href="#" title="" class="icon icon-popup-close db abs likes-close"></a>\n\
			</div>\n\
			<div class="popup-body popup-body-auto rel oh">\n\
				<div class="scrollbarY">\n\
					<div class="scrollbar"><div class="thumb"></div></div>\n\
					<div class="viewport">\n\
						<div class="overview">\n\
						</div>\n\
					</div>\n\
				</div>\n\
			</div>\n\
			<div class="popup-footer rel _ac">\n\
			  <a <%if (liked){%>data.su_liked="1"<%}%> class="btn track-btn dib big _b _b_s _b_btn css-corner-3 ml0 mb0 <%if (liked){%> liked<%}%>"><i class="icon icon-like db i_18 abs ifix"></i>Мне нравится</a>\n\
			</div>\n\
		</div>\n\
		<div class="overlay upload-overlay user-likes" style="display: block;"></div>';
    
    var templateOneUser = '\n\
        <div class="comment oh rel clearfix">\n\
            <div class="avatar a_60 abs mark css-round">\n\
                <div class="rel">\n\
                    <img width="60" height="60" class="css-round" src="<%=avatar%>">\n\
                </div>\n\
            </div>\n\
            <div class="posted rel clearfix mb1">\n\
                <a class="user-name _link rel _15" title="" href="http://www.babyblog.ru/user/lenta/<%=login%>">\n\
                    <%=fio%> <i class="icon i_18 ifix icon-offline abs db"></i>\n\
                    <%if (is_friend){%><span class="icon-friendship abs db"><s class="css-corner-3  "><b>Подружка</b><u class="icon i_18 db abs icon-friendship "></u></s></span><%}%>\n\
                </a>\n\
            </div>\n\
            <div class="user-tile-data clearfix">\n\
                <%if (childrens){%>\n\
		    <% for(var ch = 0; ch < childrens.length; ch++){%>\n\
			<a title="" class="mark i_25-20 fl icon-<% if (childrens[ch].sex=="m"){%>m<%}else{%>f<%}%>" title="<%=childrens[ch].name%>, <%=childrens[ch].age%>"></a>\n\
		    <%}%>\n\
		<%}%>\n\
		<% if(typeof preg_try != "undefined"){%><a class="mark i_25-20 icon-planed fl"></a><%}%>\n\
		<%if (preg){%>\n\
			<%if (preg.d){%>\n\
				<a class="embrio embrio-<%=preg.s%> embrio-part-<%=preg.l%> fl js-init-bubble showed" title="<%=preg.d%>"></a>\n\
			<%}else{%>\n\
				<a class="embrio embrio-unknown fl" title="<%=preg%>"></a>\n\
			<%}%>\n\
		<%}%>\n\
		<%if (country || city){%>\n\
		    <a  href="#" class="_12 _lgr _nw fl">\n\
			<%if (country){%><%=country%><%}%><%if (city){%>, <%=city%><%}%>\n\
		    </a>\n\
		    <%}%>\n\
               </div>\n\
        </div>\n\
        ';
         
    $.fn.BbSocialLike = function (params) {          
	var sendParams = [];
	$('.js__like_block').each(function(){
	    sendParams.push($(this).data());
	});
	if (sendParams && sendParams.length){
	$.ajax(urlLikesInfo, {
	    type: "GET",
	    //async: false,
	    //contentType: "application/json",
	    dataType: 'jsonp',
	    data: {
		data: sendParams,
		user: params.user ? params.user : 0
	    },

	    success: function(response){
		var key = 0;
		$('.js__like_block').each(function(){
		    var likeObj = $(this);
                                        
		    likeObj.data('count',response[key].count);
		    likeObj.data('su_liked',response[key].liked);
		    if (response[key].liked && response[key].liked > 0){
			likeObj.addClass('active');
		    }
		    if (response[key].count && response[key].count > 0){
			var inserted = $("<div class='track-count css-corner-12' rel='cnt'>+"+response[key].count+"</div>").appendTo(likeObj);
			inserted.off('click').on('click',function(){
			    $.fn.BbSocialLikeList(likeObj, params.user ? params.user : false);
			    return false;
			});
		    }
		    likeObj.find(likeSendSelector).off('click').on('click', function(){
			$.fn.BbSocialLikeSend(likeObj, params.user ? params.user : false);
			return false;
		    });
		    key++;
		});
	    }
	});
	}
    };

    $.fn.BbSocialLikeLite = function (params) {
        var sendParams = [];
        $('.js__like_block_lite').each(function(){
            sendParams.push($(this).data());
        });

        $.ajax(urlLikesInfo, {
            type: "GET",
            //async: false,
            //contentType: "application/json",
            dataType: 'jsonp',
            data: {
                data: sendParams,
                user: params.user ? params.user : 0
            },

            success: function(response){
                var key = 0;
                $('.js__like_block_lite').each(function(){
                    var likeObj = $(this);
                    likeObj.data('count',response[key].count);
                    likeObj.data('su_liked',response[key].liked);
                    if (response[key].liked && response[key].liked > 0){
                        likeObj.addClass('active');
                    }
                    likeObj.prepend(response[key].count);
                    key++;
                });
            }
        });
    };

    $.fn.BbSocialLikeList = function (self, su_user) {
	var object_data = self.data();
	var sendData = {
	    user_id: su_user,
	    action: 'like',
	    object_type: object_data.type,
	    object_id: object_data.id,
	    object_parent: object_data.parent
	};

	$.ajax(urlGetUsers, {
	    type: "GET",
	    //async: false,
	    //contentType: "application/json",
	    dataType: 'jsonp',
	    data: sendData,

	    success: function(response){
		listLoadProcessing = false;

		var tplFnMain = $.fn.BbSocialLikeTpl(templateListUsers);
		var win = $(tplFnMain({
		    count: object_data.count, 
		    liked: object_data.su_liked
		    })).appendTo($('body'));

		win.find('.likes-close').off('click').on('click',function(){
		    $(".user-likes").remove();
		    return false;
		});

		win.find('.track-btn').off('click').on('click',function(){
		    $.fn.BbSocialLikeSendFromList(sendData,object_data.su_liked);
		    var cnt_title = win.find('[rel="cnt"]');
		    if (su_user && object_data.su_liked){
			cnt_title.html(parseInt(cnt_title.html())-1);
			self.data('su_liked',false);
			$(this).removeClass('liked');
		    }else if(su_user){
			cnt_title.html(parseInt(cnt_title.html())+1);
			self.data('su_liked',true);
			$(this).addClass('liked');
		    };

		    return false;
		});

		var listContent = win.find(listContentSelector);

		if (response){
		    var tplFnOneUser = $.fn.BbSocialLikeTpl(templateOneUser);
		    for (var prop in response) {
			if (response.hasOwnProperty(prop)) {
			    $(tplFnOneUser(response[prop])).appendTo(listContent);
			};
		    };
		};
		if(object_data.count > 5) {
		    $(win.find('.scrollbarY')).tinyscrollbar();
		}
		else {
		    $(win.find('.scrollbarY .scrollbar')).hide();
		}


		listContent.scroll(function(e){
		    if(!listLoadProcessing && ((listContent.scrollTop() + listContent.height()) / listContent[0].scrollHeight) * 100 > 80) {
			$.fn.bbSocialListLoadUsers(
			    sendData,
			    object_data.count,
			    listContent.children().length,
			    function(new_like_list, error){
				if(error){
				    listContent.off("scroll");
				};			    
			}
			);
		}
		});

	}
	});

    $.post(urlMetric, {
	"gauges": {
	    "likesList": {
		"value": '1'
	    }
	}
    });

    return false;
};

$.fn.bbSocialListLoadUsers = function (sendData,total,loaded, callback) {
    listLoadProcessing = true;
    if (total >= loaded){
	sendData.start = loaded;
	var win = $(listSelector);

	$.ajax(urlGetUsers, {
	    type: "GET",
	    //async: false,
	    //contentType: "application/json",
	    dataType: 'jsonp',
	    data: sendData,
	    success: function(response){
		if (response && !$.fn.bbSocialisNullObject(response)){
		    var tplFnOneUser = $.fn.BbSocialLikeTpl(templateOneUser);
		    for (var prop in response) {
			if (response.hasOwnProperty(prop)) {
			    $(tplFnOneUser(response[prop])).appendTo(win.find(listContentSelector));
			}
		    }
		    listLoadProcessing = false;
		    callback && callback(response);
		}else{
		    callback && callback(null, 1);
		}
	    }
	});
    };

    return false;
};

$.fn.bbSocialisNullObject = function (object) {
    var c = 0;
    for(var i in object) {
	c++;
	break;
    };
    return c == 0;
};

$.fn.BbSocialLikeSend = function (self, su_user) {
    if (!su_user || su_user < 0){
	alert('вы не авторизованы для данного действия');
	return false;
    };
    console.log(self);
    var object_data = self.data();
    var sendUrl = object_data.su_liked ? unlikeGlobalUrl : likeGlobalUrl;
    $.ajax(sendUrl, {
	type: "GET",
	//async: false,
	//contentType: "application/json",
	dataType: 'jsonp',
	data: {
	    user_id: su_user,
	    action: 'like',
	    object_type: object_data.type,
	    object_id: object_data.id,
	    object_parent: object_data.parent
	},
	success: function(response){
	    var liked = parseInt(self.find(likeCountSelector).text());
	    if (object_data.su_liked){
		self.data('count',parseInt(object_data.count)-1);
		self.removeData('su_liked');
		self.removeClass('active');
		if (liked && liked > 1){
		    self.find(likeCountSelector).text('+' + (liked-1));
		}
		else{
		    self.find(likeCountSelector).remove();
		}
	    }else{
		self.data('su_liked',true);
		self.data('count',parseInt(object_data.count)+1);
		if (liked && liked > 0){
		    self.find(likeCountSelector).text('+' + (liked+1));
		}else{
		    var inserted = $("<div class='track-count css-corner-12' rel='cnt'>+1</div>").appendTo(self);
		    inserted.off('click').on('click',function(){
			$.fn.BbSocialLikeList(self, su_user);
			return false;
		    });
		};

		self.addClass('active');
	    }
	}
    });
    $.post(urlMetric, {
	"gauges": {
	    "likeDo": {
		"value": '1'
	    }
	}
    });
};

$.fn.BbSocialLikeSendFromList = function (params,su_liked) {
    if (!params.user_id){
	alert('вы не авторизованы для данного действия');
	return false;
    };

    var sendUrl = su_liked ? unlikeGlobalUrl : likeGlobalUrl;
    $.ajax(sendUrl, {
	type: "GET",
	//async: false,
	//contentType: "application/json",
	dataType: 'jsonp',
	data: {
	    user_id: params.user_id,
	    action: 'like',
	    object_type: params.object_type,
	    object_id: params.object_id,
	    object_parent: params.object_parent
	}
    });

    $.post(urlMetric, {
	"gauges": {
	    "likeFromList": {
		"value": '1'
	    }
	}
    });
};

$.fn.BbSocialLikeTpl = function (str) {
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
};

})();
