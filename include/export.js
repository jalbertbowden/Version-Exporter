/**
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

	versionName = String(versionName).trim();
	filenameTemplate = exportInfo.filenameTemplate;
	var filename = processFilenameTemplate(filenameTemplate, versionName);

	// Save the file
	var savedFile = saveFile(filename);

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
// Function: processFilenameTemplate
// Usage: replaces the variables in the filename template
// Input: template with {variables}
// Return: ready to use filename
///////////////////////////////////////////////////////////////////////////////
function processFilenameTemplate(filenameTemplate, versionName){

	// Determine the filename
	var filename = filenameTemplate;

	// Document Name
	var documentName = docName.indexOf(".") > 0 ? docName.substring(0, docName.indexOf(".")) : docName;
	filename = filename.replace("{document}", documentName);

	// Version Name
	filename = filename.replace("{name}", versionName);

	// Replacing the numbers
	while ( match = /\{(#+)\}/g.exec(filename) ) {
		var digits = match[1].split('').length;
		var number = zeroSuppress(versionNumber, digits);
		filename = filename.replace('{'+match[1]+'}', number)
	}

	// No prefix and no versionName, user the original document title without extension
	if (!filename) filename = docName.replace(/\.[^\.]+$/, "");

	filename = filename.replace(/[:\/\\*\?\"\<\>\|]/g, "_");  // '/\:*?"<>|' -> '_'
	filename = filename.replace(/_+/g, "_");  // '____' -> '_'
	filename = filename.replace(/\-+/g, "-");  // '---' -> '-'
	filename = filename.substring(0,120);

	return filename;
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
