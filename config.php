<?php

if (!empty($_POST)) {
	$data = json_decode($_POST['data'], true);
	$data['action'] = filter_var($data['action'], FILTER_SANITIZE_STRING, FILTER_NULL_ON_FAILURE);
}

require_once str_replace("temp" . DIRECTORY_SEPARATOR, "", APP_PATH_TEMP) . "redcap_connect.php";
require_once APP_PATH_DOCROOT . 'ProjectGeneral' . DIRECTORY_SEPARATOR. 'header.php';

$project = new \Project($module->framework->getProjectId());
?>
	<div>
		<div id='form_assocs'>
		<h5 class="mt-3">Alternate Video Library URL</h5>
		<input type="text" style="width: 400px" class="form-control" id="video_library_url" aria-describedby="video_library_url"></input>

		<h5 class='mt-3'>Footer Links</h5>
		<button type='button' class='btn btn-outline-secondary small-text new-footer-link'><i class="fas fa-plus"></i> New Footer Link</button>
		<div id='footer-links' class='mt-3'>
		</div>
		
		<br>
		<button id='save_changes' class='btn btn-outline-primary mt-3' type='button'>Save Changes</button>
		<div id='json-buttons' class='d-flex my-3'>
			<button class='btn btn-outline-secondary' onclick='VideoLibraryModule.downloadJSON("patient_access_module_settings_" + new Date().getTime(), JSON.stringify(VideoLibraryModule.settings))'>Settings Export</button>
			<div class='json-upload custom-file ml-3'>
				<input type='file' class='custom-file-input' id='json-import' aria-describedby='upload'>
				<label class='custom-file-label text-truncate' for='json-import'>Settings Import</label>
			</div>
		</div>
		<link rel="stylesheet" href="<?=$module->getUrl('css/config.css')?>"/>
		<?php
			$clientOrServer = $module->framework->getProjectSetting('client_or_server');
			$videoLibraryURL = $module->framework->getProjectSetting('video_library_url');
			$videos = $module->framework->getProjectSetting('video_data');
			$settings = $module->framework->getProjectSettings();
			$videoSettings = $module->framework->getSubSettings('video_data');
			highlight_string("<?php\n\$videoSettings =\n" . var_export($videoSettings, true) . ";\n?>");
			if (!empty($clientOrServer)){
				/*$clientOrServer = json_decode($clientOrServer, true);
				$videoLibraryURL = json_decode($videoLibraryURL, true);
				$videos = json_decode($videos, true);*/
				// file_put_contents("C:/vumc/log.txt", print_r($settings, true));
			}
		?>
		</div>
	</div>
	<script>
		VideoLibraryModule = {
			configAjaxUrl: <?=json_encode($module->getUrl("config.php"))?>,
			saveConfigUrl: <?=json_encode($module->getUrl("save_changes.php"))?>,
			importSettingsUrl: <?=json_encode($module->getUrl("import.php"))?>,
		}
	</script>
	<script type="text/javascript" src="<?=$module->getUrl("js/config.js")?>"></script>
	<script type='text/javascript'>
		VideoLibraryModule.clientOrServer = <?=json_encode($clientOrServer)?>;
		VideoLibraryModule.videoLibraryURL = <?=json_encode($videoLibraryURL)?>;
		VideoLibraryModule.videoSettings = <?=json_encode($videoSettings)?>;
		if (VideoLibraryModule.videoLibraryURL) {
			$("#video_library_url").val(VideoLibraryModule.htmlDecode(VideoLibraryModule.videoLibraryURL))
		}
		
		for (var i in VideoLibraryModule.videoSettings) {
			var video = VideoLibraryModule.videoSettings[i]
			console.log(video);
			VideoLibraryModule.newVideo()
			var videoElement = $("#footer-links").find('.footer-link:last')
			
			// link label and url
			$(videoElement).find('.link-label').val(video.video_title)
			$(videoElement).find('.link-url').val(video.video_url)
		}
	</script>
<?php
require_once APP_PATH_DOCROOT . 'ProjectGeneral/footer.php';
