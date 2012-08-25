/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 203 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-08 00:53:51 +0200 (Tue, 08 May 2012) $:
 */


//=============================================================================
// Safari Wrap
//=============================================================================

function SafariWrap( docRef ) {

	// Check settings
	var settings = getSettings();

	// Backup Units
	var defaultRulerUnits = preferences.rulerUnits;
	preferences.rulerUnits = Units.PIXELS;

	// Process
	process();

	// Restore Units
	preferences.rulerUnits = defaultRulerUnits;

	////////////////////////////////////////////////////////////////////////////////////////////////////
	// Functions
	////////////////////////////////////////////////////////////////////////////////////////////////////

	function hexToRGBColor(hex){
		hex = hex.charAt(0) == "#" ? hex.substring(1,7) : hex;
		var color	= new SolidColor();
		color.rgb.red	= parseInt(hex.substring(0,2),16);
		color.rgb.green	= parseInt(hex.substring(2,4),16);
		color.rgb.blue	= parseInt(hex.substring(4,6),16);
		return color;
	}

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

	function cTID(s) { return app.charIDToTypeID(s); };

	function sTID(s) { return app.stringIDToTypeID(s); };

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

	function getSettings(){

		var sourcesPath;
		var currentDocumentPath;

		var settings = {};
		settings.sourcesPath = '';
		settings.trim = false;
		settings.backgroundColor = app.backgroundColor;
		//settings.backgroundColor = hexToRGBColor("#999999");
		settings.windowTitle = "Website.com";
		settings.url = "http://www.website.com/";
		settings.transparentBackground = true;

		// sourcesPath
		// Determine current document location
		try {
			currentDocumentPath = Folder(docRef.fullName.parent).fsName;
		} catch(e){}

		// 1. Sources folder is specified in the configuration
		try {
			Log.notice('Safari Wrap: Sources folder specified in configuration: ' + documentConfig.SafariWrap.sourcesPath);
			if (!documentConfig.SafariWrap.sourcesPath) throw(undefined);
			// Also try to get absolute path if relative one is specified
			sourcesPath = Url.getAbsolute(currentDocumentPath, documentConfig.SafariWrap.sourcesPath);
			// If path is RELATIVE and the document is not saved, ignore the settings
			if ( sourcesPath != documentConfig.SafariWrap.sourcesPath && !currentDocumentPath ) sourcesPath = '';
			// Path is either absolute or relative and the document is saved
			if (!Folder(sourcesPath).exists) sourcesPath = '';
		} catch(e){}

		// 2. Look for 'Safari Wrap' folder in the same folder as the active document is saved
		if ( !sourcesPath && currentDocumentPath ) {
			sourcesPath = currentDocumentPath + '/Safari Wrap';
			Log.notice('Safari Wrap: Looking for "Safari Wrap" folder in the same folder as the active document: ' +  Folder(sourcesPath).fsName );
			if (!Folder(sourcesPath).exists) sourcesPath = '';
		}

		// 3. Check if we have a folder "files/Safari Wrap" in the script directory
		// Stdlib.getScriptFolder() returns the "include" directory
		if ( !sourcesPath ) {
			sourcesPath = Stdlib.getScriptFolder().parent.fsName + '/files/Safari Wrap';
			Log.notice('Safari Wrap: Check if we have a folder "files/Safari Wrap" in the script directory: ' + Folder(sourcesPath).fsName );
			if (!Folder(sourcesPath).exists) sourcesPath = '';
		}

		// 4. Shit happens
		if ( !sourcesPath ) {
			throw( new Error('Safari Wrap could not find a folder with sources neither following configuration, nor near the document, nor in "files" folder near ther the script.') );
		}

		// We have found a sources folder. Go, go, go!
		Log.notice('Safari Wrap: Using sources from: ' + Folder(sourcesPath).fsName );
		settings.sourcesPath = sourcesPath;

		// If running in GUI mode with Version Exporter
		if (exportInfo) {
			try {
				if (exportInfo.safariWrap_windowTitle)
					settings.windowTitle = exportInfo.safariWrap_windowTitle.toString();
				if (exportInfo.safariWrap_windowURL)
					settings.url = exportInfo.safariWrap_windowURL.toString();
				if (exportInfo.safariWrap_backgroundColor) {
					settings.backgroundColor = hexToRGBColor(exportInfo.safariWrap_backgroundColor.toString());
					settings.transparentBackground = false;
				} else {
					settings.transparentBackground = true;
				}
				//if (exportInfo.safariWrap_trim)
					// FIXME: there will be string which is gonna be true always
					//settings.trim = exportInfo.safariWrap_trim ? true : false;
			} catch(e){}
			return settings;
		}

		// trim
		try {
			settings.trim = documentConfig.SafariWrap.trim ? true : false;
		} catch(e){}

		// transparentBackground
		try {
			settings.transparentBackground = documentConfig.SafariWrap.transparentBackground ? true : false;
		} catch(e){}

		// windowTitle
		try {
			if ( documentConfig.SafariWrap.windowTitle ) settings.windowTitle = documentConfig.SafariWrap.windowTitle;
		} catch(e){}

		// url
		try {
			if ( documentConfig.SafariWrap.url ) settings.url = documentConfig.SafariWrap.url;
		} catch(e){}

		// backgroundColor
		try {
			if ( documentConfig.SafariWrap.backgroundColor ) {
				Log.notice('Safari Wrap: Fixed background color: ' + documentConfig.SafariWrap.backgroundColor );
				settings.backgroundColor = hexToRGBColor(documentConfig.SafariWrap.backgroundColor);
			}
		} catch(e){}

		return settings;

	}


	function process() {

		var dialogMode = DialogModes.NO;

		// Get Window title and  URL
		try {
			var windowTitle = documentConfig.SafariWrap.windowTitle;
			var URL = documentConfig.SafariWrap.url;
		} catch(e){}

		// Flatten the frame contents
		executeAction(sTID('flattenImage'), undefined, dialogMode);

		// Merge contents layer
		var contentsLayer = docRef.backgroundLayer;
		contentsLayer.isBackgroundLayer = false;


		// Open source file
		var headerFile = new File(settings.sourcesPath + '/safari.psd');
		if (!headerFile.exists) throw(new Error("Slice file " + headerFile + " wasn't found"));
		var headerDoc = app.open(headerFile);
		var headerHeight = headerDoc.height;


		// Save position of the URL layer
		var URLLayerBounds = Stdlib.getLayerBounds(headerDoc, headerDoc.artLayers.getByName('URL'));

		// Resize Safari canvas
		var desc1 = new ActionDescriptor();
		desc1.putBoolean(cTID('Rltv'), false);
		desc1.putUnitDouble(cTID('Wdth'), cTID('#Pxl'), docRef.width);
		executeAction(sTID('canvasSize'), desc1, dialogMode);

		// Position layers: WindowTitleLayer
		var WindowTitleLayer = headerDoc.artLayers.getByName('WindowTitle');
		alignLayer(headerDoc, WindowTitleLayer, "ADSCentersH" );

		// Position layers: rightLayer
		var rightLayer = headerDoc.artLayers.getByName('Right');
		alignLayer(headerDoc, rightLayer, "ADSRights" );

		// Stretching left layer
		var leftLayer = headerDoc.artLayers.getByName('Left');
		headerDoc.activeLayer = leftLayer;
		var leftLayerBounds = Stdlib.getLayerBounds(headerDoc, leftLayer);
		var rightLayerBounds = Stdlib.getLayerBounds(headerDoc, rightLayer);
		Stdlib.selectBounds(headerDoc, [ (leftLayerBounds[2] - 1), 0, leftLayerBounds[2], leftLayerBounds[3]] );
		// Layer via copy
		executeAction( charIDToTypeID( "CpTL" ), undefined, DialogModes.NO );
		var stretchLayer = headerDoc.activeLayer;
		var stretchLayerBounds = Stdlib.getLayerBounds(headerDoc, stretchLayer);
		// Strech it
		Stdlib.transformLayer(headerDoc, stretchLayer, [stretchLayerBounds[0], stretchLayerBounds[1], rightLayerBounds[0], rightLayerBounds[3]] );

		// Edit window title
		if (settings.windowTitle) {
			Log.notice('Safari Wrap: Setting window title: ' + settings.windowTitle );
			WindowTitleLayer.textItem.contents = settings.windowTitle;
		}

		// Edit URL
		if (settings.url) {
			Log.notice('Safari Wrap: Setting URL: ' + settings.url );
			var URLLayer = headerDoc.artLayers.getByName('URL');
			URLLayer.textItem.contents = settings.url;
		}

		// Copy styles to clipboard
		var shadowLayer = headerDoc.artLayers.getByName('Shadow');
		Stdlib.copyEffects( headerDoc, shadowLayer );

		// Finish working with header
		Stdlib.mergeVisible(headerDoc);
		Stdlib.selectBounds(headerDoc, [0,0, headerDoc.width, headerDoc.height] );
		headerDoc.selection.copy(true); // Merge visible and copy to clipboard
		headerDoc.close(SaveOptions.DONOTSAVECHANGES);

		// Main Document Canvas Size
		var desc1 = new ActionDescriptor();
		desc1.putBoolean(cTID('Rltv'), true);
		desc1.putUnitDouble(cTID('Hght'), cTID('#Pxl'), toNumber(headerHeight) );
		desc1.putEnumerated(cTID('Vrtc'), cTID('VrtL'), cTID('Bttm'));
		desc1.putEnumerated(sTID("canvasExtensionColorType"), sTID("canvasExtensionColorType"), cTID('Wht '));
		executeAction(sTID('canvasSize'), desc1, dialogMode);

		// Paste header and align it
		var headerLayer = docRef.paste();
		Stdlib.transformLayer(docRef, headerLayer, [0, 0, toNumber(docRef.width), toNumber(headerHeight)]);

		Stdlib.mergeVisible(docRef);
		var windowLayer = docRef.activeLayer;
		windowLayer.name = "Window Layer";

		// Add shadow
		Stdlib.pasteStyles( docRef, windowLayer, true );
		makeRCrectangle( 0, 0, docRef.height.value, docRef.width.value, 0 );
		Stdlib.createVectorMaskFromCurrentPath(docRef, windowLayer);
		Stdlib.rasterizeVectorMask(docRef, windowLayer);
		Stdlib.applyLayerMask(docRef, windowLayer);

		removeBorderAroundHeader();
		function removeBorderAroundHeader(){

			// Create layers from styles
			var idMk = charIDToTypeID( "Mk  " );
			    var desc16 = new ActionDescriptor();
			    var idnull = charIDToTypeID( "null" );
			        var ref8 = new ActionReference();
			        var idLyr = charIDToTypeID( "Lyr " );
			        ref8.putClass( idLyr );
			    desc16.putReference( idnull, ref8 );
			    var idUsng = charIDToTypeID( "Usng" );
			        var ref9 = new ActionReference();
			        var idPrpr = charIDToTypeID( "Prpr" );
			        var idLefx = charIDToTypeID( "Lefx" );
			        ref9.putProperty( idPrpr, idLefx );
			        var idLyr = charIDToTypeID( "Lyr " );
			        var idOrdn = charIDToTypeID( "Ordn" );
			        var idTrgt = charIDToTypeID( "Trgt" );
			        ref9.putEnumerated( idLyr, idOrdn, idTrgt );
			    desc16.putReference( idUsng, ref9 );
			executeAction( idMk, desc16, DialogModes.NO );

			// Select first layer on top
			var idslct = charIDToTypeID( "slct" );
			    var desc83 = new ActionDescriptor();
			    var idnull = charIDToTypeID( "null" );
			        var ref34 = new ActionReference();
			        var idLyr = charIDToTypeID( "Lyr " );
			        var idOrdn = charIDToTypeID( "Ordn" );
			        var idFrwr = charIDToTypeID( "Frwr" );
			        ref34.putEnumerated( idLyr, idOrdn, idFrwr );
			    desc83.putReference( idnull, ref34 );
			    var idMkVs = charIDToTypeID( "MkVs" );
			    desc83.putBoolean( idMkVs, false );
			executeAction( idslct, desc83, DialogModes.NO );

			// Remove border around the header
			Stdlib.selectBounds(docRef, [0, 0, toNumber(docRef.width), toNumber(headerHeight)] );
			docRef.selection.clear();

		}

		// Main Document Canvas Size
		Stdlib.resizeCanvas(docRef, 120, 120, false, true);



		// var desc1 = new ActionDescriptor();
		// var ref1 = new ActionReference();
		// ref1.putProperty(cTID('Prpr'), cTID('Lefx'));
		// ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
		// desc1.putReference(cTID('null'), ref1);
		// var desc2 = new ActionDescriptor();
		// desc2.putUnitDouble(cTID('Scl '), cTID('#Prc'), 100);
		// var desc3 = new ActionDescriptor();
		// desc3.putBoolean(cTID('enab'), true);
		// desc3.putEnumerated(cTID('Md  '), cTID('BlnM'), cTID('Mltp'));
		// var desc4 = new ActionDescriptor();
		// desc4.putDouble(cTID('Rd  '), 0);
		// desc4.putDouble(cTID('Grn '), 0);
		// desc4.putDouble(cTID('Bl  '), 0);
		// desc3.putObject(cTID('Clr '), sTID("RGBColor"), desc4);
		// desc3.putUnitDouble(cTID('Opct'), cTID('#Prc'), 27);
		// desc3.putBoolean(cTID('uglg'), false);
		// desc3.putUnitDouble(cTID('lagl'), cTID('#Ang'), 90);
		// desc3.putUnitDouble(cTID('Dstn'), cTID('#Pxl'), 13);
		// desc3.putUnitDouble(cTID('Ckmt'), cTID('#Pxl'), 0);
		// desc3.putUnitDouble(cTID('blur'), cTID('#Pxl'), 27);
		// desc3.putUnitDouble(cTID('Nose'), cTID('#Prc'), 0);
		// desc3.putBoolean(cTID('AntA'), false);
		// var desc5 = new ActionDescriptor();
		// var list1 = new ActionList();
		// var desc6 = new ActionDescriptor();
		// desc6.putDouble(cTID('Hrzn'), 0);
		// desc6.putDouble(cTID('Vrtc'), 2);
		// list1.putObject(cTID('CrPt'), desc6);
		// var desc7 = new ActionDescriptor();
		// desc7.putDouble(cTID('Hrzn'), 27);
		// desc7.putDouble(cTID('Vrtc'), 51);
		// list1.putObject(cTID('CrPt'), desc7);
		// var desc8 = new ActionDescriptor();
		// desc8.putDouble(cTID('Hrzn'), 249);
		// desc8.putDouble(cTID('Vrtc'), 255);
		// list1.putObject(cTID('CrPt'), desc8);
		// desc5.putList(cTID('Crv '), list1);
		// desc3.putObject(cTID('TrnS'), cTID('ShpC'), desc5);
		// desc3.putBoolean(sTID("layerConceals"), true);
		// desc2.putObject(cTID('DrSh'), cTID('DrSh'), desc3);
		// desc1.putObject(cTID('T   '), cTID('Lefx'), desc2);
		// executeAction(cTID('setd'), desc1, dialogMode);

		// Trim document
		if (settings.trim) docRef.trim(TrimType.TOPLEFT);

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
		Stdlib.mergeVisible(docRef);

	}


}