/**
 * ------------------------------------------------------------
 * Copyright (c) 2012 Artem Matevosyan
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
function processComps() {

	// Work with duplicate
	docRef = origDocRef.duplicate();

	// Get the list of the comps
	var comps = docRef.layerComps;
	var compsNumber = comps.length;

	// Check if there are comps to export
	if (!compsNumber) {
		docRef.close(SaveOptions.DONOTSAVECHANGES);
		Log.warning('No Comps found');
		main_finish('No Comps found');
		return;
	}

	// Save initial state
	Stdlib.takeSnapshot(docRef);

	// Cycle through the comps
	for (var i = 0; i < compsNumber; i++ ){

		var currentComp = comps[i];

		// Skipping if the name starts with ~ or #
		if ( String(currentComp.name).startsWith('#') || String(currentComp.name).startsWith('~') ) continue;

		// Selected only
		if (exportInfo.exportSelected && !currentComp.selected) {
			versionNumber++;
			continue;
		}

		// Apply each comp
		currentComp.apply();

		// Process commands
		if (currentComp.comment) {
			var comment = String(currentComp.comment);
			var lines = comment.split(/\r|\n/);
			for (var j=0; j<lines.length; j++) {
				var line = lines[j];
				line.startsWith('@') ? processCommand(line) : '';
			}
		}

		// Export version
		export_version(currentComp.name);

		// Revert is needed after actions, trimming and stuff
		app.activeDocument = docRef; // fix for CS5
		Stdlib.revertToLastSnapshot(docRef);

	}

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();


	function processCommand(command) {

		command = String(command).substring(1); // cut off first "@" symbol
		var action = command.split(/\s+/).shift();
		var params = command.substring(action.length).trim();

		switch (action) {

			// Faltten Image
			case "flatten":
				docRef.flatten();
				break;

			// Faltten Image
			case "mergeVisible":
				Stdlib.mergeVisible(docRef);
				break;

			// Crop
			case "crop":

				// crop by layer
				if (params.startsWith('area')) {

					// Get the target layer bounds
					params = params.replace(/^area\s+/, '').trim();
					var cropLayer = getLayerByPath(docRef, params); // might also be a LayerSet
					if (cropLayer == undefined) break;
					// getLayerBounds makes layer active and therefore visible, so we backup the visible state
					var visibleState = cropLayer.visible;
					// Get layer bounds
					var bounds = Stdlib.getLayerBounds(docRef, cropLayer);
					// Restore visible state
					cropLayer.visible = visibleState;

				// Crop by bounds
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

				// crop
				Stdlib.cropBounds(docRef, bounds);
				break;

			// Unrecognized
			default:
				Log.warning('Action was not recognized: ' + command);
				break;
		}
	}


}

