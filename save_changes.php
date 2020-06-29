<?php

// uncomment to log locally
// file_put_contents("C:/vumc/log.txt", __FILE__ . " log:\n");
function _log($str) {
	// file_put_contents("C:/xampp/htdocs/redcap/modules/vanderbilt_video_library_v1.0/log.txt", $str . "\n", FILE_APPEND);
}

function sanitize(&$array) {
	foreach ($array as $key => $val) {
		if (gettype($val) === 'string') {
			$array[$key] = filter_var($val, FILTER_SANITIZE_STRING);
		} elseif (gettype($val) === 'integer') {
			$array[$key] = intval($val);
		} elseif (gettype($val) === 'array') {
			sanitize($val);
		} 
	}
}

// sanitize new settings
if (isset($_POST['video_data'])) {
	$new_settings = $_POST['video_data'];
	$new_settings = json_decode($new_settings, true);
	sanitize($new_settings);
	_log("\$new_settings after sanitization: " . print_r($new_settings, true));
} else {
	$new_settings = [];
}

$video_data = array();
$video_url = array();
$video_title = array();
$video_description = array();
$video_tags = array();
foreach($new_settings['video_links'] AS $k => $video) {
	$video_data[] = true;
	$video_url[] = (!empty($video['url']) ? $video['url'] : NULL );
	$video_title[] = (!empty($video['title']) ? $video['title'] : NULL );
	$video_description[] = (!empty($video['description']) ? $video['description'] : NULL );
	$videoTagsArray = array();
	foreach($video['tags'] AS $vk => $tag) {
		if(!empty($tag)) {
			$videoTagsArray[] = $tag;
		}
	}
	$video_tags[] = (!empty($videoTagsArray) ? $videoTagsArray : array(NULL) );
}
(!empty($video_data) ? $module->framework->setProjectSetting('video_data', $video_data) : $module->framework->setProjectSetting('video_data', array(true)) );
(!empty($video_url) ? $module->framework->setProjectSetting('video_url', $video_url) : $module->framework->setProjectSetting('video_url', array(NULL)) );
(!empty($video_title) ? $module->framework->setProjectSetting('video_title', $video_title) : $module->framework->setProjectSetting('video_title', array(NULL)) );
(!empty($video_description) ? $module->framework->setProjectSetting('video_description', $video_description) : $module->framework->setProjectSetting('video_description', array(NULL)) );
(!empty($video_tags) ? $module->framework->setProjectSetting('video_tags', $video_tags) : $module->framework->setProjectSetting('video_tags', array(array(NULL))) );

// fetch old settings
/*$old_settings = $module->framework->getProjectSetting($form_name);
if (!empty($old_settings))
	$old_settings = json_decode($old_settings, true);

_log("\$old_settings: " . print_r($old_settings, true));*/


// message we will send back: will append errors
$message = "Configuration settings have been saved.";

//$module->framework->setProjectSetting($form_name, json_encode($new_settings));

echo json_encode([
	"success" => true,
	"message" => "$message",
	"new_settings" => json_encode($new_settings),
	"video_data" => json_encode($video_data),
	"video_url" => json_encode($video_url),
	"video_title" => json_encode($video_title),
	"video_description" => json_encode($video_description),
	"video_tags" => json_encode($video_tags)
]);