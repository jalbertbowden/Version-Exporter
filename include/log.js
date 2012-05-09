/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 155 $:
 * @author  $Author: mart $:
 * @date    $Date: 2011-11-07 12:49:01 +0100 (Mo, 07 Nov 2011) $:
 */


//=============================================================================
// Logging
//=============================================================================

var Log = {

	notice: function (msg, e) {
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
		var logFile = LOG_FILE;
		if (!logFile) return;
		logFile = logFile.replace('{document}', origDocRef.name);
		logFile = logFile.replace('{loglevel}', LOG_LEVEL);
		logFile = new Date().strftime(logFile);
		Stdlib.log.enabled = true;
		Stdlib.log.append = LOG_APPEND;
		Stdlib.log.setFile(logFile);
	},

	_log: function (msg, e) {
		if (LOG_LEVEL < 3) return;
		msg = "[NOTICE] " + ( msg ? msg : '' );
		e ? Stdlib.logException(e, msg) : Stdlib.log(msg);
	}
}