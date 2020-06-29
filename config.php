<?php

/*
Video Data Module Settings setup:
{
	"key": "video_data",
	"name": "Video",
	"repeatable": true,
	"branchingLogic": {
		"field": "client_or_server",
		"value": "2"
	},
	"type": "sub_settings",
	"sub_settings": [
		{
			"key": "video_url",
			"name": "YouTube / Vimeo video URL",
			"type": "text"
		},
		{
			"key": "video_title",
			"name": "Title",
			"type": "text"
		},
		{
			"key": "video_description",
			"name": "Description",
			"type": "textarea"
		},
		{
			"key": "video_tags",
			"name": "Tag(s)",
			"type": "text",
			"repeatable": true
		}
	]
}
*/

if (!empty($_POST)) {
	$data = json_decode($_POST['data'], true);
	$data['action'] = filter_var($data['action'], FILTER_SANITIZE_STRING, FILTER_NULL_ON_FAILURE);
}

require_once str_replace("temp" . DIRECTORY_SEPARATOR, "", APP_PATH_TEMP) . "redcap_connect.php";
require_once APP_PATH_DOCROOT . 'ProjectGeneral' . DIRECTORY_SEPARATOR. 'header.php';

$project = new \Project($module->framework->getProjectId());

$projModSettings = $module->framework->getProjectSettings();

$client_or_server = $module->framework->getProjectSetting('client_or_server');
?>
	<div>
		<div id='form_assocs'>
		<h5 class="mt-3">Video Library URL</h5>
		<p>To share this video library with other REDCap users or across projects, use the following link: <br><em><?php echo $module->framework->getUrl('get-videos.php', true, true); ?></em></p>
		<p>&nbsp;</p>
		<h5 class='mt-3'>Videos</h5>
		<p>Include videos from either YouTube or Vimeo below to add to this video library. Tags and video descriptions are searchable in descriptive text fields within the online designer. Please note that you should obtain permission for videos included as a part of your project.</p>
		<?php if($client_or_server == 1): ?>
			<p>This module is currently setup to use an alternate URL source for managing the Video Library. To manage the library here please go to External Modules on the left hand navigation, click "Configure" next to the Video Library Module and turn off "Alternate Video Library URL."</p>
		<?php endif; ?>
		<div style="<?php echo ($client_or_server == 1 ? 'display: none;' : '' ); ?>">
			<table id='video-links' class='mt-3'>
				<thead>
					<tr>
						<th>URL</th>
						<th>Title</th>
						<th>Description</th>
						<th>Tags</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
				
				</tbody>
			</table>
			<button type='button' class='btn btn-outline-secondary small-text new-video-link main-add-button'><i class="fas fa-plus"></i> New Video</button>
			
			<br>
			<button id='save_changes' class='btn btn-outline-primary mt-3' type='button'>Save Changes</button>
		</div>
		<link rel="stylesheet" href="<?=$module->getUrl('css/config.css')?>"/>
		<?php
			$clientOrServer = $module->framework->getProjectSetting('client_or_server');
			$videoLibraryURL = $module->framework->getProjectSetting('video_library_url');
			$videos = $module->framework->getProjectSetting('video_data');
			$settings = $module->framework->getProjectSettings();
			$videoSettings = $module->framework->getSubSettings('video_data');
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
		if(VideoLibraryModule.videoSettings.length <=0) {
			VideoLibraryModule.newVideo();
		} else {
			for (var i in VideoLibraryModule.videoSettings) {
				var video = VideoLibraryModule.videoSettings[i];
				VideoLibraryModule.newVideo();
				var videoElement = $("#video-links").find('.video-link:last');
				
				// link label and url
				$(videoElement).find('.video_url').val(video.video_url);
				$(videoElement).find('.video_title').val(video.video_title);
				$(videoElement).find('.video_description').val(video.video_description);

				for (var ix in video.video_tags) {
					if($(videoElement).find('.video_tags').last().val() != '') {
						VideoLibraryModule.newVideoTag($(videoElement).find('.video_tags').last().siblings('.new-video-tag'));
					}
					$(videoElement).find('.video_tags').last().val(video.video_tags[ix]);
				}
			}
		}
	</script>
<?php
require_once APP_PATH_DOCROOT . 'ProjectGeneral/footer.php';
