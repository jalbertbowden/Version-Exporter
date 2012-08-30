/**
 * ------------------------------------------------------------
 * Copyright (c) 2012 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 203 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-08 00:53:51 +0200 (Tue, 08 May 2012) $:
 */


function Wrapper ( docRef ) {

	//@include 'include/wrap_safari.js'
	//@include 'include/wrap_firefox.js'

	// Check settings
	var settings = getSettings();

	// Backup Units
	var defaultRulerUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;

	// Process
	switch (settings.mode) {
		case 1: SafariWrap();	break;
		case 2: FirefoxWrap();	break;
	}

	// Restore Units
	preferences.rulerUnits = defaultRulerUnits;


	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Functions
	////////////////////////////////////////////////////////////////////////////////////////////////////

	function alignLayer( doc, layer, direction ) {
		Stdlib.selectBounds(doc, [0,0, doc.width, doc.height] );
		doc.activeLayer = layer;
		var desc1 = new ActionDescriptor();
		var ref1 = new ActionReference();
		ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
		desc1.putReference(cTID('null'), ref1);
		desc1.putEnumerated(cTID('Usng'), cTID('ADSt'), sTID(direction));
		executeAction(cTID('Algn'), desc1, DialogModes.NO);
		doc.selection.deselect();
	}

	function makeRCrectangle( top, left, bottom, right, radius ){
		  var desc = new ActionDescriptor();
			  var ref1 = new ActionReference();
			  ref1.putProperty( charIDToTypeID( "Path" ), charIDToTypeID( "WrPt" ) );
		  desc.putReference( charIDToTypeID( "null" ), ref1 );
			  var RDRdesc = new ActionDescriptor();
			  RDRdesc.putUnitDouble( charIDToTypeID( "Top " ), charIDToTypeID( "#Rlt" ), top );
			  RDRdesc.putUnitDouble( charIDToTypeID( "Left" ), charIDToTypeID( "#Rlt" ), left );
			  RDRdesc.putUnitDouble( charIDToTypeID( "Btom" ), charIDToTypeID( "#Rlt" ), bottom );
			  RDRdesc.putUnitDouble( charIDToTypeID( "Rght" ), charIDToTypeID( "#Rlt" ), right );
			  RDRdesc.putUnitDouble( charIDToTypeID( "Rds " ), charIDToTypeID( "#Rlt" ), radius );
		  desc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Rctn" ), RDRdesc );
	  executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );
	}

	function hexToRGBColor(hex){
		hex = String(hex);
		hex = hex.charAt(0) == "#" ? hex.substring(1,7) : hex;
		var color	= new SolidColor();
		color.rgb.red	= parseInt(hex.substring(0,2),16);
		color.rgb.green	= parseInt(hex.substring(2,4),16);
		color.rgb.blue	= parseInt(hex.substring(4,6),16);
		return color;
	}

	function cTID(s) { return app.charIDToTypeID(s); };

	function sTID(s) { return app.stringIDToTypeID(s); };

	function getSettings(){

		var sourcesPath;
		var currentDocumentPath;

		var settings = {};
		settings.mode = 0;
		settings.sourcesPath = '';
		settings.backgroundColor = app.backgroundColor;
		//settings.backgroundColor = hexToRGBColor("#999999");
		settings.windowTitle = "Website.com";
		settings.url = "http://www.website.com/";
		settings.transparentBackground = true;

		var wrapperFolders = {
			//0 : 'Disabled',
			1 : 'Safari Wrap',
			2 : 'Firefox Wrap',
		};

		// Wrapper Mode
		settings.mode = toNumber(exportInfo.Wrapper.mode);

		if ( !settings.mode ) {
			Log.warning('Wrapper: Mode "disabled" is chosen, breaking.');
			return;
		}

		for ( k in wrapperFolders ) {
			if (k == settings.mode) {
				sourcesSubFolder = wrapperFolders[k];
			}
		}

		// Getting the sourcesPath
		// Determine current document location
		try {
			currentDocumentPath = Folder(docRef.fullName.parent).fsName;
		} catch(e){}

		// 1. Sources folder is specified in the configuration
		try {
			Log.notice('Wrapper: Sources folder specified in configuration: ' + documentConfig.Wrapper.sourcesPath);
			if (!documentConfig.Wrapper.sourcesPath) throw(undefined);
			// Also try to get absolute path if relative one is specified
			sourcesPath = Url.getAbsolute(currentDocumentPath, documentConfig.Wrapper.sourcesPath);
			// If path is RELATIVE and the document is not saved, ignore the settings
			if ( sourcesPath != documentConfig.Wrapper.sourcesPath && !currentDocumentPath ) sourcesPath = '';
			// Path is either absolute or relative and the document is saved
			if (!Folder(sourcesPath).exists) sourcesPath = '';
		} catch(e){}

		// 2. Look for all sources folders folder in the same folder as the active document is saved
		// Use the first found source, and set corresponding mode
		if ( !sourcesPath && currentDocumentPath ) {
			for ( k in wrapperFolders ) {
				var subFolder = wrapperFolders[k];
				sourcesPath = currentDocumentPath + '/' + subFolder;
				Log.notice('Wrapper: Looking for "'+subFolder+'" folder in the same folder as the active document: ' +  Folder(sourcesPath).fsName );
				if (Folder(sourcesPath).exists) {
					settings.mode = k;
					break;
				} else {
					sourcesPath = '';
				}
			}
		}

		// 3. Check if we have a folder in the script directory for selected Wrapper mode
		if ( !sourcesPath ) {
			var subFolder = wrapperFolders[settings.mode];
			sourcesPath = Stdlib.getScriptFolder().parent.fsName + '/files/' + subFolder; // Stdlib.getScriptFolder() returns the "include" directory
			Log.notice('Wrapper: Check if we have a folder "files/'+subFolder+'" in the script directory: ' + Folder(sourcesPath).fsName );
			if (!Folder(sourcesPath).exists) sourcesPath = '';
		}

		// 4. Shit happens
		if ( !sourcesPath ) {
			throw( new Error('Wrapper could not find a folder with sources for selected mode: ' + settings.mode) );
		}

		// We have found a sources folder. Go, go, go!
		Log.notice('Wrapper: Using sources from: ' + Folder(sourcesPath).fsName );
		settings.sourcesPath = sourcesPath;

		// Function for checking all the settings
		function setParameter ( setting, value, transformationFunction, validationFunction ) {
			try {
				var condition = typeof(validationFunction) == 'function' ? validationFunction(value) : true;
				if (condition) settings[setting] = transformationFunction(value);
				Log.notice('Wrapper: Using "'+setting+'" setting: ' + settings[setting]);
			} catch(e){
				Log.warning('Wrapper: Error occuered while trying to get "'+setting+'" setting: ' + value);
			}
		}

		// Version Exporter GUI
		if (exportInfo) {
			setParameter('windowTitle',				exportInfo.Wrapper.windowTitle, 				convertToString,	isGiven);
			setParameter('url',						exportInfo.Wrapper.windowURL, 					convertToString, 	isGiven);
			setParameter('backgroundColor',			exportInfo.Wrapper.backgroundColor, 			hexToRGBColor,		isGiven);
			setParameter('transparentBackground',	exportInfo.Wrapper.backgroundColor, 			toBoolean,			isGiven);
			return settings;
		}

		// Document Configuration
		setParameter('windowTitle',				documentConfig.Wrapper.windowTitle, 				convertToString,	isGiven);
		setParameter('url',						documentConfig.Wrapper.windowURL, 					convertToString, 	isGiven);
		setParameter('backgroundColor',			documentConfig.Wrapper.backgroundColor, 			hexToRGBColor,		isGiven);
		setParameter('trim',					documentConfig.Wrapper.trim, 						toBoolean);
		setParameter('transparentBackground',	documentConfig.Wrapper.transparentBackground, 		toBoolean);

		return settings;

	}

	function finalize() {

		// Add background
		if (!settings.transparentBackground) {
			var backgroundLayer = docRef.artLayers.add();
			backgroundLayer.isBackgroundLayer = true;

			// Use color from configuration
			var appBackgroundColor = app.backgroundColor;
			if (settings.backgroundColor) app.backgroundColor = settings.backgroundColor;

			var idFl = charIDToTypeID( "Fl  " );
				var desc130 = new ActionDescriptor();
				var idUsng = charIDToTypeID( "Usng" );
				var idFlCn = charIDToTypeID( "FlCn" );
				var idBckC = charIDToTypeID( "BckC" );
				desc130.putEnumerated( idUsng, idFlCn, idBckC );
				var idOpct = charIDToTypeID( "Opct" );
				var idPrc = charIDToTypeID( "#Prc" );
				desc130.putUnitDouble( idOpct, idPrc, 100.000000 );
				var idMd = charIDToTypeID( "Md  " );
				var idBlnM = charIDToTypeID( "BlnM" );
				var idNrml = charIDToTypeID( "Nrml" );
				desc130.putEnumerated( idMd, idBlnM, idNrml );
			executeAction( idFl, desc130, DialogModes.NO );

			// Restore the background color
			app.backgroundColor = appBackgroundColor;
		}

		docRef.artLayers.add();

		// Merge Visible
		//Stdlib.mergeVisible(docRef);
		executeAction( charIDToTypeID( "MrgV" ), undefined, DialogModes.NO );

	}


}