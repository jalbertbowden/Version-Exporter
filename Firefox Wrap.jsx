/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 138 $:
 * @author  $Author: mart $:
 * @date    $Date: 2011-10-31 10:35:07 +0100 (Mo, 31 Okt 2011) $:
 */

#target photoshop

//=============================================================================
// Version Exporter
//=============================================================================

//@include 'include/globals.js'
//@include 'include/config.js'
//@include 'include/stdlib.js'
//@include 'include/export.js'
//@include 'include/ui.js'
//@include 'include/div.js'
//@include 'include/log.js'

//@include 'include/wrap_firefox.js'

// Dispatch
main();


///////////////////////////////////////////////////////////////////////////////
// Function:	main
// Usage:		starting script rotine
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function main(){

	if ( app.documents.length <= 0 ) {
		if ( app.playbackDisplayDialogs != DialogModes.NO ) {
			alert("Document must be opened");
		}
		return 'cancel'; // quit, returning 'cancel' (dont localize) makes the actions palette not record our script
	}

	origDocRef = app.activeDocument;
	docName = origDocRef.name;

	// Enable logging
	Log.enable();
	Log.notice('Starting Version Exporter');

	Log.notice('Initializing export configuration');
	documentConfig = config_getCurrentDocConfig(origDocRef);
	Log.notice('Finished initialising settings');

	//var docRef = origDocRef.duplicate();
	FirefoxWrap(origDocRef);

}


///////////////////////////////////////////////////////////////////////////////
// Function:	main_cancel
// Usage:		prevents action from recording if there was some error
// Input:		none
// Return:		string 'cancel'
///////////////////////////////////////////////////////////////////////////////
function main_cancel(){
	Log.notice('Canceled')
	return 'cancel';
}


///////////////////////////////////////////////////////////////////////////////
// Function:	main_finish
// Usage:		returns to previusly saved hostory snapshot
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function main_finish(){

	// Save options
	var d = objectToDescriptor(exportInfo, strMessage, preProcessExportInfo);
	app.putCustomOptions(SCRIPT_REGISTRY_ID, d);

	Log.notice('Export is finished');
	if ( app.playbackDisplayDialogs != DialogModes.NO ) {
		alert("Export is finished");
	}

	// return to initial state
	//Stdlib.revertToSnapshot(origDocRef, SNAPSHOTNAME);
}


