﻿/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 202 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-08 00:49:08 +0200 (Tue, 08 May 2012) $:
 */

//=============================================================================
// Exporting
//=============================================================================

var versionNumber = 0;


///////////////////////////////////////////////////////////////////////////////
// Function:    export_version
// Usage: hide all the panels in the common actions
// Input: <none>, dlgMain is a global for this script
// Return: <none>, all panels are now hidden
///////////////////////////////////////////////////////////////////////////////
function export_version( versionName ){

	// Determine the filename
	var fileNameBody = "";
	if (exportInfo.fileNamePrefix) fileNameBody += exportInfo.fileNamePrefix;
	if (versionName) fileNameBody += "_" + zeroSuppress(versionNumber, 4) + "_" + String(versionName).trim();

	// No prefix and no versionName, user the original document title without extension
	if (!fileNameBody) fileNameBody = docName.replace(/\.[^\.]+$/, "");

	fileNameBody = fileNameBody.replace(/[:\/\\*\?\"\<\>\|]/g, "_");  // '/\:*?"<>|' -> '_'
	fileNameBody = fileNameBody.replace(/_+/g, "_");  // '____' -> '_'
	fileNameBody = fileNameBody.replace(/\-+/g, "-");  // '---' -> '-'
	fileNameBody = fileNameBody.substring(0,120);

	// Save the file
	var savedFile = saveFile(fileNameBody);

	if (exportInfo.Wrapper.mode) {
		try {
			Log.notice( 'Try to use Safari Wrap on file: ' + Url.getAbsolute(savedFile) );
			// Reopen saved file
			var wrapDocument = app.open(savedFile);
			// Execute the action
			Wrapper(wrapDocument);
			// Flatten only if this is JPG, otherweise it will ask for path to save
			var ext = savedFile.strf('%e').toUpperCase();
			if (ext == 'JPG') wrapDocument.flatten();
			// Close with saving changes
			wrapDocument.close(SaveOptions.SAVECHANGES);
		} catch(e){
			Log.error('Something went wrong with Safari Wrap, turning it off for this export sessions', e);
			exportInfo.Wrapper.mode = 0;
		}
	}

	// Increase version number
	versionNumber++;
}



///////////////////////////////////////////////////////////////////////////////
// Function: saveFile
// Usage: the worker routine, take our params and save the file accordingly
// Input: reference to the document, the name of the output file,
//        export info object containing more information
// Return: <none>, a file on disk
//
// Copyright 2007.  Adobe Systems, Incorporated.  All rights reserved.
// Written by Naoki Hada
// ZStrings and auto layout by Tom Ruark
///////////////////////////////////////////////////////////////////////////////
function saveFile( fileNameBody ) {

	var saveFile;

	var selectedFileType = fileTypes[exportInfo.fileType];
	switch (selectedFileType) {
		case 'JPG':
			docRef.bitsPerChannel = BitsPerChannelType.EIGHT;
			saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".jpg");
			jpgSaveOptions = new JPEGSaveOptions();
			jpgSaveOptions.embedColorProfile = exportInfo.icc;
			//jpgSaveOptions.quality = exportInfo.jpegQuality;
			jpgSaveOptions.quality = 12;
			docRef.saveAs(saveFile, jpgSaveOptions, true, Extension.LOWERCASE);
			break;
		case 'PSD':
			saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".psd");
			psdSaveOptions = new PhotoshopSaveOptions();
			psdSaveOptions.embedColorProfile = exportInfo.icc;
			//psdSaveOptions.maximizeCompatibility = exportInfo.psdMaxComp;
			psdSaveOptions.maximizeCompatibility = true;
			docRef.saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);
			break;
		case 'TIFF':
			saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".tif");
			tiffSaveOptions = new TiffSaveOptions();
			tiffSaveOptions.embedColorProfile = exportInfo.icc;
			tiffSaveOptions.imageCompression = TIFFEncoding.TIFFZIP;
			// tiffSaveOptions.imageCompression = TIFFEncoding.NONE;
			tiffSaveOptions.transparency = true;
			tiffSaveOptions.layers = false;
			if (TIFFEncoding.JPEG == exportInfo.tiffCompression) {
				tiffSaveOptions.jpegQuality = exportInfo.tiffJpegQuality;
			}
			docRef.saveAs(saveFile, tiffSaveOptions, true, Extension.LOWERCASE);
			break;
		case 'PNG':
			saveFile = new File(exportInfo.destination + "/" + fileNameBody + ".png");
			pngSaveOptions = new PNGSaveOptions();
			pngSaveOptions.interlaced = false;
			pngSaveOptions.matte = MatteType.NONE;
			pngSaveOptions.PNG8 = false; //24 bit PNG
			pngSaveOptions.transparency = true;
			docRef.saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);
			break;
		default:
			if ( DialogModes.NO != app.playbackDisplayDialogs ) {
				alert(strUnexpectedError);
			}
			break;
	}

	return saveFile;

}


///////////////////////////////////////////////////////////////////////////////
// Function: zeroSuppress
// Usage: return a string padded to digit(s)
// Input: num to convert, digit count needed
// Return: string padded to digit length
///////////////////////////////////////////////////////////////////////////////
function zeroSuppress (num, digit) {
	var tmp = num.toString();
	while (tmp.length < digit) {
		tmp = "0" + tmp;
	}
	return tmp;
}
