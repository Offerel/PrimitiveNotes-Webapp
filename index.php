<?php
/**
 * Notes
 *
 * @version 1.0.3
 * @author Offerel
 * @copyright Copyright (c) 2021, Offerel
 * @license GNU General Public License, version 3
 */
session_start();
include_once "config.inc.php.dist";
include_once "config.inc.php";

if(isset($_GET['bg'])) {
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
	die();
}

if((strlen($mailbox) > 0) && (!isset($_SESSION['iauth']))) {
	if(!imapLogin($mailbox)) {
		die();
	}
}

sCookie($title, $media_folder);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
setlocale (LC_ALL, $lang);
set_error_handler("e_log");

$notes_path = ($notes_path[-1] === '/') ? $notes_path:$notes_path.'/';
$notes_path = str_replace('%u%', $_SESSION['iauth'], $notes_path);

if(isset($_GET['nimg'])) {
	$file = urldecode($_GET['nimg']);
	$fname = $notes_path.$media_folder.$file;
	if(file_exists($fname)) {
		$fileh = file_get_contents($fname);
		$hash = sha1($fname);
		$mime_type = mime_content_type($fname);
		header("Content-type: $mime_type");
		header("Content-Disposition: inline; filename=\"$file\"");
		header("ETag: $hash");

		if(isset($_SERVER['HTTP_IF_NONE_MATCH'])) {
        	if($_SERVER['HTTP_IF_NONE_MATCH'] == $hash) {
        		header('HTTP/1.1 304 Not Modified');
        		exit();
        	}
        }
        
		header("Last-Modified: ".gmdate('D, d M Y H:i:s T', filemtime($fname)));
		header('Content-Length: '.strlen($fileh));
		echo $fileh;
	}
	die();
}

$tagArray = [];

if(isset($_POST['action'])) {
    $action = filter_var($_POST['action'], FILTER_SANITIZE_STRING);
    switch ($action) {
        case 'vNote':
            $nName = filter_var($_POST['note'], FILTER_SANITIZE_STRING);
            die(getNote($notes_path.$nName));
            break;
		case 'sNote':
			die(json_encode(saveNote(json_decode($_POST['note'], true), $notes_path)));
			break;
		case 'dNote':
			$file = $notes_path.filter_var($_POST['note'], FILTER_SANITIZE_STRING);
			die(json_encode(delNote($file)));
			break;
		case 'dlNote':
			e_log(8,"Download Note");
			$file = $notes_path.filter_var($_POST['note'], FILTER_SANITIZE_STRING);
			downloadNote($file);
			die();
			break;
		case 'dlMedia':
			e_log(8,"Download Media");
			$file = $notes_path.$media_folder.filter_var($_POST['media'], FILTER_SANITIZE_STRING);
			downloadMedia($file);
			die();
			break;
		case 'dMedia':
			$media = json_decode($_POST['media']);
			foreach($media as $key => $file) {
				unlink($notes_path.$media_folder.$file);
				e_log(8,"$file deleted");
			}
			die(json_encode(1));
			break;
		case 'gNlist':
			die(json_encode(createNotelist(getNotes($notes_path))));
			break;
		case 'uplImage':
			$imageURL = filter_var($_POST['imageURL'], FILTER_SANITIZE_STRING);
			$fname = time().image_type_to_extension(exif_imagetype($imageURL));
			$img = $notes_path.$media_folder.$fname;
			if (!is_dir($notes_path.$media_folder)) {
				if(!mkdir($notes_path.$media_folder, 0774, true)) die(e_log(2,'Check media folder "$notes_path$media_folder" failed. Please check directory.'));
			}
			if(!file_put_contents($img, file_get_contents($imageURL))) {
				die(e_log(2,"Can't write from URL image to media subfolder."));
			}
			die($media_folder.$fname);
			break;
		case 'logout':
			e_log(8,'Logout user...');
			clearAuthCookie();
			unset($_SESSION['iauth']);
			die();
			break;
        default:
            die(e_log(8,"Not an action..."));
            break;
    }
    die();
}

