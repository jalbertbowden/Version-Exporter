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
		Log.notice('Current comp: ' + currentComp);

		// Override version format
		overrideFormat = null;

		// Skipping if the name starts with ~
		if ( String(currentComp.name).startsWith('~') ) {
			Log.notice('Skipping comp without number increase');
			continue;
		}

		// Skip the comp, but count it
		if ( String(currentComp.name).startsWith('#') ) {
			Log.notice('Skipping comp and increasing the number');
			versionNumber++;
			continue;
		}

		// Selected only
		if (exportInfo.exportSelected && !currentComp.selected) {
			Log.notice('Skipping comp as it is not selected');
			versionNumber++;
			continue;
		}

		// Apply each comp
		currentComp.apply();
		Log.notice('Comp applied');

		// Process commands
		if (currentComp.comment) {
			var comment = String(currentComp.comment);
			var lines = comment.split(/\r|\n/);
			for (var j=0; j<lines.length; j++) {
				var line = lines[j];
				line.startsWith('@') ? processCommand(line) : '';
			}
		}

		Log.notice('Exporting the version');

		// Export version
		export_version(currentComp.name);

		// Revert is needed after actions, trimming and stuff
		app.activeDocument = docRef; // fix for CS5
		Stdlib.revertToLastSnapshot(docRef);

	}

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();


	function processCommand(command) {

		Log.notice('Command found: ' + command);

		command = String(command).substring(1); // cut off first "@" symbol
		var action = command.split(/\s+/).shift();
		var params = command.substring(action.length).trim();

		switch (action) {

			// Faltten Image
			case "flatten":
				Log.notice('Action recognized: ' + action);
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

				if (width == 0) width = getUnitValue(docRef.width);
				if (height == 0) width = getUnitValue(docRef.height);

				Stdlib.resizeImage(docRef, width, height);

				break;

			// Crop
			case "crop":

				Log.notice('Action recognized: ' + action);

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
				Log.notice('Adding a layer');
				docRef.artLayers.add();

				// Merge visible
				Log.notice('Merging visible');
				Stdlib.mergeVisible(docRef);

				// Delete hidden layers to make crop work faster
				Log.notice('Deleting all hidden layers');
				try {
					Stdlib.deleteAllHiddenLayers(docRef);
				} catch (e){
					Log.warning('Could not delete hidden layers before cropping as there are still locked ones among them. Credits for this go to Adobe.')
				}

				// crop
				Log.notice('Cropping with the bounds: ' + bounds);
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

