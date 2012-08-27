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


//@include 'include/safariwrap.js'

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

	// Save options in Photoshop
	// DEPRECATED
	// var d = objectToDescriptor(exportInfo, strMessage);
	// app.putCustomOptions(SCRIPT_REGISTRY_ID, d);

	// Save options in the PSD
	var instructions = String(origDocRef.info.instructions);
	var originalInstructions = String(instructions.split(INSTRUCTIONS_SPLIT_TOKEN).shift()).trim();
	var newInstructionsArray = new Array();
	newInstructionsArray.push(originalInstructions);

	// Generate JSON
	var savedSettingsString = JSON.stringify(exportInfo);
	if ( savedSettingsString ) {
		Log.notice('Saving settings in METADATA: ' + savedSettingsString);
		newInstructionsArray.push(INSTRUCTIONS_SPLIT_TOKEN);
		newInstructionsArray.push(savedSettingsString);
	}

	// Save into the instuction field
	var newInstructionsString = newInstructionsArray.join("\n\n");
	origDocRef.info.instructions = newInstructionsString;

	// Message for the user
	var defaultMessage = "Export is finished";
	var finishMessage = ( msg != undefined ) ? defaultMessage + ": " + String(msg) : defaultMessage;

	Log.notice(finishMessage);

	if ( app.playbackDisplayDialogs != DialogModes.NO ) {
		alert(finishMessage);
	}

}


///////////////////////////////////////////////////////////////////////////////
// Function: initExportInfo
// Usage: create our default parameters
// Input: a new Object
// Return: a new object with params set to default
///////////////////////////////////////////////////////////////////////////////
function main_init(exportInfo) {

	Log.notice('Initializing export configuration');

	// Step 1: Initialize default parameters
	exportInfo.destination = new String("");
	exportInfo.fileNamePrefix = new String("untitled_");
	exportInfo.operationMode = 0;
	exportInfo.exportSelected = false;
	exportInfo.safariWrap = false;
	exportInfo.safariWrap_windowTitle = 'Website.com';
	exportInfo.safariWrap_windowURL = 'http://www.website.com';
	exportInfo.safariWrap_backgroundColor = '#444444';
	exportInfo.fileType = 0;
	exportInfo.icc = false;

	// // Step 2: Overwrite the defaults with values saved in the Photoshop
	// DEPRECATED
	// try {
	// 	var d = app.getCustomOptions(SCRIPT_REGISTRY_ID);
	// 	descriptorToObject(exportInfo, d, strMessage);
	// } catch(e) {} // it's ok if we don't have any options, continue with defaults

	// // See if I am getting descriptor parameters
	// descriptorToObject(exportInfo, app.playbackParameters, strMessage);

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

	// // Turn off Safari Wrap by default
	// exportInfo.safariWrap = false;

	// Step 3: Get saved settings for this particular PSD
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

		if (!documentConfig.exportInfo) {
			Log.notice("Configuration file does not contain \"exportInfo\" section, keeping defaults");
			return;
		}

		for ( var setting in documentConfig.exportInfo ) {

			switch (setting) {

				case "destination":
					var destination = documentConfig.exportInfo[setting];
					var currentDocumentPath = Folder(origDocRef.fullName.parent).fsName;
					var absoluteDestination = Url.getAbsolute(currentDocumentPath, destination);
					exportInfo.destination = absoluteDestination;
					Log.notice('Destination in configuration: ' + destination );
					Log.notice('Destination is set to absolute path: ' + absoluteDestination);
					break;

				default:
					exportInfo[setting] = documentConfig.exportInfo[setting];
					Log.notice( 'Setting "'+setting+'" set to: ' + documentConfig.exportInfo[setting] );
					break;
			}
		}

		// Safari Wrap Settings
		try {
			if (documentConfig.SafariWrap.windowTitle)
				exportInfo.safariWrap_windowTitle = documentConfig.SafariWrap.windowTitle;
			if (documentConfig.SafariWrap.url)
				exportInfo.safariWrap_windowURL = documentConfig.SafariWrap.url;
			if (documentConfig.SafariWrap.backgroundColor)
				exportInfo.safariWrap_backgroundColor = documentConfig.SafariWrap.backgroundColor;
		} catch(e){
			Log.warning('Could not get Safari Wrap settings from document config');
		}

	}

	// Disable export selected for batch operations
	if ( app.playbackDisplayDialogs == DialogModes.NO ) {
		exportInfo.exportSelected = false;
	}

	Log.notice('Finished initializing settings');

}