if(isset($_FILES['localFile']) && $_FILES['localFile']['error'] == 0 ) {
	if(!is_dir($notes_path.$media_folder)) {
		if(!mkdir($notes_path.$media_folder, 0774, true)) {
			die(e_log(2,'Check media folder "$notes_path$media_folder" failed. Please check directory.'));
		}
	}
	$fname = time().image_type_to_extension(exif_imagetype($_FILES['localFile']['tmp_name']));
	if(!move_uploaded_file($_FILES['localFile']['tmp_name'], $notes_path.$media_folder.$fname)) {
		die(e_log(2,"Can't write from local image to media subfolder."));
	}
	die($media_folder.$fname);
}

if(isset($_FILES['dropFile']) && $_FILES['dropFile']['error'] == 0 ) {
	if(mime_content_type($_FILES['dropFile']['tmp_name']) == 'text/plain' && substr_compare($_FILES['dropFile']['name'], '.md', -3) === 0) {
	    if(!move_uploaded_file($_FILES['dropFile']['tmp_name'], $notes_path.$_FILES['dropFile']['name'])) {
			e_log(2, 'Can\'t move uploaded note.');
	        die(json_encode(1));
	    } else {
			e_log(8,'File dropped to '.$notes_path.$_FILES['dropFile']['name']);
	        die(json_encode(0));
	    }
	} else {
		e_log(2,'Dropupload not a note file');
	    die(json_encode(2));
	}
}

function e_log($level, $message, $errfile="", $errline="") {
	global $logfile,$loglevel;
	switch($level) {
		case 9:
			$mode = "debug ";
			break;
		case 8:
			$mode = "notice";
			break;
		case 4:
			$mode = "parse ";
			break;
		case 2:
			$mode = "warn  ";
			break;
		case 1:
			$mode = "error ";
			break;
		default:
			$mode = "unknown";
			break;
	}
	if($errfile != "") $message = $message." in ".$errfile." on line ".$errline;
	$user = (isset($_SESSION['iauth'])) ? $_SESSION['iauth']:'';
	$line = "[".date("d-M-Y H:i:s")."] [$mode] $user - $message\n";

	if($level <= $loglevel) {
		$lfile = is_dir($logfile) ? $logfile.'/notes.log':$logfile;
		file_put_contents($lfile, $line, FILE_APPEND);
	}
}

function delNote($file) {
	global $delMedia, $media_folder;
	if(file_exists($file)) {
		if(substr ($file, -3) == ".md" && $delMedia) {
			$fcontent = file_get_contents($file);
			preg_match_all('/(?:!\[(.*?)\]\((.*?)\))/m', $fcontent, $mediaFiles, PREG_SET_ORDER, 0);
			$mfiles = [];
			foreach($mediaFiles as $mKey => $mFile) {
				if(strpos($mFile[2], $media_folder) !== false) $mfiles[] = basename($mFile[2]);
			}
		}
		
		if(!unlink($file)) {
			$message = "Couldn't delete note '$file'. Please check permissions.";
			e_log(2,$message);
			$mArr = array('erg' => 0, 'message' => $message, 'data' => $mfiles);
		} else {
			if($mfiles) {
				$message = 'Note deleted. Found '.count($mfiles).' media files in note. Do you want to delete them?';
				e_log(8,$message);
				$mArr = array('erg' => 1, 'message' => $message, 'data' => $mfiles);
			} else {
				$message = 'Note deleted.';
				e_log(8,$message);
				$mArr = array('erg' => 1, 'message' => $message, 'data' => 0);
			}
		}
	} else {
		$message = 'Note not found';
		e_log(8,$message);
		$mArr = array('erg' => 0, 'message' => $message, 'data' => null);
	}

	return $mArr;
}

