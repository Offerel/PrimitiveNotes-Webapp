<?php
/**
 * Notes
 *
 * @version 1.0.0
 * @author Offerel
 * @copyright Copyright (c) 2021, Offerel
 * @license GNU General Public License, version 3
 */
$files = array();
$backgroundsDir = dirname(__FILE__).'/images/';
if($handle = @opendir($backgroundsDir)) {
	while($file = readdir($handle)) {
		if($file != '.' AND $file != '..' AND mime_content_type($backgroundsDir.$file) == 'image/jpeg') {
			$files[] = $file;
		}
	}
}

$bg_file = $backgroundsDir.$files[array_rand($files)];

if (file_exists($bg_file)) {
	$cacheContent = file_get_contents($bg_file);
	$hash = sha1($bg_file);
	header('Content-Disposition: inline;filename='.basename($bg_file));
	header('Content-type: image/jpeg');
	header("ETag: $hash");
	header("Last-Modified: ".gmdate('D, d M Y H:i:s T', filemtime($bg_file)));
	header('Content-Length: '.strlen($cacheContent));
	
	if(isset($_SERVER['HTTP_IF_NONE_MATCH'])) {
		if($_SERVER['HTTP_IF_NONE_MATCH'] == $hash) {
			header('HTTP/1.1 304 Not Modified');
			exit();
        }
	}
	
	echo $cacheContent;
	exit;
}
?>