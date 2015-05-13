/*!
 * jQuery YouTube Popup Player Plugin v2.4
 * http://lab.abhinayrathore.com/jquery_youtube/
 * https://github.com/abhinayrathore/jQuery-YouTube-Popup-Player-Plugin
 */
(function ($, window) {
	var YouTubeDialog = null,
        defaultCss = {},
        methods = {
            //initialize plugin
            init: function (options) {
                options = $.extend({}, $.fn.YouTubePopup.defaults, options);

                // initialize YouTube Player Dialog
                if (YouTubeDialog === null) {
                    YouTubeDialog = $('<div>').css({
                        display: 'none',
                        padding: 0
                    });
                    $('body').append(YouTubeDialog);
                    YouTubeDialog.dialog({
                        autoOpen: false,
                        resizable: false,
                        draggable: options.draggable,
                        modal: options.modal,
                        dialogClass: options.cssClass,
                        create: function () {
                            defaultCss.backgroundImage = $(".ui-dialog").css('background-image');
                            defaultCss.border = $(".ui-dialog").css('border');
                            defaultCss.backgroundColor = $(".ui-dialog").css('background-color');
                        },
                        close: function () {
                            YouTubeDialog.html('');
                            $(".ui-dialog-titlebar").show();
                            $(".ui-dialog").css({
                                'background-image': defaultCss.backgroundImage,
                                'border': defaultCss.border,
                                'background-color': defaultCss.backgroundColor
                            });
                        }
                    });
                }

                return this.each(function () {
                    var obj = $(this),
                        data = obj.data('YouTube'),
                        youtubeId,
                        videoTitle,
                        YouTubeURL,
                        $titleBar;
                    if (!data) { //check if event is already assigned
                        obj.data('YouTube', {
                            target: obj
                        });
                        $(obj).bind('click.YouTubePopup', function (event) {
                            youtubeId = options.youtubeId;
                            if ($.trim(youtubeId) === '' && obj.is("a")) {
                                youtubeId = getYouTubeIdFromUrl(obj.attr("href"));
                            }
                            if ($.trim(youtubeId) === '' || youtubeId === false) {
                                youtubeId = obj.attr(options.idAttribute);
                            }
                            videoTitle = $.trim(options.title);
                            if (videoTitle === '') {
                                if (options.useYouTubeTitle) {
                                    setYouTubeTitle(youtubeId);
                                } else {
                                    videoTitle = obj.attr('title');
                                }
                            }

                            //Format YouTube URL
                            YouTubeURL = window.location.protocol + "//www.youtube.com/embed/" + youtubeId + "?rel=0&showsearch=0&autohide=" + options.autohide;
                            YouTubeURL += "&autoplay=" + options.autoplay + "&controls=" + options.controls + "&fs=" + options.fs + "&loop=" + options.loop;
                            YouTubeURL += "&showinfo=" + options.showinfo + "&color=" + options.color + "&theme=" + options.theme;

                            //Setup YouTube Dialog
                            YouTubeDialog.html(getYouTubePlayer(YouTubeURL, getDimension('width',options), getDimension('height',options)));
                            YouTubeDialog.dialog({ //reset width and height
                                width: 'auto',
                                height: 'auto'
                            });
                            YouTubeDialog.dialog({
                                minWidth: getDimension('width',options),
                                minHeight: getDimension('height',options),
                                title: videoTitle
                            });
                            YouTubeDialog.dialog('open');
                            $(".ui-widget-overlay").fadeTo('fast', options.overlayOpacity); //set Overlay opacity
                            $titleBar = $(".ui-dialog-titlebar");
                            if (options.hideTitleBar && options.modal) { //hide Title Bar (only if Modal is enabled)
                                $titleBar.hide(); //hide Title Bar
                                $(".ui-widget-overlay").click(function () { //automatically assign Click event to overlay
                                    YouTubeDialog.dialog("close");
                                });
                            }
                            if (options.clickOutsideClose && options.modal) { //assign clickOutsideClose event only if Modal option is enabled
                                $(".ui-widget-overlay").click(function () {
                                    YouTubeDialog.dialog("close");
                                });
                            }
                            $titleBar.removeClass("ui-corner-all").addClass("ui-corner-top"); //only round the top corners on titlebar
                            if (!options.showBorder) {
                                $(".ui-dialog").css({
                                    'background-image': 'none',
                                    'border': 'none',
                                    'background-color': 'transparent'
                                });
                            }
                            event.preventDefault();
                        });
                    }
                });
            },
            destroy: function () {
                return this.each(function () {
                    $(this).unbind(".YouTubePopup");
                    $(this).removeData('YouTube');
                });
            }
        };

	function getYouTubePlayer(URL, width, height) {
		var YouTubePlayer = '<iframe title="YouTube video player" style="margin:0; padding:0;" width="' + width + '" ';
		YouTubePlayer += 'height="' + height + '" src="' + URL + '" frameborder="0" allowfullscreen></iframe>';
		return YouTubePlayer;
	}
    

	function setYouTubeTitle(id) {
        $.ajax({
            url: window.location.protocol + '//query.yahooapis.com/v1/public/yql',
            data: {
                q: "select * from json where url ='http://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=" + id + "&format=json'",
                format: "json"
            },
            dataType: "jsonp",
            success: function (data) {
                if (data && data.query && data.query.results && data.query.results.json) {
                    YouTubeDialog.dialog({
					   title: data.query.results.json.title
				    });
                }
            }
        });
	}

	function getYouTubeIdFromUrl(youtubeUrl) {
		var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
            match = youtubeUrl.match(regExp);
		if (match && match[2].length === 11) {
			return match[2];
		} else {
			return false;
		}
	}

        function getDimension(dimension,options){
		//Dimension must be 'width' or 'height' to get return value
        var browserWidth  = $( window ).width();
        var browserHeight = $( window ).height(); 
        var tempWidth = options.width;  //Use option value as default
        var tempHeight = options.height; //Use option value as default
        
        if(browserWidth<options.width||browserHeight<options.height){//Viewpoint is smaller than options
            if(browserWidth<browserHeight){ //Portrate View    
				if(browserWidth<options.width){ //Browser is smaller in width
		            tempWidth = browserWidth - 5;
					tempHeight = tempWidth / 1.3;  //Ratio to keep video perspective			
				}	
            }else    //Landscape View
            {
			    if(browserHeight<options.height){
                    tempHeight = browserHeight - 5
                    tempWidth = tempHeight * 1.3 //
                }
            }
        }

        if(dimension==='width'){
            return tempWidth;
        }else if(dimension==='height'){
            return tempHeight;
        }
			
	}
    
	$.fn.YouTubePopup = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.YouTubePopup');
		}
	};

	//default configuration
	$.fn.YouTubePopup.defaults = {
		'youtubeId': '',
		'title': '',
		'useYouTubeTitle': true,
		'idAttribute': 'rel',
		'cssClass': 'YouTubeDialog',
		'draggable': false,
		'modal': true,
		'width': 640,
		'height': 480,
		'hideTitleBar': false,
		'clickOutsideClose': false,
		'overlayOpacity': 0.5,
		'autohide': 2,
		'autoplay': 1,
		'color': 'red',
		'controls': 1,
		'fs': 1,
		'loop': 0,
		'showinfo': 0,
		'theme': 'light',
		'showBorder': true
	};
})(jQuery, window);
