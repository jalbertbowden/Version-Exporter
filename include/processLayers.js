/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 216 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-07-02 20:09:11 +0200 (Mo, 02 Jul 2012) $:
 */


//=============================================================================
// Processing
//=============================================================================


///////////////////////////////////////////////////////////////////////////////
// Function:	processLayers
// Usage:		main routine of the processing
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function processLayers() {

	// Work with duplicate
	docRef = origDocRef.duplicate();

	// Get selected Layers
	var selectedLayers = exportInfo.exportSelected ? getSelectedLayers() : false;

	// Put all root layers in layerSets and name them accordingly
	groupRootLayers();

	// Check if we have something to work with
	if (!docRef.layerSets.length) {
		alert('Nothing to export');
		return main_cancel();
	}

	// Get existing background layer or merge it from a background layerSet
	processBackground();

	// Setting local variables optimizes the speed of the script
	var layerSets = docRef.layerSets;
	var layerSetsLength = layerSets.length;

	// Hide all root layerSets
	for (var i = 0; i < layerSetsLength; i++ ){
		var currentLayerSet = layerSets[i];
		currentLayerSet.visible = false;
	}

	// Show background layer
	if (backgroundLayerSet) backgroundLayerSet.visible = true;

	// Save initial state
	Stdlib.takeSnapshot(docRef);

	// Cycle through the layerSets
	for (var i = 0; i < layerSetsLength; i++ ){

		// Define current layerSet
		var currentLayerSet = layerSets[i];

		// Skipping if the name starts with ~ or #
		if ( String(currentLayerSet.name).startsWith('#') || String(currentLayerSet.name).startsWith('~') ) continue;

		// Skip Background
		if ( currentLayerSet == backgroundLayerSet ) continue;

		// Get layers set type (color)
		var layerColor = getLayerColor(currentLayerSet);

		// Override version format
		overrideFormat = null;

		switch (layerColor) {

			// Disabled layerSet, skip it
			case DISABLEDSETCOLOR:
				currentLayerSet.visible = false;
				break;

			// Process SmartLayerSet
			case SMARTSETCOLOR:

				// Filter if Export Selected is enabled
				if (selectedLayers) {
					if ( selectedLayers.indexOf(currentLayerSet) < 0 )  {
						versionNumber++;
						currentLayerSet.visible = false;
						break;
					}
				}

				// Select the layerSet and make it visible;
				docRef.activeLayer = currentLayerSet;
				currentLayerSet.visible = true;

				// Process the SmartLayerSet
				processSmartLayerSet(currentLayerSet);

				// For SmartLayerSets hide the background
				if ( backgroundLayerSet ) backgroundLayerSet.visible = false;

				// Trim document
				try {
					if (exportInfo.trim) {
						docRef.trim(TrimType.TRANSPARENT);
					}
				} catch(e) {}

				// Export version
				export_version(currentLayerSet.name);
				// Revert is needed after actions, trimming and stuff
				app.activeDocument = docRef; // fix for CS5
				Stdlib.revertToLastSnapshot(docRef);
				// Hide current layer
				currentLayerSet.visible = false;
				// Show background
				if ( backgroundLayerSet ) backgroundLayerSet.visible = true;
				break;

			// Regular layerSet
			default:

				// Filter if Export Selected is enabled
				if (selectedLayers) {
					if ( selectedLayers.indexOf(currentLayerSet) < 0 )  {
						versionNumber++;
						currentLayerSet.visible = false;
						break;
					}
				}

				// Select the layerSet and make it visible;
				docRef.activeLayer = currentLayerSet;
				currentLayerSet.visible = true;

				// Trim document
				try {
					if (exportInfo.trim) {
						docRef.trim(TrimType.TRANSPARENT);
					}
				} catch(e) {}

				// Export version
				export_version(currentLayerSet.name);

				// Revert is needed when trimming
				app.activeDocument = docRef; // fix for CS5
				Stdlib.revertToLastSnapshot(docRef);

				// Hide current layer
				currentLayerSet.visible = false;
				break;
		} // switch (layerColor) {

	}

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();

}


