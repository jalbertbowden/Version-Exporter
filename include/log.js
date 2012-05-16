/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 212 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-16 16:48:36 +0200 (Mi, 16 Mai 2012) $:
 */


//=============================================================================
// Logging
//=============================================================================

var Log = {

	// initial
	_enabled: false,

	notice: function (msg, e) {
		if (LOG_LEVEL < 3) return;
		this._log(msg, e);
	},

	warning: function (msg, e) {
		if (LOG_LEVEL < 2) return;
		msg = "[WARNING] " + ( msg ? msg : '' )
		e ? Stdlib.logException(e, msg) : Stdlib.log(msg);
	},

	error: function (msg, e, doAlert) {
		if (LOG_LEVEL < 1) return;
		msg = "[ERROR] " + ( msg ? msg : '' );
		e ? Stdlib.logException(e, msg, doAlert) : Stdlib.log(msg);
	},

	enable: function() {
		// Logging enabled?
		if (!LOG_LEVEL) return;

		// Process filename
		var logFilePath = LOG_FILE;
		if (!logFilePath) return;
		logFilePath = logFilePath.replace('{document}', origDocRef.name);
		logFilePath = logFilePath.replace('{loglevel}', LOG_LEVEL);
		logFilePath = new Date().strftime(logFilePath);

		// Folder exists?
		var logFile = new File(logFilePath);
		var logFolderPath = logFile.path;
		var logFolder = new Folder(logFolderPath);
		if (!logFolder.exists) return;

		// Enable logging
		Stdlib.log.enabled = true;
		Stdlib.log.append = LOG_APPEND;
		Stdlib.log.setFile(logFilePath);
		this._enabled = true;
	},

	_log: function (msg, e) {
		if (!this._enabled) return;
		msg = "[NOTICE] " + ( msg ? msg : '' );
		e ? Stdlib.logException(e, msg) : Stdlib.log(msg);
	}
}