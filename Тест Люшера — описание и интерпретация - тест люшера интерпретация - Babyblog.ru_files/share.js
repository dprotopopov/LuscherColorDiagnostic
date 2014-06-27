/**
 * Used sources provided by http://habrahabr.ru/users/WuWu/
 * @see http://habrahabr.ru/post/156185/
 */
(function($) {
    $.fn.bbSocNetShare = function ( method ) {
        if ( bbSocNetShareMethods[method] ) {
            return bbSocNetShareMethods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else {
            return bbSocNetShareMethods.init.apply( this, arguments );
        }
        return this;
    }
    var bbSocNetShareMethods = {
        params: {},
        init: function(params)
        {
            bbSocNetShareMethods.params = params;
            for(var a in this)
            {
                if(this[a].className)
                {
                    $(this[a]).off('click.sharePost').on('click.sharePost', function(){
                        var $self = $(this);
                        var shareType = $self.data('type');
                        var sharePlace = $self.data('place');
                        bbSocNetShareMethods[shareType]();
                        return false;
                    })
                }
            }
        },
        vkontakte: function() {
            var url  = 'http://vkontakte.ru/share.php?';
            url += 'url='          + encodeURIComponent(bbSocNetShareMethods.params.url);
            url += '&title='       + encodeURIComponent(bbSocNetShareMethods.params.title);
            url += '&description=' + encodeURIComponent(bbSocNetShareMethods.params.text);
            url += '&noparse=true';
            bbSocNetShareMethods.popup(url);
        },
        facebook: function() {
            var url  = 'http://www.facebook.com/sharer.php?s=100';
            url += '&p[title]='     + encodeURIComponent(bbSocNetShareMethods.params.title);
            url += '&p[summary]='   + encodeURIComponent(bbSocNetShareMethods.params.text);
            url += '&p[url]='       + encodeURIComponent(bbSocNetShareMethods.params.url);
            bbSocNetShareMethods.popup(url);
        },
        twitter: function() {
            var url  = 'http://twitter.com/share?';
            url += 'text='      + encodeURIComponent(bbSocNetShareMethods.params.title);
            url += '&url='      + encodeURIComponent(bbSocNetShareMethods.params.url);
            url += '&counturl=' + encodeURIComponent(bbSocNetShareMethods.params.url);
            bbSocNetShareMethods.popup(url);
        },
        gplus: function() {
            var url = 'https://plus.google.com/share?url=' + encodeURIComponent(bbSocNetShareMethods.params.url);
            bbSocNetShareMethods.popup(url);
        },
        popup: function(url) {
            window.open(url,'','toolbar=0,status=0,width=626,height=436');
        }
    }
})(jQuery);