///////////////////////////////////////////////////////////////////////////////
// Function: objectToDescriptor
// Usage: create an ActionDescriptor from a JavaScript Object
// Input: JavaScript Object (o)
//        object unique string (s)
//        Pre process converter (f)
// Return: ActionDescriptor
// NOTE: Only boolean, string, number and UnitValue are supported, use a pre processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
// function objectToDescriptor (o, s, f) {
// 	if (undefined != f) o = f(o);
// 	var d = new ActionDescriptor;
// 	var l = o.reflect.properties.length;
// 	d.putString( app.charIDToTypeID( 'Msge' ), s );
// 	for (var i = 0; i < l; i++ ) {
// 		var k = o.reflect.properties[i].toString();
// 		if (k == "__proto__" || k == "__count__" || k == "__class__" || k == "reflect")
// 			continue;
// 		var v = o[ k ];
// 		k = app.stringIDToTypeID(k);
// 		switch ( typeof(v) ) {
// 			case "boolean":
// 				d.putBoolean(k, v);
// 				break;
// 			case "string":
// 				d.putString(k, v);
// 				break;
// 			case "number":
// 				d.putDouble(k, v);
// 				break;
// 			default:
// 			{
// 				if ( v instanceof UnitValue ) {
// 					var uc = new Object;
// 					uc["px"] = charIDToTypeID("#Rlt"); // unitDistance
// 					uc["%"] = charIDToTypeID("#Prc"); // unitPercent
// 					d.putUnitDouble(k, uc[v.type], v.value);
// 				} else {
// 					throw( new Error("Unsupported type in objectToDescriptor " + typeof(v) ) );
// 				}
// 			}
// 		}
// 	}
// 	return d;
// }


///////////////////////////////////////////////////////////////////////////////
// Function: descriptorToObject
// Usage: update a JavaScript Object from an ActionDescriptor
// Input: JavaScript Object (o), current object to update (output)
//        Photoshop ActionDescriptor (d), descriptor to pull new params for object from
//        object unique string (s)
//        JavaScript Function (f), post process converter utility to convert
// Return: Nothing, update is applied to passed in JavaScript Object (o)
// NOTE: Only boolean, string, number and UnitValue are supported, use a post processor
//       to convert (f) other types to one of these forms.
// REUSE: This routine is used in other scripts. Please update those if you
//        modify. I am not using include or eval statements as I want these
//        scripts self contained.
///////////////////////////////////////////////////////////////////////////////
// function descriptorToObject (o, d, s, f) {
// 	var l = d.count;
// 	if (l) {
// 		var keyMessage = app.charIDToTypeID( 'Msge' );
// 		if ( d.hasKey(keyMessage) && ( s != d.getString(keyMessage) )) return;
// 	}
// 	for (var i = 0; i < l; i++ ) {
// 		var k = d.getKey(i); // i + 1 ?
// 		var t = d.getType(k);
// 		strk = app.typeIDToStringID(k);
// 		switch (t) {
// 			case DescValueType.BOOLEANTYPE:
// 				o[strk] = d.getBoolean(k);
// 				break;
// 			case DescValueType.STRINGTYPE:
// 				o[strk] = d.getString(k);
// 				break;
// 			case DescValueType.DOUBLETYPE:
// 				o[strk] = d.getDouble(k);
// 				break;
// 			case DescValueType.UNITDOUBLE:
// 				{
// 				var uc = new Object;
// 				uc[charIDToTypeID("#Rlt")] = "px"; // unitDistance
// 				uc[charIDToTypeID("#Prc")] = "%"; // unitPercent
// 				uc[charIDToTypeID("#Pxl")] = "px"; // unitPixels
// 				var ut = d.getUnitDoubleType(k);
// 				var uv = d.getUnitDoubleValue(k);
// 				o[strk] = new UnitValue( uv, uc[ut] );
// 				}
// 				break;
// 			case DescValueType.INTEGERTYPE:
// 			case DescValueType.ALIASTYPE:
// 			case DescValueType.CLASSTYPE:
// 			case DescValueType.ENUMERATEDTYPE:
// 			case DescValueType.LISTTYPE:
// 			case DescValueType.OBJECTTYPE:
// 			case DescValueType.RAWTYPE:
// 			case DescValueType.REFERENCETYPE:
// 			default:
// 				throw( new Error("Unsupported type in descriptorToObject " + t ) );
// 		}
// 	}
// 	if (undefined != f) {
// 		o = f(o);
// 	}
// }


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


