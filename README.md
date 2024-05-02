# PrimitiveNotes (Standalone)
This is a standalone version of PrimitiveNotes for Roundcube for using the notes without the need of Roundcube Webmail. As such, this lacks some of the mail dependent functions from the plugin version. For example, sharing via mail is not possible. On the other hand, the standalone variant is a little bit faster, since its without the bloat of the Webmail client.  

# Installation
- Extract the downloaded archive into your webserver directoy, for example `/var/www/notes`
- Configure your webserver, so that the directory can be served via your PHP extension
- Copy config.inc.php.dist to `config.inc.php`
- Change `$notes_path` to the path, where the note files are stored. You can use **%u** as a placeholder for the username. The path must be writeable by the webserver user
- Configure $mailbox, so that it points to a IMAP server of your choice (if you want to use IMAP for authentication)
- If you want to use the "Remember me" function, please set up the path your SQLite database in $database

# Issues
Since the main repository is on Codeberg.org, please use the [issue tracker at Codeberg.org](https://codeberg.org/Offerel/PrimitiveNotes-Webapp/issues). Github.com is only a mirror for compatibility reason.