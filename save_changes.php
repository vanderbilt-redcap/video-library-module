<?php

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
if (isset($_POST['settings'])) {
	$new_settings = $_POST['settings'];
	$new_settings = json_decode($new_settings, true);
	sanitize($new_settings);
	_log("\$new_settings after sanitization: " . print_r($new_settings, true));
} else {
	$new_settings = [];
}

// fetch old settings
$old_settings = $module->framework->getProjectSetting($form_name);
if (!empty($old_settings))
	$old_settings = json_decode($old_settings, true);

_log("\$old_settings: " . print_r($old_settings, true));


// message we will send back: will append errors
$message = "Configuration settings have been saved.";

$module->framework->setProjectSetting($form_name, json_encode($new_settings));

echo json_encode([
	"success" => true,
	"message" => "$message",
	"new_settings" => json_encode($new_settings)
]);