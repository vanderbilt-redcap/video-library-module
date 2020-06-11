(function(){
	var library_url = 'LIBRARY_URL';
	var setup = 0;
	var settings = {};
	console.log(settings);
	var closeInterval;
	var currentTop = '';
	$(document).ready(function(){
		videoLibrarySelection();
		$('body').on('click','img',function(){
			if($(this).attr('title') == 'Edit' || $(this).attr('title') == 'Edit Matrix'){
				clearVideoSelection();
			}
		});
		$('body').on('click','input[type="button"]',function(){
			if($(this).attr('value') == "Add Field") {
				clearVideoSelection();
			}
		});

		// $('body').on('change','#field_type',function() {
		// 	if($('#field_type option:selected').val() == 'descriptive') {
		// 		//videoLibrarySettings();
		// 	} else {
				
		// 	}
		// });
	});

	function videoLibrarySelection() {
		var selectEle = '<select name="video_library_search" id="video_library_search"><option></option></select>';
		$('#div_video_url #video_url').parent().parent().prepend(selectEle);
		$('#video_library_search').select2({
			allowClear: true,
			placeholder: "Search for a video",
			ajax: {
				url: library_url,
				data: function (params) {
					var query = {
						search: params.term,
					}
				
					// Query parameters will be ?search=[term]&type=public
					return query;
				}
			}
		});
		$('#video_library_search').on("change", function (e) { 
			$('#video_url').val($('#video_library_search option:selected').val());
		});
	}

	function clearVideoSelection() {
		$('#video_library_search').val('');
		$('#video_library_search').trigger('change.select2');
	}
})();