function downloadNote($file){
	e_log(8,$file);
	$fc = file_get_contents($file);
	$hash = sha1($file);
	$mime = mime_content_type($file);
	header("Content-Description: File Transfer");
	header('Content-Disposition: attachment; filename='.basename($file));
	header('Content-type: '.$mime);
	header('Content-Transfer-Encoding: binary');
	header('Content-Length: '.strlen($fc));
	readfile($file);
}

function downloadMedia($file){
	if(file_exists($file)) {
		$mime = mime_content_type($file);
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
		header("Expires: 0");
		header('Content-Disposition: attachment; filename='.basename($file));
		header('Content-Length: '.filesize($file));
		header('Content-type: '.$mime);
		header('Pragma: public');
		header('Content-Transfer-Encoding: binary');
		readfile($file);
		exit;
	}
	e_log(2,"File $file don't exist");
	die();
}

function getHeader() {
	global $title;
    $header = "<!DOCTYPE html>
	<html>
		<head>
			<title>$title</title>
			<meta charset='utf-8'>
			<meta name='viewport' content='width=device-width, initial-scale=1'>

			<link rel='icon' type='image/png'  href='images/notes.png'>
			
			<link rel='stylesheet' href='js/highlight/styles/vs.min.css'>
			<script src='js/highlight/highlight.pack.js'></script>

			<link href='js/easymde/easymde.min.css' rel='stylesheet'>
			<script src='js/easymde/easymde.min.js'></script>
			
			<link href='js/tagify/tagify.min.css' rel='stylesheet' type='text/css' />
			<script src='js/tagify/tagify.min.js' type='text/javascript' charset='utf-8'></script>
			
			<script src='js/turndown/turndown.js'></script>
			
			<script src='js/notes.min.js' type='text/javascript' charset='utf-8'></script>
			<link href='css/notes.min.css' rel='stylesheet' />
			<link href='css/easymde.min.css' rel='stylesheet' />
		</head>
		<body>";
	
	return $header;
}

function getFooter() {
	$cMenu = "<div id='dcMenu'></div>";
	$footer = $cMenu."	</body>
	</html>";
	return $footer;
}

function createNotelist($notes) {
	$nlist = '';
	foreach ($notes[1] as $key => $note) {
        $nlist.="<li data-tags='".$note['tags']."' data-na='".$note['fname']."' title='".$note['name']."'>
    		<div class='mpart'>
    			<div class='nname'>".$note['name']."</div>
    			<div class='ntime'>".date("d.m.Y H:i",$note['time'])."</div>
    		</div>
    		<div class='nsize'>".human_filesize($note['size'],2)."</div>
        </li>";
    }
	return $nlist;
}

function prepareLayout($notes_path) {
	$layout = "<div id='parent'>
	<div id='left'>
		<div id='search'>
			<input id='nsearch' type='text' placeholder='Search&#8230;'>
		</div>
	<ul id='nlist'>";
	$notes = getNotes($notes_path);
	$nlist = createNotelist($notes);
	$layout2 = "</ul></div>
	<div id='main'>
		<div id='noteheader'>
			<input id='ntitle' class='' />
			<input id='ntags' class='tedit' />
			<input id='allTags' type='hidden' value='".implode(",", $notes[0])."'><input id='fname' type='hidden'>
			<fieldset id='ndata' class='mtoggle'>
				<div><label for='author'>Author</label><input id='author' name='author' type='text' readonly='true'></div>
				<div><label for='date'>Created</label><input id='date' name='date' type='text' readonly='true'></div>
				<div><label for='updated'>Updated</label><input id='updated' name='updated' type='text' readonly='true'></div>
				<div><label for='source'>Source</label><input id='source' name='source' type='text' readonly='true'></div>
			</fieldset>
			<input type='file' id='localFile' name='localFile' accept='image/png, image/jpeg'>
		</div>
		<div id='notebody'>
			<textarea id='notesarea'></textarea>
		</div>
	</div></div>";
	return $layout.$nlist.$layout2;
}

