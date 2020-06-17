<?php
$videoSettings = $module->getSubSettings('video_data');
$videoSettingsReady = array('pagination' => array('more' => false));

$searchTerm = isset($_GET['search']) ? strtolower($_GET['search']) : '' ;

if(empty($searchTerm)) {
	foreach($videoSettings AS $k => $v) {
		if(!empty($v['video_url'])) {
			$videoTitle = (!empty($v['video_title']) ? $v['video_title'] : $v['video_url'] );
			$video = array(
				'id' => $v['video_url'],
				'title' => $videoTitle,
				'text' => $videoTitle
			);
			$videoSettingsReady['results'][] = array_merge($video, $v);
		}
	}
} else {
	foreach($videoSettings AS $k => $v) {
		if(!empty($v['video_url'])) {
			$videoTitle = (!empty($v['video_title']) ? $v['video_title'] : $v['video_url'] );
			$video = array(
				'id' => $v['video_url'],
				'title' => $videoTitle,
				'text' => $videoTitle
			);
			$videoReturn = array_merge($video, $v);

			if(strpos(strtolower($videoReturn['title']), $searchTerm) !== false) {
				$videoSettingsReady['results'][] = $videoReturn;
			} else if(strpos(strtolower($videoReturn['video_description']), $searchTerm) !== false) {
				$videoSettingsReady['results'][] = $videoReturn;
			} else {
				foreach($videoReturn['video_tags'] AS $tag_k => $tag_v) {
					if(strpos(strtolower($tag_v), $searchTerm) !== false) {
						$videoSettingsReady['results'][] = $videoReturn;
						break;
					}
				}
			}
		}
	}
}

if(isset($_GET['test'])) {
	highlight_string("<?php\n\$videoSettingsReady =\n" . var_export($videoSettingsReady, true) . ";\n?>");
} else {
	header('Content-Type: application/json');
	echo json_encode($videoSettingsReady);
}

?>