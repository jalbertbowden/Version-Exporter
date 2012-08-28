/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 205 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-08 10:44:03 +0200 (Di, 08 Mai 2012) $:
 */

#target photoshop

//=============================================================================
// Version Exporter
//=============================================================================

//@include 'include/globals.js'
//@include 'include/config.js'
//@include 'include/stdlib.js'
//@include 'include/processLayers.js'
//@include 'include/processComps.js'
//@include 'include/export.js'
//@include 'include/ui.js'
//@include 'include/div.js'
//@include 'include/trimmer.js'
//@include 'include/log.js'
//@include 'include/json2.js'
//@include 'include/getSelectedLayers.js'
//@include 'include/wrapper.js'

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

	// initialising the settigns
	exportInfo = new Object();
	main_init(exportInfo);

	//Show the dialog
	if ( app.playbackDisplayDialogs != DialogModes.NO ) {
		if ( cancelButtonID == ui_settingsDialog(exportInfo) ) {
			return main_cancel();
		}
	}

	// Save settings in the PSD upon start
	main_saveSettings();

	// Start processing
	switch (exportInfo.operationMode) {
		case 0:
			Log.notice('Operation mode: Layer Sets');
			processLayers();
			break;
		case 1:
			Log.notice('Operation mode: Comps');
			processComps();
			break;
	}

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
function main_finish( msg ){

	// Message for the user
	var defaultMessage = "Export is finished";
	var finishMessage = ( msg != undefined ) ? defaultMessage + ": " + String(msg) : defaultMessage;

	Log.notice(finishMessage);

	if ( app.playbackDisplayDialogs != DialogModes.NO ) {
		alert(finishMessage);
	}

}


///////////////////////////////////////////////////////////////////////////////
// Function:	main_finish
// Usage:		returns to previusly saved hostory snapshot
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function main_saveSettings(){

	// Save options in the PSD
	var instructionsArray = String(origDocRef.info.instructions).split(INSTRUCTIONS_SPLIT_TOKEN);
	var originalInstructions = String(instructionsArray[0]).trim();
	var originalSavedSettings = String(instructionsArray[1]).trim();

	// Generate JSON
	var newSettingsString = JSON.stringify(exportInfo);

	// If nothing is changed, don't update the file
	if ( newSettingsString == originalSavedSettings || !newSettingsString ) return;

	Log.notice('Saving settings in METADATA: ' + newSettingsString);
	var newInstructionsArray = new Array();
	newInstructionsArray.push(originalInstructions);
	newInstructionsArray.push(INSTRUCTIONS_SPLIT_TOKEN);
	newInstructionsArray.push(newSettingsString);
	var newInstructionsString = newInstructionsArray.join("\n\n");
	origDocRef.info.instructions = newInstructionsString;

}


///////////////////////////////////////////////////////////////////////////////
// Function: initExportInfo
// Usage: create our default parameters
// Input: a new Object
// Return: a new object with params set to default
///////////////////////////////////////////////////////////////////////////////
function main_init(exportInfo) {

	Log.notice('Initializing export configuration');

	// Initialize default parameters
    exportInfo.destination                  = new String("");
    exportInfo.fileNamePrefix               = new String("untitled");
    exportInfo.operationMode                = 0;
    exportInfo.exportSelected               = false;
    exportInfo.fileType                     = 0;
    exportInfo.icc                          = false;

    exportInfo.Wrapper                      = {};
    exportInfo.Wrapper.mode                 = 0;
    exportInfo.Wrapper.windowTitle          = 'Website.com';
    exportInfo.Wrapper.url                  = 'http://www.website.com';
    exportInfo.Wrapper.backgroundColor      = '#444444'

    // exportInfo.safariWrap                   = false;
    // exportInfo.safariWrap_windowTitle       = 'Website.com';
    // exportInfo.safariWrap_windowURL         = 'http://www.website.com';
    // exportInfo.safariWrap_backgroundColor   = '#444444';

	// Set default destination and filename prefix
	try {
		exportInfo.destination = Folder(app.activeDocument.fullName.parent).fsName; // destination folder
		var tmp = app.activeDocument.fullName.name;
		exportInfo.fileNamePrefix = decodeURI(tmp.substring(0, tmp.indexOf("."))); // filename body part
	} catch(e) {
		Log.notice(e);
		exportInfo.destination = new String("");
		exportInfo.fileNamePrefix = app.activeDocument.name; // filename body part
	}

	// Get saved settings for this particular PSD
	var splitToken = INSTRUCTIONS_SPLIT_TOKEN;
	var instructions = String(origDocRef.info.instructions);
	var parts = instructions.split(splitToken);
	var originalInstructions = String(parts[0]).trim();
	var savedSettingsString = String(parts[1]).trim();
	var savedSettings = {};
	if ( savedSettingsString != "undefined" ) {
		Log.notice('Settings saved in METADATA: ' + savedSettingsString);
		savedSettings = JSON.parse(savedSettingsString);
		MergeObjectsRecursive(exportInfo, savedSettings);
	}

	// Get configuration for current document
	documentConfig = config_getCurrentDocConfig(origDocRef);

	// Override Settings by config
	if ( documentConfig ) {

		// Check if there is export configuration
		if (!documentConfig.exportInfo) {
			Log.notice("Configuration file does not contain \"exportInfo\" section, keeping defaults");
			return;
		}

		// Get absolute destination from configuration
		try {
			var destination = documentConfig.exportInfo.destination;
			if (isGiven(destination)) {
				var currentDocumentPath = Folder(origDocRef.fullName.parent).fsName;
				var absoluteDestination = Url.getAbsolute(currentDocumentPath, destination);
				exportInfo.destination = absoluteDestination;
				Log.notice('Destination in configuration: ' + destination );
				Log.notice('Destination is set to absolute path: ' + absoluteDestination);
			}
		} catch(e){
			Log.warning('Could not get absolute destination from configuration: ' + e);
		}

		// Copy document config to exportInfo
		MergeObjectsRecursive(exportInfo, documentConfig);


	}

	// Disable export selected for batch operations
	if ( app.playbackDisplayDialogs == DialogModes.NO ) {
		exportInfo.exportSelected = false;
	}

	Log.notice('Finished initializing settings');

}


//////////////////////////////////////////////////////////////////////////
// Function: StrToIntWithDefault
// Usage: convert a string to a number, first stripping all characters
// Input: string and a default number
// Return: a number
///////////////////////////////////////////////////////////////////////////
function StrToIntWithDefault( s, n ) {
	var onlyNumbers = /[^0-9]/g;
	var t = s.replace( onlyNumbers, "" );
	t = parseInt( t );
	if ( ! isNaN( t ) ) {
		n = t;
	}
	return n;
}