function human_filesize($size, $precision = 2) {
    static $units = array('B','kB','MB','GB','TB','PB','EB','ZB','YB');
    $step = 1024;
    $i = 0;
    while (($size / $step) > 0.9) {
        $size = $size / $step;
        $i++;
    }
    return round($size, $precision).$units[$i];
}

function saveNote($note, $path) {
	$notecontent = "---\r\n";
	$notecontent.= ($note['tags']) ? "tags: ".implode(" ", $note['tags'])."\r\n":"";
	$notecontent.= ($note['nname']) ? "title: ".trim($note['nname'])."\r\n":"";
	$notecontent.= ($note['date']) ? "date: ".trim($note['date'])."\r\n":'date: '.strftime('%x %X')."\r\n";
	$notecontent.= 'updated: '.strftime('%x %X')."\r\n";
	$notecontent.= ($note['author']) ? 'author: '.trim($note['author'])."\r\n":'';
	$notecontent.= ($note['source']) ? 'source: '.trim($note['source'])."\r\n":'';
	$notecontent.= "---\r\n";
	$notecontent.= trim($note['content']);
	$fname = $path.$note['oname'].'.'.$note['type'];
	$erg = file_put_contents($fname, $notecontent);
	$erg = ($note['oname'] != $note['nname']) ? rename($path.$note['oname'].'.'.$note['type'], $path.$note['nname'].'.'.$note['type']):$erg;
	e_log(8,"Note saved to '$fname'");
	return $erg;
}

function getNotes($notes_path) {
	e_log(8,"Get list of notes from '$notes_path'");

	global $tagArray, $extensions;
	$notes = array();
	$id = 0;
	$extArr = array_map('trim', explode(',', $extensions));
	
	if(is_dir($notes_path)) {
		if($ndir = opendir($notes_path)) {
			while(false !== ($file = readdir($ndir))) {
				$fpath = $notes_path.$file;
				
				if ($file != "." && $file != ".." && substr($file, 0, 1) != '.' && in_array(pathinfo($fpath, PATHINFO_EXTENSION), $extArr, true)) {
					if(is_file($fpath)) {
						$bname = pathinfo($fpath,PATHINFO_BASENAME);
						$nstr = (pathinfo($fpath,PATHINFO_EXTENSION) === 'md') ? getNotTags($fpath):'';
						$notes[] = array(
							'fname' => $bname,
							'name'  => (strpos($bname, "[")) ? explode("[", $bname)[0]:substr($bname, 0, strrpos($bname, '.')),
							'size'  => filesize($fpath),
							'type'  => pathinfo($fpath,PATHINFO_EXTENSION),
							'time'  => filemtime($fpath),
							'tags'  => $nstr,
							'id'    => $id,
						);
						$tagArray = array_merge($tagArray, explode(' ', $nstr));
					}
					$id++;
				}
			}
			closedir($ndir);
		}
	}

	if(is_array($notes) && count($notes) > 0) {
		usort($notes, function($a, $b) { return $b['time'] > $a['time']; });
	}

	$tagArray = array_unique($tagArray);
	sort($tagArray,SORT_NATURAL|SORT_FLAG_CASE);
	$tagArray = array_filter($tagArray);
	return array($tagArray,$notes);
}

function getNotTags($fpath) {
	$contents = file_get_contents($fpath);
	$yend = strpos($contents, '---', 3);
	$yarr = preg_split("/\r\n|\n|\r/", substr($contents,0,$yend));
	$tstr = '';
	foreach($yarr as $line) {
		if(strpos($line,"tags:") === 0) {
			$tstr = substr($line,6);								
		}
	}
	return $tstr;
}

function getNote($notePath) {
	e_log(8,"Load '$notePath'");
    $note = file_get_contents($notePath);
    return $note;
}

