/**
 * ------------------------------------------------------------
 * Copyright (c) 2012 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 203 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-08 00:53:51 +0200 (Tue, 08 May 2012) $:
 */


//=============================================================================
// Safari Wrap
//=============================================================================

function FirefoxWrap() {

	var dialogMode = DialogModes.NO;

	// Get Window title and  URL
	var windowTitle = settings.windowTitle;
	var URL = settings.windowURL;

	// Flatten the frame contents
	executeAction(sTID('flattenImage'), undefined, dialogMode);

	// Make background normal layer
	var contentsLayer = docRef.backgroundLayer;
	contentsLayer.isBackgroundLayer = false;

	// Resize original document canvas by +64 to each side...
	var desc1 = new ActionDescriptor();
	desc1.putBoolean(cTID('Rltv'), true);
	desc1.putUnitDouble(cTID('Wdth'), cTID('#Pxl'), 14);
	desc1.putUnitDouble(cTID('Hght'), cTID('#Pxl'), 14);
	desc1.putEnumerated(cTID('Hrzn'), cTID('HrzL'), cTID('Cntr'));
	desc1.putEnumerated(cTID('Vrtc'), cTID('VrtL'), cTID('Cntr'));
	executeAction(sTID('canvasSize'), desc1, DialogModes.NO);
	// ... and plus 48 to the top
	var desc1 = new ActionDescriptor();
	desc1.putBoolean(cTID('Rltv'), true);
	desc1.putUnitDouble(cTID('Hght'), cTID('#Pxl'), 80);
	desc1.putEnumerated(cTID('Vrtc'), cTID('VrtL'), cTID('Bttm'));
	//desc1.putEnumerated(sTID("canvasExtensionColorType"), sTID("canvasExtensionColorType"), cTID('Wht '));
	executeAction(sTID('canvasSize'), desc1, DialogModes.NO);

	// Get content layer bounds for future calculations
	var conetntLayerBounds = Stdlib.getLayerBounds(docRef, contentsLayer);

	// Open source file
	var wrapFile = new File(settings.sourcesPath + '/firefox.psd');
	if (!wrapFile.exists) throw(new Error("Slice file " + wrapFile + " wasn't found"));
	var wrapDoc = app.open(wrapFile);

	// Get root group
	var wrapRoot = wrapDoc.layerSets[0];
	Stdlib.copyLayerToDocument(wrapDoc, wrapRoot, docRef);
	wrapDoc.close(SaveOptions.DONOTSAVECHANGES);

	// Get FFW group in the original document
	var wrapRoot = docRef.layerSets[0];

	// Adjust Content Base
	var contentBase = wrapRoot.artLayers.getByName('Content');
	Stdlib.hideLayerEffects(docRef, contentBase);
	Stdlib.transformLayer(docRef, contentBase, conetntLayerBounds);
	Stdlib.showLayerEffects(docRef, contentBase);

	// Adjust Window Base
	var windowLayer = wrapRoot.artLayers.getByName('Base');
	docRef.activeLayer = windowLayer;
	Stdlib.removeVectorMask(docRef, windowLayer);
	makeRCrectangle( 0, 0, toNumber(docRef.height), toNumber(docRef.width), 7 );
	Stdlib.createVectorMaskFromCurrentPath(docRef, windowLayer);

	// Adjust side gradient
	var sideGradientLayer = wrapRoot.artLayers.getByName('Side Gradient');
	var bounds = Stdlib.getLayerBounds(docRef, sideGradientLayer);
	Stdlib.transformLayer(docRef, sideGradientLayer, [bounds[0], bounds[1], toNumber(docRef.width) - 2, toNumber(docRef.height) - 6] );

	// Adjust Reflection Layer
	var reflectionLayer = wrapRoot.artLayers.getByName('Reflection');
	docRef.activeLayer = reflectionLayer;
	Stdlib.removeVectorMask(docRef, reflectionLayer);
	makeRCrectangle( 2, 2, toNumber(docRef.height)-2, toNumber(docRef.width)-2, 6 );
	Stdlib.createVectorMaskFromCurrentPath(docRef, reflectionLayer);

	// Move "Top Right" corner to the right
	var topRightGroup = wrapRoot.layerSets.getByName('Top Right');
	var bounds = Stdlib.getLayerBounds(docRef, topRightGroup);
	var dX = toNumber(docRef.width) - bounds[2] - 2; // 2px for black and white borders
	topRightGroup.translate(dX, 0);

	// Stretching left layer
	var leftLayer = wrapRoot.artLayers.getByName('Bar Left');
	var leftLayerBounds = Stdlib.getLayerBounds(docRef, leftLayer);
	var rightLayer = topRightGroup.artLayers.getByName('Bar Right');
	var rightLayerBounds = Stdlib.getLayerBounds(docRef, rightLayer);
	docRef.activeLayer = leftLayer;
	Stdlib.selectBounds(docRef, [ (leftLayerBounds[2] - 1), 0, leftLayerBounds[2], leftLayerBounds[3]] );
	// Layer via copy and stretch
	executeAction( charIDToTypeID( "CpTL" ), undefined, DialogModes.NO );
	var stretchLayer = docRef.activeLayer;
	var stretchLayerBounds = Stdlib.getLayerBounds(docRef, stretchLayer);
	Stdlib.transformLayer(docRef, stretchLayer, [stretchLayerBounds[0], stretchLayerBounds[1], rightLayerBounds[0], rightLayerBounds[3]] );

	// Edit window title
	if (settings.windowTitle) {
		Log.notice('Safari Wrap: Setting window title: ' + settings.windowTitle );
		var WindowTitleLayer = wrapRoot.artLayers.getByName('Window Title');
		WindowTitleLayer.textItem.contents = settings.windowTitle;
	}

	// Edit URL
	if (settings.windowURL) {
		Log.notice('Safari Wrap: Setting URL: ' + settings.windowURL );
		var URLLayer = wrapRoot.artLayers.getByName('URL');
		URLLayer.textItem.contents = settings.windowURL;
	}

	// Move contents layer to to front
	docRef.activeLayer = contentsLayer;
	var desc1 = new ActionDescriptor();
	var ref1 = new ActionReference();
	ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
	desc1.putReference(cTID('null'), ref1);
	var ref2 = new ActionReference();
	ref2.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Frnt'));
	desc1.putReference(cTID('T   '), ref2);
	executeAction(cTID('move'), desc1, dialogMode);

	// Add margins around the window
	Stdlib.resizeCanvas(docRef, 50, 50, false, true);

	finalize();

}