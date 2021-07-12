<?php
$notes_path = '/media/stick/webdav/%u%/Notes';  // base path to notes, use %u% as placeholder for username
$media_folder = '.media/';                      // subfolder to mediafile
$delMedia = true;                               // automatically delete media, after note is deleted; true|false
$title = 'Notizen';                             // base title 
$logfile = '/var/log/notes';                    // path to logfile
$loglevel = 9;                                  // loglevel; 9=debug; 8=notice; 4=parse; 2=warn; 1=error
$cexpjson = false;                              // if set to true, this saves a json file for http requests
$lang = 'de_DE';                                // set the locale for dates and other values
$mailbox = '{imap.strato.de:993/imap/ssl}';     // IMAP connection string, see https://www.php.net/manual/en/function.imap-open.php for possible values; set to null or empty for not authentication or using .htaccess
$database = '/media/stick/db/notes.db';			// path to database, leave empty or set to null, if you dont need 'stay logged in' feature
?>