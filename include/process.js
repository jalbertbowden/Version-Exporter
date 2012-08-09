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
// Function:	process_main
// Usage:		main routine of the processing
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function process_main() {

	// Work with duplicate
	docRef = origDocRef.duplicate();

	// Get selected Layers
	var selectedLayers = getSelectedLayers();

	// Put all root layers in layerSets and name them accordingly
	groupRootLayers();

	// Get existing background layer or merge it from a background layerSet
	processBackground();

	// Check if we have something to work with
	if (!docRef.layerSets.length) {
		alert('Nothing to export');
		return main_cancel();
	}

	// Hide all root layerSets
	for (var i = 0; i < docRef.layerSets.length; i++ ){
		docRef.layerSets[i].visible = 0;
	}

	// Show background layer
	if (backgroundLayerSet) backgroundLayerSet.visible = true;

	// Save initial state
	Stdlib.takeSnapshot(docRef);

	// Cycle through the layerSets
	for (var i = 0; i < docRef.layerSets.length; i++ ){

		// Define current layerSet
		var currentLayerSet = docRef.layerSets[i];

		// Select the layerSet and make it visible;
		docRef.activeLayer = currentLayerSet;
		currentLayerSet.visible = true;

		// Skip Background
		if ( currentLayerSet == backgroundLayerSet ) continue;

		// Get layers set type (color)
		var layerColor = getLayerColor(currentLayerSet);

		switch (layerColor) {

			// Disabled layerSet, skip it
			case DISABLEDSETCOLOR:
				currentLayerSet.visible = false;
				break;

			// Process SmartLayerSet
			case SMARTSETCOLOR:

				// Filter if Export Selected is enabled
				if (exportInfo.exportSelected && selectedLayers) {
					if ( selectedLayers.indexOf(currentLayerSet) < 0 )  {
						versionNumber++;
						currentLayerSet.visible = false;
						break;
					}
				}

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
				Stdlib.revertToLastSnapshot(docRef);
				// Hide current layer
				currentLayerSet.visible = false;
				// Show background
				if ( backgroundLayerSet ) backgroundLayerSet.visible = true;
				break;

			// Regular layerSet
			default:

				// Filter if Export Selected is enabled
				if (exportInfo.exportSelected && selectedLayers) {
					if ( selectedLayers.indexOf(currentLayerSet) < 0 )  {
						versionNumber++;
						currentLayerSet.visible = false;
						break;
					}
				}

				// Trim document
				try {
					if (exportInfo.trim) {
						docRef.trim(TrimType.TRANSPARENT);
					}
				} catch(e) {}

				// Export version
				export_version(currentLayerSet.name);

				// Revert is needed when trimming
				Stdlib.revertToLastSnapshot(docRef);

				// hide current layer
				currentLayerSet.visible = false;
				break;
		} // switch (layerColor) {

	}

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();

}


///////////////////////////////////////////////////////////////////////////////
// Function:
// Usage:
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function processSmartLayerSet( layerSet ) {

	// if no layers inside, remove it
	if ( layerSet.artLayers.length <= 0 ) {
		layerSet.remove();
	}

	do { // while ( layerSet.artLayers.length );

		var currentLayer = layerSet.artLayers[0];

 		var layerPath = currentLayer.name.split("/");

 		// Action layer
 		var layerColor = getLayerColor(currentLayer);
 		if (layerColor == ACTIONLAYERCOLOR) {

 			var command = currentLayer.name;
 			var commandSplit = command.split(" ");

 			var action = commandSplit[0];
 			action = action.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim

 			var params = commandSplit[1];
 			params = params.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim

 			switch (action) {

 				// Crop Action Layer
 				case "crop":

 					if (params == "area") {
 						var bounds = Stdlib.getLayerBounds(docRef, currentLayer);
 						currentLayer.visible = false;
 					} else {
	 					var bounds = params.split(",", 4); // expect 4 params
	 					// Replace variables
	 					for (var i = 0; i < bounds.length; i++) {
	 						var d = String(bounds[i]);
	 						d = d.replace(/^\s\s*/, '').replace(/\s\s*$/, ''); // trim
	 						if (d == 'w') d = getUnitValue(docRef.width);
	 						if (d == 'h') d = getUnitValue(docRef.height);
	 						bounds[i] = d;
	 					}
 					}


 					// Crop
 					Stdlib.cropBounds(docRef, bounds);
 					break;

 				// Unrecognized
 				default:
 					Log.warning('Action layer was not recognized: ' + command);
 					break;
 			}

			// Remove Action latyer and move to the next
			currentLayer.remove();
			continue;
 		}

		try {

			// Variables
			var referenceLayerSet = null;
			var container = docRef;

			// Sycle through the path segments
			for ( var i = 0; i < layerPath.length; i++ ) {
				var pathSegment = layerPath[i].trim();
				//alert(layerPath + '++' + pathSegment)
				container = container.layerSets.getByName(pathSegment);
			}

			// We got to this point without an error, so we found the reference layer set
			referenceLayerSet = container;
			referenceLayerSet.duplicate( currentLayer, ElementPlacement.PLACEAFTER );

		} catch(e) {
			// log('layer '+currentLayer.name+' wasnt found')
		}

		// Remove place holder layer
		currentLayer.remove();

	} while ( layerSet.artLayers.length );
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

		// There might be several layerSets named "Background"
		var backgroundsLayers = Stdlib.getAllByName(docRef.layerSets, BACKGROUNDLAYERSETNAME);

		// Rename all the layers, except for the last one
		for  (var i = 0; i < (backgroundsLayers.length - 1); i++ ) {
			backgroundsLayers[i].name = BACKGROUNDLAYERSETNAME + ' ' + (i + 1);
		}

		// set the global reference to the last background layerSet
		backgroundLayerSet = backgroundsLayers[backgroundsLayers.length - 1];

		// move it to the very bottom
		backgroundLayerSet.move( docRef.layerSets[docRef.layerSets.length - 1], ElementPlacement.PLACEAFTER );

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
};