function loginForm() {
	global $title, $database;

	$stay = (strlen($database) > 3) ? "<label for='remember'><input type='checkbox' id='remember' name='remember'>Stay logged in</label>":"";

	$vArr = explode("\n", file_get_contents(__FILE__, false, null, 0, 160));
	foreach ($vArr as $line) {
		$pos = strpos($line, "version");
		if($pos > 0) {
			$version = substr($line,12);
			break;
		}
	}
	
	$form = "<form id='lform' method='POST' class='lform'>
	<div id='lheader'>$title</div>
	<div id='lbody'>
		<input type='text' id='user' name='user' placeholder='Username' />
		<input type='password' id='password' name='password' placeholder='Password' />
		$stay
	</div>
	<div id='lfooter'>
		<button id='login' name='login' value='login'>Login</button>
	</div>
	</form>
	<div id='lpfooter'><a href='https://github.com/Offerel/PrimitiveNotes-Webapp'>PrimitiveNotes v$version</a></div>";
	return $form;
}

function unique_code($limit) {
	return substr(base_convert(sha1(uniqid(mt_rand())), 16, 36), 0, $limit);
}

function db_query($query) {
	global $database;
	e_log(9,$query);

	$options = [
		PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
		PDO::ATTR_CASE => PDO::CASE_NATURAL,
		PDO::ATTR_ORACLE_NULLS => PDO::NULL_EMPTY_STRING
	];

	try {
		$db = new PDO('sqlite:'.$database, null, null, $options);
	} catch (PDOException $e) {
		e_log(1,'DB connection failed: '.$e->getMessage());
		return false;
	}

	if(strpos($query, 'SELECT') === 0 || strpos($query, 'PRAGMA') === 0) {
		try {
			$statement = $db->prepare($query);
			$statement->execute();
		} catch(PDOException $e) {
			e_log(1,"DB query failed: ".$e->getMessage());
			return false;
		}
		$queryData = $statement->fetchAll(PDO::FETCH_ASSOC);
	} else {
		try {
			$queryData = $db->exec($query);
			if(strpos($query, 'INSERT') === 0) $queryData = $db->lastInsertId();
		} catch(PDOException $e) {
			e_log(1,"DB update failed: ".$e->getMessage());
			return false;
		}
	}

	$db = NULL;
	return $queryData;
}

function clearAuthCookie() {
	e_log(8,'Reset Cookie');
	if(isset($_COOKIE['rmpnotes'])) {
		$cookieArr = json_decode(cryptCookie($_COOKIE['rmpnotes'], 2), true);
		$query = "DELETE FROM `auth_token` WHERE `user` = '".$cookieArr['mail']."' AND `client` = '".$cookieArr['token']."'";
		db_query($query);
		
		$cOptions = array (
			'expires' => 0,
			'path' => null,
			'domain' => null,
			'secure' => true,
			'httponly' => true,
			'samesite' => 'Strict'
		);
		
		setcookie("rmpnotes", "", $cOptions);
	}
}

