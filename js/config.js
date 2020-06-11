// FOOTER LINKS
// add link
$("body").on('click', 'button.new-footer-link', function(i, e) {
	VideoLibraryModule.newVideo(this)
})

// delete link
$("body").on('click', 'button.delete-footer-link', function(i, e) {
	VideoLibraryModule.deleteVideo(this)
})

// SAVE CHANGES
$("body").on('click', '#save_changes', function(i, e) {
	// SETTINGS holds everything except icon files that were attached by user
	// FORM_DATA holds all icon image files that were attached by user
	// form_data.settings will hold the encoded json string containing settings values
	
	//
	var files_attached = 0
	//
	
	var form_data = new FormData()
	
	var settings = {}
	settings.form_name = VideoLibraryModule.formName
	if ($("#dashboard_title").val())
		settings.dashboard_title = $("#dashboard_title").val()
	
	// logo/image for dashboard
	var logoInput = $('.logo-upload .custom-file-input')
	if (logoInput.prop('files') && logoInput.prop('files')[0]) {
		form_data.append('dashboard-logo', logoInput.prop('files')[0])
	} else {
		if ($('.logo-preview').attr('data-edoc-id')) {
			settings['dashboard-logo'] = VideoLibraryModule.settings['dashboard-logo']
		}
	}
	
	// add icons and links
	settings.icons = []
	$("#icons .icon-form").each(function(j, iconForm) {
		settings.icons.push({})
		var icon = settings.icons[settings.icons.length-1]
		
		// attach new icon file to form_data OR put edoc_id in settings
		var input = $(iconForm).find('.custom-file-input')
		var file_attached = false
		if (input && input.prop('files') && input.prop('files')[0]) {
			file_attached = true
			form_data.append('icon-' + (settings.icons.length-1), input.prop('files')[0])
		} else if ($(iconForm).attr('data-icon-edoc-id')) {
			icon.edoc_id = $(iconForm).attr('data-icon-edoc-id')
		}
		
		// add icon label
		if ($(iconForm).find('.icon-label').val())
			icon.label = $(iconForm).find('.icon-label').val()
		
		// add links
		icon.links = []
		$(iconForm).find('.link-form').each(function(k, linkForm) {
			icon.links.push({})
			var link = icon.links[icon.links.length-1]
			
			// label
			if ($(linkForm).find('.link-label').val())
				link.label = $(linkForm).find('.link-label').val()
			// url
			if ($(linkForm).find('.link-url').val())
				link.url = $(linkForm).find('.link-url').val()
			
			if ($.isEmptyObject(link))
				icon.links.pop()
		})
		if (icon.links.length == 0) 
			delete icon.links
		
		if (!file_attached && !icon.label && !icon.edoc_id && $.isEmptyObject(icon))
			settings.icons.pop()		// effectively ignore this icon
	})
	if (settings.icons.length == 0)
		delete settings.icons
	
	// add footer link data to settings
	$(".footer-link").each(function(i, link) {
		var label = $(link).find('.link-label').val()
		var url = $(link).find('.link-url').val()
		if (url || label) {
			if (!settings.footer_links)
				settings.footer_links = []
			settings.footer_links.push({})
			if (url)
				settings.footer_links[settings.footer_links.length-1].url = url
			if (label)
				settings.footer_links[settings.footer_links.length-1].label = label
		}
	})
	
	form_data.append('settings', JSON.stringify(settings))
	
	$.ajax({
		url: VideoLibraryModule.saveConfigUrl,
		dataType: 'json',
		cache: false,
		contentType: false,
		processData: false,
		data: form_data,
		type: 'POST',
		success: function(response){
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
VideoLibraryModule.newVideo = function() {
	$("#footer-links").css('display', 'flex')
	$('#footer-links').append("\
					<div class='footer-link mt-2'>\
						<div class='ml-2 row'>\
							<span class='mt-1'></span>\
							<button type='button' class='btn btn-outline-secondary smaller-text delete-footer-link ml-3'><i class='fas fa-trash-alt'></i></i> Delete Link</button>\
						</div>\
						<label class='ml-2'>Label</label>\
						<input class='link-label ml-2' type='text'/>\
						<label class='ml-2'>URL</label>\
						<input class='link-url ml-2' type='text'/>\
					</div>")
	VideoLibraryModule.renumberLinks()
}
VideoLibraryModule.deleteVideo = function(link) {
	$(link).closest('.footer-link').remove()
	if ($("#footer-links").children().length == 0) {
		$("#footer-links").css('display', 'none')
	}
	VideoLibraryModule.renumberLinks()
}
VideoLibraryModule.renumberLinks = function() {
	$(".icon-form").each(function(i, iconForm) {
		$(iconForm).find(".link-form").each(function(j, linkForm) {
			$(linkForm).find('span').html("Link " + (j+1))
			$(linkForm).find('label:first').attr('for', "link-label-" + i + "-" + j)
			$(linkForm).find('input:first').attr('id', "link-label-" + i + "-" + j)
			$(linkForm).find('label:last').attr('for', "link-url-" + i + "-" + j)
			$(linkForm).find('input:last').attr('id', "link-url-" + i + "-" + j)
		})
	})
	$(".footer-link").each(function(i, link) {
		$(link).find('span').html("Link " + (i+1))
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