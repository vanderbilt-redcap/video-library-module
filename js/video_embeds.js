var VideoLibraryModule = {
	youTubeSelector: 'iframe[src*="youtube.com"]',
	vimeoSelector: 'iframe[src*="vimeo.com"]',
	videoCount: 0,
	players: {},
	elementsInitialized: {},
	init: function(){
		VideoLibraryModule.trackVideos()
		/*$('div#curtain').click(function(){
				$("#curtain").hide()
				player.playVideo()
			}
		})*/
	},
	trackVideos: function(){
		// YT may always be loaded by this point these days. We'll leave the following block in place just in case.
		if(typeof YT == 'undefined' || !YT.loaded){
			// The YouTube framework hasn't loaded yet. Delay initialization.

			setTimeout(function(){
				VideoLibraryModule.trackVideos()
			}, 50)

			return
		}

		var selector = VideoLibraryModule.youTubeSelector + ', ' + VideoLibraryModule.vimeoSelector
		// var selector = VideoLibraryModule.youTubeSelector

		// Handle videos configured to display inline
		$(selector).each(function(index, element){
			VideoLibraryModule.handleVideoElement(element)
		})

		// Handle videos configured to display inside a popup
		new MutationObserver(function(mutations) {
			mutations.forEach(function(mutation) {
				if(mutation.removedNodes.length > 0){
					for(var fieldName in VideoLibraryModule.elementsInitialized){
						var element = VideoLibraryModule.elementsInitialized[fieldName]
						if(!element.parentElement || !element.parentElement.parentElement || !element.parentElement.parentElement.parentElement){
							// This video must have been inside a popup that was since closed.
							// Log the close event so we can determine when the user stopped watching the video.
							// VideoLibraryModule.logVideoEvent(fieldName, 'popup closed')
							delete VideoLibraryModule.elementsInitialized[fieldName]
						}
					}
				}

				var nodes = mutation.addedNodes
				if (!nodes) {
					return
				}

				for(var i=0; i<nodes.length; i++){
					var element = nodes[i]
					if(!element){
						return
					}

					if($(element).is(selector)){
						VideoLibraryModule.handleVideoElement(element)
					}
				}
			})
		}).observe(document.body, {childList: true, subtree: true})
	},
	handleVideoElement: function(element){
		for(var fieldName in this.elementsInitialized){
			if(element === this.elementsInitialized[fieldName]){
				// We've already initialized this element.
				return
			}
		}

		element = $(element)

		var result
		if(element.is(this.youTubeSelector)){
			result = this.handleYouTubeElement(element)
		}
		else if(element.is(this.vimeoSelector)){
			result = this.handleVimeoElement(element)
		}
		else{
			simpleDialog("The Video Library module couldn't process one of the videos on this page because it is not hosted on YouTube or Vimeo.")
		}

		if(result) {
			this.elementsInitialized[result.fieldName] = result.element
		}
		else{
			simpleDialog("An error occurred while processing video events.  Please report this error to an administrator.")
		}
	},
	handleYouTubeElement: function(element){
		this.videoCount++;
		var height = element.attr('height')
		var width = element.attr('width')
		var src = element.attr('src').split('/').pop().split('?')[0]
		var parent = element.parent()

		var fieldName = VideoLibraryModule.getFieldNameForElement(element)
		var newElement = $('<div class="video-container">\
								<div id="curtain-'+this.videoCount+'" class="video-curtain">\
									<h5></h5>\
								</div>\
								<div class="ytplayer"></div>\
							</div>')
		element.replaceWith(newElement)
		$("#curtain-"+this.videoCount).hide();

		var module = this
		var player = new YT.Player($(newElement).find('.ytplayer')[0], {
			height: height,
			width: width,
			videoId: src,
			events: {
				'onStateChange': function(e){
					var code = e.data

					var event = null
					if(code == YT.PlayerState.PLAYING){
						event = 'play'
					}
					else if(code == YT.PlayerState.PAUSED){
						event = 'pause'
					}
					else if(code == YT.PlayerState.ENDED){
						event = 'ended'
					}

					if (event == 'ended') {
						if(hideEndVideosYouTube == 1) {
							$(newElement).find(".video-curtain h5").text("Click to replay video.");
							$(newElement).find(".video-curtain").show();
						}
					} else if(event == 'pause') {
						if(hideEndVideosYouTube == 1) {
							$(newElement).find(".video-curtain h5").text("Click to resume video.");
							$(newElement).find(".video-curtain").show();
						}
					} else {
						$(newElement).find(".video-curtain").hide();
					}

					// if(event){
					// 	module.logVideoEvent(fieldName, event, e.target.getCurrentTime())
					// }
				}
			}
		})

		$("#curtain-"+this.videoCount).click(function(){
			$(newElement).find(".video-curtain").hide();
			player.playVideo();
		});

		return {
			fieldName: fieldName,
			element: parent.find('iframe')[0] // Get the new iframe created by the YouTube library
		}
	},
	handleVimeoElement: function(element){
		this.videoCount++;
		var embedParent = element.parent();
		var newVimeoBlockElement = $('<div id="curtain-'+this.videoCount+'" class="video-curtain">\
										<h5></h5>\
									</div>')
		embedParent.prepend(newVimeoBlockElement);
		$(newVimeoBlockElement).hide();
		element = element[0]

		var module = this
		var player = new Vimeo.Player(element)
		var fieldName = VideoLibraryModule.getFieldNameForElement(element)

		// ;['play', 'pause', 'ended', 'seeked'].forEach(function(event){
		// 	player.on(event, function() {
		// 		player.getCurrentTime().then(function(seconds) {
		// 			module.logVideoEvent(fieldName, event, seconds)
		// 		})
		// 	})
		// })

		player.on('ended', function() {
			if(hideEndVideosVimeo == 1) {
				$(newVimeoBlockElement).find("h5").text("Click to replay video.");
				$(newVimeoBlockElement).show();
			}
		})
		player.on('pause', function() {
			if(hideEndVideosVimeo == 1) {
				$(newVimeoBlockElement).find("h5").text("Click to resume video.");
				$(newVimeoBlockElement).show();
			}
		})

		$("#curtain-"+this.videoCount).click(function(){
			$(newVimeoBlockElement).hide();
			player.play();
		});

		return {
			fieldName: fieldName,
			element: element
		}
	},
	getFieldNameForElement: function(element){
		element = $(element)

		var id = element.attr('id')
		var popupIdPrefix = 'rc-embed-video'

		var name = null
		if(id && id.indexOf(popupIdPrefix) === 0){
			name = id.substr(popupIdPrefix.length+1)
		}
		else{
			var rowId = element.closest('tr').attr('id')
			var parts = rowId.split('-')

			if(parts[1] === 'tr') {
				name = parts[0]
			}
		}
		
		if(!name){
			// alert('An error occurred while detecting a field name for logging!  Please report this error.')
		}

		return name
	},
	logVideoEvent: function(fieldName, event, seconds){
		if(seconds){
			seconds = seconds.toFixed(2)
		}

		// Normalize to past tense
		if(event === 'play'){
			event += 'ed'

			if(window.OddcastAvatarExternalModule){
				// If the avatar module is enabled, make sure it is not speaking currently.
				OddcastAvatarExternalModule.stopSpeech()
			}
		}
		else if (event === 'pause') {
			event += 'd'
		}

		ExternalModules.Vanderbilt.VideoLibraryModule.log('video ' + event, {
			field: fieldName,
			seconds: seconds
		})
	}
}

$(function(){
	VideoLibraryModule.init();
})