///////////////////////////////////////////////////////////////////////////////
// Function:	processSmartLayerSet
// Usage:
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function processSmartLayerSet( layerSet ) {

	// if no layers inside, remove it
	if ( layerSet.artLayers.length <= 0 ) {
		layerSet.remove();
		return;
	}

	var docRef = layerSet.parent;

	// Cache initial set of layers in the Smart Layer Set
	var layers = [];
	var length = layerSet.artLayers.length;
	for ( var i=0; i<length; i++ ) {
		layers.push(layerSet.artLayers[i]);
	}

	// Go through the Reference and Action Layers
	for ( var i=0; i<layers.length; i++ ) {

		var currentLayer = layers[i];
 		var layerColor = getLayerColor(currentLayer);

		// Action Layer
 		if (layerColor == ACTIONLAYERCOLOR) {
 			processCommand(currentLayer.name);

		// Reference Layer
 		} else {
	 		var path = currentLayer.name;
	 		var layer = getLayerByPath(docRef, path);
			layer.duplicate( currentLayer, ElementPlacement.PLACEAFTER );
		}

		// Remove place holder layer
		currentLayer.remove();

	}


	function processCommand(command){

		command = String(command); // cut off first "@" symbol
		var action = command.split(/\s+/).shift();
		var params = command.substring(action.length).trim();

		switch (action) {

			// Faltten Image
			case "flatten":
				docRef.flatten();
				break;

			// Merge Visible
			case "mergeVisible":
				Log.notice('Action recognized: ' + action);
				Stdlib.mergeVisible(docRef);
				break;

			// Trim Transparency
			case "trim":
				Log.notice('Action recognized: ' + action);
				try {
					trimmer(docRef);
				} catch(e) {
					Log.error('export_prepare: Could not trim the document', e);
				}
				break;

			// Resize
			case "resize":
				Log.notice('Action recognized: ' + action);

				var dimensions = params.split(",", 2); // expect 2 params: width and height

				// Replace variables
				for (var i = 0; i < dimensions.length; i++) {
					var d = String(dimensions[i]).trim();
					if (d == 'w') d = getUnitValue(docRef.width);
					if (d == 'h') d = getUnitValue(docRef.height);
					dimensions[i] = d;
				}

				var width = parseInt(dimensions[0]);
				var height = parseInt(dimensions[1]);

				Stdlib.resizeImage(docRef, width, height);

				break;

			// Crop
			case "crop":

				// crop by layer
				if (params.startsWith('area')) {
					var bounds = Stdlib.getLayerBounds(docRef, currentLayer);
					currentLayer.visible = false;
				// crop by bounds
				} else {
					var bounds = params.split(",", 4); // expect 4 params
					// Replace variables
					for (var i = 0; i < bounds.length; i++) {
						var d = String(bounds[i]).trim();
						if (d == 'w') d = getUnitValue(docRef.width);
						if (d == 'h') d = getUnitValue(docRef.height);
						bounds[i] = d;
					}
				}

				// We add a new layer to make it selected
				// Because if the selection will be on an invisible layer
				// the merge visible function will be unavailable
				docRef.artLayers.add();
				Stdlib.mergeVisible(docRef);
				// Delete hidden layers to make crop work faster
				Stdlib.deleteAllHiddenLayers(docRef);

				// crop
				Stdlib.cropBounds(docRef, bounds);
				break;

			// Override file format
			case "format":
				Log.notice('Action recognized: ' + action);
				var format = String(params).toUpperCase();
				Log.notice('Trying to set format: ' + format);
				var fileTypeIndex = fileTypes.indexOf(format);
				Log.notice('Format index: ' + fileTypeIndex);
				if ( fileTypeIndex != -1 ) {
					Log.notice('Setting format override to ' + fileTypeIndex);
					overrideFormat = fileTypeIndex;
				}
				break;

			// Unrecognized
			default:
				Log.warning('Action was not recognized: ' + command);
				break;
		}
	}


}


