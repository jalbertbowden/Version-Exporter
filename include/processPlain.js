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
// Function:	processPlain
// Usage:		main routine of the processing
// Input:		none
// Return:		none
///////////////////////////////////////////////////////////////////////////////
function processPlain() {

	// Work with duplicate
	docRef = origDocRef.duplicate();

	// Export version
	export_version("");

	docRef.close(SaveOptions.DONOTSAVECHANGES);

	main_finish();

}

