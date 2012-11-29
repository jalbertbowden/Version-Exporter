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
	Log.notice('Starting Safari Wrap');

	// initialising the settigns
	exportInfo = new Object();
	main_init(exportInfo);

	// Set safari mode
	exportInfo.Wrapper.mode = 1;

	// Log.notice('Initializing export configuration');
	// documentConfig = config_getCurrentDocConfig(origDocRef);
	// Log.notice('Finished initialising settings');

	// docRef = origDocRef;
	// SafariWrap();
	Wrapper(origDocRef);

}


///////////////////////////////////////////////////////////////////////////////
// Function: main_init
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
    exportInfo.Wrapper.windowURL            = 'http://www.website.com';
    exportInfo.Wrapper.backgroundColor      = '#444444'

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

	// Get settings from XMP

	// Load the XMP library
	if (ExternalObject.AdobeXMPScript == undefined) ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");
	var xmp = new XMPMeta( app.activeDocument.xmpMetadata.rawData );
	var savedSettingsString = String(xmp.getProperty(XMPConst.NS_XMP, XML_SETTINGS_NAME));
	savedSettingsString = File.decode(savedSettingsString);

	// If there are no settings there, try the old style
	if ( savedSettingsString == "undefined" || savedSettingsString == "" ) {
		var splitToken = INSTRUCTIONS_SPLIT_TOKEN;
		var instructions = String(origDocRef.info.instructions);
		var parts = instructions.split(splitToken);
		var originalInstructions = String(parts[0]).trim();
		var savedSettingsString = String(parts[1]).trim();
	}

	var savedSettings = {};

	if ( savedSettingsString != "undefined" && savedSettingsString != "" ) {
		Log.notice('Got settings saved in : ' + savedSettingsString);

		savedSettings = eval('(' + savedSettingsString + ')');
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

	Log.notice('Export is finished');
	if ( app.playbackDisplayDialogs != DialogModes.NO ) {
		alert("Export is finished");
	}

	// return to initial state
	//Stdlib.revertToSnapshot(origDocRef, SNAPSHOTNAME);
}