///////////////////////////////////////////////////////////////////////////////
// Function:	groupRootLayers
// Usage:		Put all root layers in layerSets and name them accordingly
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function groupRootLayers(){

	var notGroupedLayers = new Array();

	// Collecting current root layers
	for ( i = 0; i < docRef.artLayers.length; i++ ){
		var currentLayer =  docRef.artLayers[i];

		// make background layer to a normal one
		if (currentLayer.isBackgroundLayer) {
			currentLayer.isBackgroundLayer = false;
			currentLayer.name = BACKGROUNDLAYERSETNAME;
		}

		// save layers in a separate array
		notGroupedLayers.push(currentLayer);
	}

	for ( i = 0; i < notGroupedLayers.length; i++ ){

		var currentLayer = notGroupedLayers[i];

		// THe layer should be visible inside the group
		currentLayer.visible = true;

		// save the color of the layer
		var layerColor = getLayerColor(currentLayer);

		//Stdlib.selectLayers( docRef, [currentLayer], false );
		docRef.activeLayer = currentLayer;
		var newGroup = Stdlib.newGroupFromLayers(docRef);

		// rename the new group
		newGroup.name = currentLayer.name;

		// set the color to the new group
		setActiveLayerColor(layerColor);

	}
}


///////////////////////////////////////////////////////////////////////////////
// Function:	processBackground
// Usage:
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function processBackground(){

	// set it globally
	backgroundLayerSet = null;

	// Check if there is a Background LayerSet
	try {

		var lastLayerSet = docRef.layerSets[docRef.layerSets.length - 1];
		if (lastLayerSet.name == BACKGROUNDLAYERSETNAME) {
			backgroundLayerSet = lastLayerSet;
		}

	} catch (e) {}

}



///////////////////////////////////////////////////////////////////////////////
// Function:	getLayerColor
// Usage:
// Input:		none
// Return:		Colors returned "none","red","orange","yellowColor","grain","blue","violet","gray"
///////////////////////////////////////////////////////////////////////////////
function getLayerColor( targetLayer ){
	var actionDescriptor = Stdlib.getLayerDescriptor(docRef, targetLayer)
	return typeIDToStringID(actionDescriptor.getEnumerationValue(stringIDToTypeID('color')));
}


///////////////////////////////////////////////////////////////////////////////
// Function:	setActiveLayerColor
// Usage:
// Input:		none
// Return:		Set active layer color
///////////////////////////////////////////////////////////////////////////////
function setActiveLayerColor( color ) {
	switch (color){
		case 'red': 			color = 'Rd  '; break;
		case 'orange' : 		color = 'Orng'; break;
		case 'yellow' : 		color = 'Ylw '; break;
		case 'yellowColor' : 	color = 'Ylw '; break;
		case 'green' : 			color = 'Grn '; break;
		case 'grain' : 			color = 'Grn '; break;
		case 'blue' : 			color = 'Bl  '; break;
		case 'violet' : 		color = 'Vlt '; break;
		case 'gray' : 			color = 'Gry '; break;
		case 'none' : 			color = 'None'; break;
		default : 				color = 'None'; break;
	}
	var desc = new ActionDescriptor();
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
	desc.putReference( charIDToTypeID('null'), ref );
	var desc2 = new ActionDescriptor();
	desc2.putEnumerated( charIDToTypeID('Clr '), charIDToTypeID('Clr '), charIDToTypeID(color) );
	desc.putObject( charIDToTypeID('T   '), charIDToTypeID('Lyr '), desc2 );
	executeAction( charIDToTypeID('setd'), desc, DialogModes.NO );
}