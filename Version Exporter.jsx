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
//@include 'include/processPlain.js'
//@include 'include/export.js'
//@include 'include/ui.js'
//@include 'include/div.js'
//@include 'include/trimmer.js'
//@include 'include/log.js'
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
		var returnButtonID = ui_settingsDialog(exportInfo);
		if (returnButtonID == cancelButtonID) {
			return main_cancel();
		}
		if (returnButtonID == saveButtonID) {
			main_saveSettings();
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
		case 2:
			Log.notice('Operation mode: Plain');
			processPlain();
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

	// Remove old style saved settings from instructions field
	var instructionsArray = String(origDocRef.info.instructions).split(INSTRUCTIONS_SPLIT_TOKEN);
	var originalInstructions = String(instructionsArray[0]).trim();

	// If there are no settings saved - skip it
	if ( origDocRef.info.instructions != originalInstructions ) {
		origDocRef.info.instructions = originalInstructions;
		Log.notice('Removed old style settings from the instructions field. Current content of the instructions field: ' + originalInstructions);
	}

	// Lod the XMP library
	if (ExternalObject.AdobeXMPScript == undefined) ExternalObject.AdobeXMPScript = new ExternalObject("lib:AdobeXMPScript");

	// Get the actually saved settings
	var xmp = new XMPMeta( app.activeDocument.xmpMetadata.rawData );
	var originalSettings = xmp.getProperty(XMPConst.NS_XMP, XML_SETTINGS_NAME);
	var newSettingsSerialized = exportInfo.toSource();

	// If nothing is changed, do not update
	if ( originalSettings == newSettingsSerialized ) {
		Log.notice('Settings were not updated. XMP metadata remains untouched.');
		return;
	}

	Log.notice('Serialized settings for XMP metadata: ' + newSettingsSerialized);
	newSettingsSerialized = File.encode(newSettingsSerialized);
	Log.notice('Encoded serialized settings for XMP metadata: ' + newSettingsSerialized);
	xmp.setProperty(XMPConst.NS_XMP, XML_SETTINGS_NAME, newSettingsSerialized);
	app.activeDocument.xmpMetadata.rawData = xmp.serialize();

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
    exportInfo.fileNamePrefix               = new String("");
    exportInfo.filenameTemplate             = new String("{document}_{####}_{name}");
    exportInfo.operationMode                = 2;
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
		// var tmp = app.activeDocument.fullName.name;
		// exportInfo.fileNamePrefix = decodeURI(tmp.substring(0, tmp.indexOf("."))); // filename body part
	} catch(e) {
		Log.notice(e);
		exportInfo.destination = new String("");
		// exportInfo.fileNamePrefix = app.activeDocument.name; // filename body part
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

	// Check the settings

	// Check if the obsolete field prefix is used
	try {
		var prefix = String(exportInfo.fileNamePrefix);
		if (prefix.length) {
			exportInfo.filenameTemplate = exportInfo.filenameTemplate.replace("{document}", prefix);
			exportInfo.fileNamePrefix = "";
		}
	} catch(e){}

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


