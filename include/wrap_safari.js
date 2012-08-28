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

function SafariWrap () {

	var dialogMode = DialogModes.NO;

	// Get Window title and  URL
	try {
		var windowTitle = settings.windowTitle;
		var URL = settings.windowURL;
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
	makeRCrectangle( 0, 0, docRef.height.value, docRef.width.value, 5 );
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

	// Trim document
	if (settings.trim) docRef.trim(TrimType.TOPLEFT);

	finalize();

}