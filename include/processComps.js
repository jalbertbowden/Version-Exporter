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

		// Selected only
		if (exportInfo.exportSelected && !currentComp.selected) {
			versionNumber++;
			continue;
		}

		// Apply each comp
		currentComp.apply();

		// Trim document
		try {
			if (exportInfo.trim) {
				trimmer(docRef);
			}
		} catch(e) {}

		// Export version
		export_version(currentComp.name);

		// Revert is needed after actions, trimming and stuff
		Stdlib.revertToLastSnapshot(docRef);

	}

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();
}

