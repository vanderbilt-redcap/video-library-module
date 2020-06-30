var dataChanged = false;
function changeDataTrigger() {
	dataChanged = true;
	window.onbeforeunload = function() {
		return 'You have unsaved changes! Are sure you want to navigate away from this page?';
	};
}
function clearChangeDataTrigger() {
	dataChanged = false;
	window.onbeforeunload = null;
}
// video LINKS
// add link
$("body").on('click', 'button.new-video-link', function(i, e) {
	VideoLibraryModule.newVideo(this);
})
$("body").on('click', 'button.new-video-tag', function(i, e) {
	VideoLibraryModule.newVideoTag(this);
})
$("body").on('click', 'button.remove-video-tag', function(i, e) {
	var btnParent = $(this).parent();
	if($(this).parent().parent().children().length <= 2) {
		$(this).parent().parent().children().find('button.remove-video-tag').remove();
	}
	btnParent.remove();
	changeDataTrigger();
})

// delete link
$("body").on('click', 'button.delete-video-link', function(i, e) {
	VideoLibraryModule.deleteVideo(this)
	if($('#video-links tbody').children().length <= 0) {
		$('.new-video-link.main-add-button').show();
	}
})

// SAVE CHANGES
$("body").on('click', '#save_changes', function(i, e) {
	// SETTINGS holds everything except icon files that were attached by user
	// form_data.settings will hold the encoded json string containing settings values
	
	var form_data = new FormData()
	
	var settings = {}
	// add video link data to settings
	$(".video-link").each(function(i, link) {
		var url = $(link).find('.video_url').val();
		var title = $(link).find('.video_title').val();
		var description = $(link).find('.video_description').val();
		if (!settings.video_links) {
			settings.video_links = [];
		}
		settings.video_links.push({});
		settings.video_links[settings.video_links.length-1].url = (url ? url : '');
		settings.video_links[settings.video_links.length-1].title = (title ? title : '');
		settings.video_links[settings.video_links.length-1].description = (description ? description : '');
		$(link).find('.video_tags').each(function(ix, tag) {
			var tagVal = $(tag).val();
			if (!settings.video_links[settings.video_links.length-1].tags) {
				settings.video_links[settings.video_links.length-1].tags = [];
			}
			if(tagVal) {
				settings.video_links[settings.video_links.length-1].tags.push(tagVal);
			}
		});
	});
	
	form_data.append('video_data', JSON.stringify(settings))
	
	$.ajax({
		url: VideoLibraryModule.saveConfigUrl,
		dataType: 'json',
		cache: false,
		contentType: false,
		processData: false,
		data: form_data,
		type: 'POST',
		success: function(response){
			clearChangeDataTrigger();
			simpleDialog(response.message)
			if (response.new_settings) {
				VideoLibraryModule.settings = JSON.parse(response.new_settings)
			}
		},
		error: function(response){
			simpleDialog(response.message)
		}
	})
})

// VideoLibraryModule icon/link functions
VideoLibraryModule.newVideo = function(element) {
	$("#video-links").css('display', 'table')

	var newRow = $("\
				<tr class='video-link' data-video-number=''>\
					<td>\
						<input class='video_url' type='text'/><br><br>\
						<button type='button' class='btn btn-outline-secondary smaller-text new-video-link'><i class='fas fa-plus'></i> Add</button>\
					</td>\
					<td>\
						<input class='video_title' type='text'/>\
					</td>\
					<td>\
						<textarea class='video_description'></textarea>\
					</td>\
					<td>\
						<div>\
							<input class='video_tags' style='min-width: 100px;' type='text'/>\
							<button type='button' class='btn btn-outline-secondary smaller-text new-video-tag'><i class='fas fa-plus'></i></button>\
						</div>\
					</td>\
					<td class=''>\
						<button type='button' class='btn btn-outline-secondary smaller-text delete-video-link ml-3'><i class='fas fa-trash-alt'></i></i> Remove</button>\
						<button type='button' class='btn btn-outline-secondary smaller-text new-video-link'><i class='fas fa-plus'></i> Add</button>\
					</td>\
				</tr>");
	if(element === undefined || $(element).hasClass('main-add-button')) {
		$('#video-links tbody').append(newRow);
		$('.new-video-link.main-add-button').hide();
	} else {
		$(element).parent().parent().after(newRow);
	}
	newRow.find('.video_url').change(function(){
		changeDataTrigger();
	});
	newRow.find('.video_title').change(function(){
		changeDataTrigger();
	});
	newRow.find('.video_description').change(function(){
		changeDataTrigger();
	});
	newRow.find('.video_tags').change(function(){
		changeDataTrigger();
	});
	newRow.find('.video_url').blur(function(){
		var urlVal = $(this).val();
		var currentTitle = $(newRow).find('.video_title').val();
		if(urlVal.length > 0 && (urlVal.includes("youtube") || urlVal.includes("vimeo")) && currentTitle.length == 0) {
			$.getJSON('https://noembed.com/embed', {format: 'json', url: urlVal}, function (data) {
				if(data.title.length > 0) {
					$(newRow).find('.video_title').val(data.title);
				}
			});
		}
	});
	VideoLibraryModule.renumberLinks()
}
VideoLibraryModule.newVideoTag = function(element) {

	$("#video-links").css('display', 'table');
	var newTagElement = $("<div>\
								<input class='video_tags' style='min-width: 100px;' type='text'/>\
								<button type='button' class='btn btn-outline-secondary smaller-text remove-video-tag'><i class='fas fa-minus'></i></button>\
								<button type='button' class='btn btn-outline-secondary smaller-text new-video-tag'><i class='fas fa-plus'></i></button>\
							</div>");
	$(element).parent().after(newTagElement);
	if($(element).parent().parent().children().length == 2) {
		$(element).parent().parent().children(':first-child').find('button.remove-video-tag').remove();
		$(element).parent().parent().children(':first-child').find('input').after(" <button type='button' class='btn btn-outline-secondary smaller-text remove-video-tag'><i class='fas fa-minus'></i></button>");
	}

	newTagElement.find('.video_tags').change(function(){
		changeDataTrigger();
	});
	// VideoLibraryModule.renumberTags()
}
VideoLibraryModule.deleteVideo = function(link) {
	$(link).closest('.video-link').remove();
	changeDataTrigger();
	if ($("#video-links").children().length == 0) {
		$("#video-links").css('display', 'none')
	}
	VideoLibraryModule.renumberLinks()
}
VideoLibraryModule.renumberLinks = function() {
	$(".video-link").each(function(i, link) {
		$(link).attr('data-video-number', i);
	})
}

// helper funcs
VideoLibraryModule.htmlDecode = function(value) {
	return $("<textarea/>").html(value).text()
}
VideoLibraryModule.htmlEncode = function(value) {
	return $('<textarea/>').text(value).html()
}
VideoLibraryModule.downloadJSON = function(filename, data) {
    var blob = new Blob([data], {type: 'application/json'});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;        
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}