function imapLogin($mailbox) {
	global $title, $realm;

	$success = false;
	if(!isset($_SESSION['iauth']) && isset($_COOKIE['rmpnotes']))	{
		e_log(8,"Cookie found. Try to login...");
		$cookieArr = json_decode(cryptCookie($_COOKIE['rmpnotes'], 2), true);
		$query = "SELECT * FROM `auth_token` WHERE `user` = '".$cookieArr['mail']."' ORDER BY `exDate` DESC;";
		$tkdata = db_query($query);

		foreach($tkdata as $key => $token) {
			if(password_verify($cookieArr['key'], $token['tHash'])) {
				$_SESSION['iauth'] = $cookieArr['mail'];
				$success = true;
				$expireTime = time() + (86400 * 7);
				$cOptions = array (
					'expires' => $expireTime,
					'path' => null,
					'domain' => null,
					'secure' => true,
					'httponly' => true,
					'samesite' => 'Strict'
				);
				$rtoken = unique_code(32);
				$dtoken = $cookieArr['key'];
				$cookieData = cryptCookie(json_encode(array('key' => $rtoken, 'mail' => $cookieArr['mail'], 'token' => $dtoken)), 1);
				setcookie('rmpnotes', $cookieData, $cOptions);
				$rtoken = password_hash($rtoken, PASSWORD_DEFAULT);
				$query = "UPDATE `auth_token` SET `tHash` = '$rtoken', `exDate` = '$expireTime' WHERE `token` = ".$token['token'].";";
				$erg = db_query($query);
				return $success;
				break;
			}
		}

		
	}

	if(!isset($_SESSION['iauth']) && !isset($_POST['login'])) {
		e_log(8,"Not authorized, show login...");
		echo getHeader();
		echo loginForm();
		echo getFooter();
	} else {
		$username = isset($_POST['user']) ? filter_var($_POST['user'], FILTER_SANITIZE_STRING):$_SERVER['PHP_AUTH_USER'];
		$password = isset($_POST['password']) ? filter_var($_POST['password'], FILTER_SANITIZE_STRING):$_SERVER['PHP_AUTH_PW'];

		if(isset($_POST['remember']) && filter_var($_POST['remember'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE)) {
			e_log(8, "cookie set");
			$expireTime = time() + (86400 * 7);
			$cOptions = array (
				'expires' => $expireTime,
				'path' => null,
				'domain' => null,
				'secure' => true,
				'httponly' => true,
				'samesite' => 'Strict'
			);

			$rtoken = unique_code(32);
			$dtoken = bin2hex(openssl_random_pseudo_bytes(16));

			$cookieData = cryptCookie(json_encode(array('key' => $rtoken, 'mail' => $username, 'token' => $dtoken)), 1);
			setcookie('rmpnotes', $cookieData, $cOptions);
			$rtoken = password_hash($rtoken, PASSWORD_DEFAULT);

			$query = "INSERT INTO `auth_token` (`user`,`client`, `tHash`,`exDate`) VALUES ('$username', '$dtoken', '$rtoken', '$expireTime');";
			$erg = db_query($query);
		}
		
		e_log(8,"$username not authorized, try to login...");
		
		try {
			e_log(8,"Using IMAP '$mailbox'");
			$imap = imap_open($mailbox, $username, $password, OP_HALFOPEN | OP_READONLY, 1);
			if ($imap) {
				e_log(8,"IMAP Login successfull");
				$_SESSION['iauth'] = $username;
				$success = true;
			}
		} catch (\ErrorException $e) {
			e_log(1,$e->getMessage());
			unset($_SERVER['PHP_AUTH_USER']);
			unset($_SERVER['iauth']);
		}
	}

	$errors = imap_errors();
	if ($errors) {
		foreach ($errors as $error) {
			e_log(1, $error);
		}
	}

	if(isset($imap) && $imap) imap_close($imap);

	return $success;
}

function sCookie($title, $media_folder) {
	$ocookie = (isset($_COOKIE["primitivenotes"])) ? $_COOKIE["primitivenotes"]:'';
	$acookie = json_decode($ocookie, true);
	$barw = (isset($acookie['barw'])) ? $acookie['barw']:null;
	
	$cOptions = array (
		'expires' => time() + (86400 * 30),
		'path' => null,
		'domain' => null,
		'secure' => true,
		'httponly' => false,
		'samesite' => 'Strict'
	);
	
	$cArr = array(
		'title' => $title,
		'mf'    => $media_folder,
		'barw'	=> $barw,
	);
	setcookie("primitivenotes", json_encode($cArr), $cOptions);
}

function cryptCookie($data, $crypt) {
	global $enckey, $enchash;
	$method = 'aes-256-cbc';
	$iv = substr(hash('sha256', $enchash), 0, 16);
	$opts   = defined('OPENSSL_RAW_DATA') ? OPENSSL_RAW_DATA : true;
	$key = hash('sha256', $enckey);
	$str = ($crypt == 1) ? base64_encode(openssl_encrypt($data, $method, $key, $opts, $iv)):openssl_decrypt(base64_decode($data), $method, $key, $opts, $iv);
	return $str;
}

echo getHeader();
echo prepareLayout($notes_path);
echo getFooter();
?>