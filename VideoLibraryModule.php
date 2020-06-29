<?php
namespace Vanderbilt\VideoLibraryModule;

use ExternalModules\AbstractExternalModule;
use ExternalModules\ExternalModules;

class VideoLibraryModule extends AbstractExternalModule
{
	function redcap_every_page_top($project_id) {
		if(strpos($_SERVER['REQUEST_URI'], 'online_designer.php') !== false && isset($_GET['page'])){
			//echo '<link rel="stylesheet" type="text/css" href="' .  $this->getUrl('css/videoLibrary.css') . '">';
			?>
				<style>
					#div_video_url span.select2 {
						width: 95% !important;
					}
				</style>
				<script type="text/javascript">
					<?php echo str_replace('LIBRARY_URL', $this->getVideoLibraryURL(), file_get_contents($this->getModulePath() . 'js/videoLibrary_setup.js')); ?>
				</script>
			<?php 
		}
	}

	function redcap_data_entry_form_top() {
		// $this->initVideoEmbeds();
	}

	function redcap_survey_page_top() {
		$this->initVideoEmbeds();
	}

	function initVideoEmbeds() {
		$this->initializeJavascriptModuleObject();
		?>
			<script src="https://www.youtube.com/iframe_api"></script>
			<script src="https://player.vimeo.com/api/player.js"></script>
			<script src="<?=$this->getUrl('js/video_embeds.js')?>"></script>
			<script>
				var hideEndVideosYouTube = <?php echo (is_numeric($this->getProjectSetting('hide_youtube')) ? $this->getProjectSetting('hide_youtube') : 0 ); ?>;
				var hideEndVideosVimeo = <?php echo (is_numeric($this->getProjectSetting('hide_vimeo')) ? $this->getProjectSetting('hide_vimeo') : 0 ); ?>;
			</script>
			<link rel="stylesheet" href="<?=$this->getUrl('css/video_embed.css')?>">
		<?php
	}

	function loadSharedClientLibraries(){
		?>
		<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" crossorigin="anonymous"/>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/i18n/en.min.js" crossorigin="anonymous"></script>
		<?php
	}

	function getVideoLibraryURL() {
		$client_or_server = $this->getProjectSetting('client_or_server');
		$video_library_setting = $this->getProjectSetting('video_library_url');
		$currentModuleLibraryURL = $this->getUrl('get-videos.php');
		$libraryURL = ($client_or_server == "1" && !empty($video_library_setting)) ? $video_library_setting : $currentModuleLibraryURL."&NOAUTH" ;
		return $libraryURL;
	}
}