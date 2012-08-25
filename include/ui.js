/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 211 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-11 10:21:38 +0200 (Fr, 11 Mai 2012) $:
 */


//=============================================================================
// User Interface
//=============================================================================


///////////////////////////////////////////////////////////////////////////////
// Function: ui_settingsDialog
// Usage: pop the ui and get user settings
// Input: exportInfo object containing our parameters
// Return: on ok, the dialog info is set to the exportInfo object
///////////////////////////////////////////////////////////////////////////////
function ui_settingsDialog(exportInfo) {

	// Configure the dialog
	var res = String(" \
		dialog { \
			text: '"+strTitle+"', \
			orientation: 'column', \
			alignChildren: 'left', \
			grpDestination: Group { \
				label: StaticText { text: '"+ escapeString(strLabelDestination) +"', preferredSize: [ 140, 15 ] }, \
				field: EditText { text: '"+ escapeString(exportInfo.destination) +"', preferredSize: [ 300, 20 ] }, \
				btnBrowse: Button { text: '"+ escapeString(strButtonBrowse) +"', preferredSize: [ 80, 20 ] } \
			}, \
			grpFilenamePrefix: Group { \
				label: StaticText { text: '"+ strLabelFileNamePrefix +"', preferredSize: [ 140, 15 ] }, \
				field: EditText { text: '"+ escapeString(exportInfo.fileNamePrefix) +"', preferredSize: [ 390, 20 ] }, \
			}, \
			grpOperationMode: Group { \
				label: StaticText { text: '"+ strLabelMode +"', preferredSize: [ 140, 15 ] }, \
				field:  DropDownList { preferredSize: [ 390, 25 ] }, \
			}, \
			grpOptions: Group { \
				label: StaticText { text: '', preferredSize: [ 140, 15 ] }, \
				fieldExportSelected: Checkbox { text: '"+ strLabelExportSelected +"', value: "+ exportInfo.exportSelected +" }, \
				fieldTrim: Checkbox { text: '"+ strLabelTrim +"', value: "+ exportInfo.trim +" }, \
			}, \
			pnlSafariWrap: Panel { \
				text: '"+ escapeString(strSafariWrap) +"', \
				alignment: 'fill', \
				alignChildren: 'left', \
				grpEnable: Group { \
					label: StaticText { text: '"+ escapeString(strEnable) +"', preferredSize: [ 120, 15 ] }, \
					field: Checkbox { text: '', value: "+ exportInfo.safariWrap +" }, \
				}, \
				grpWindowTitle: Group { \
					label: StaticText { text: '"+ escapeString(strWindowTitle) +"', preferredSize: [ 120, 15 ] }, \
					field: EditText { text: '"+ escapeString(exportInfo.safariWrap_windowTitle) +"', preferredSize: [ 370, 20 ] }, \
				}, \
				grpWindowURL: Group { \
					label: StaticText { text: '"+ escapeString(strWindowURL) +"', preferredSize: [ 120, 15 ] }, \
					field: EditText { text: '"+ escapeString(exportInfo.safariWrap_windowURL) +"', preferredSize: [ 370, 20 ] }, \
				}, \
				grpBackgroundColor: Group { \
					label: StaticText { text: '"+ escapeString(strBackgroundColor) +"', preferredSize: [ 120, 15 ] }, \
					field: EditText { text: '"+ escapeString(exportInfo.safariWrap_backgroundColor) +"', preferredSize: [ 370, 20 ] }, \
				}, \
			}, \
			pnlExportSettings: Panel { \
				text: '"+ escapeString(strExportSettings) +"', \
				alignment: 'fill', \
				alignChildren: 'left', \
				grpFileType: Group { \
					label: StaticText { text: '"+ escapeString(strFileType) +"', preferredSize: [ 120, 15 ] }, \
					field: DropDownList { preferredSize: [ 100, 20 ] }, \
				}, \
				grpIncludeICCProfile: Group { \
					label: StaticText { text: '"+ escapeString(strIncludeICCProfile) +"', preferredSize: [ 120, 15 ] }, \
					field: Checkbox { text: '', value: "+ exportInfo.icc +" }, \
				}, \
				grpOptions: Group { \
					orientation: 'stack', \
					grpJPGOptions: Group { \
						visible: false, \
					}, \
					grpPNGOptions: Group { \
						visible: false, \
					}, \
					grpPSDOptions: Group { \
						visible: false, \
					}, \
					grpTIFFOptions: Group { \
						visible: false, \
					}, \
				}, \
			}, \
			grpButtons: Group { \
				orientation: 'stack', \
				alignment: 'fill', \
				btnHelp: Button { text: '"+ escapeString(strButtonHelp) +"',  alignment: 'left' }, \
				grpRight: Group { \
					alignment: 'right', \
					btnRun: Button { text: '"+ escapeString(strButtonRun) +"', alignment: 'right', properties: { name:'ok' } }, \
					btnCancel: Button { text: '"+ escapeString(strButtonCancel) +"', alignment: 'right', properties: { name:'cancel' } }, \
				}, \
			}, \
		} \
	").replace(/^\s+/, '');

	dlgMain = new Window(res);

	// Adding operation modes
	var operationModeDropdown = dlgMain.grpOperationMode.field;
	for (var i = 0; i < operationModes.length; i++ ) {
		var item = operationModeDropdown.add( "item", operationModes[i] );
		if ( exportInfo.operationMode == i ) item.selected = true;
	}

	// File types selector
	var selectedIndex;
	var selectedFileType;
	var FileTypeDropDown = dlgMain.pnlExportSettings.grpFileType.field;
	for (var i = 0; i < fileTypes.length; i++ ) {
		var item = FileTypeDropDown.add( "item", fileTypes[i] );
		if ( exportInfo.fileType == i ) item.selected = true;
	}
	FileTypeDropDown.onChange = onFileTypeChange;
	onFileTypeChange();

	// Buttuns Events
	dlgMain.grpDestination.btnBrowse.onClick        = onBrowseButtonPress;
	dlgMain.grpButtons.grpRight.btnRun.onClick      = onRunButtonPress;
	dlgMain.grpButtons.grpRight.btnCancel.onClick   = onCancelButtonPress;
	dlgMain.grpButtons.btnHelp.onClick              = onHelpButtonPress;

	// Open Window
	app.bringToFront();

	dlgMain.center();

	var result = dlgMain.show();
	if (cancelButtonID == result) {
		return result;
	}

	Log.notice("Sending positive response from the dialog");

	// Get settings from dialog
	exportInfo.destination                  = dlgMain.grpDestination.field.text;
	exportInfo.fileNamePrefix               = dlgMain.grpFilenamePrefix.field.text;
	exportInfo.operationMode                = dlgMain.grpOperationMode.field.selection.index;
	exportInfo.exportSelected               = dlgMain.grpOptions.fieldExportSelected.value;
	exportInfo.trim                         = dlgMain.grpOptions.fieldTrim.value;

	exportInfo.safariWrap                   = dlgMain.pnlSafariWrap.grpEnable.field.value;
	exportInfo.safariWrap_windowTitle       = dlgMain.pnlSafariWrap.grpWindowTitle.field.text;
	exportInfo.safariWrap_windowURL         = dlgMain.pnlSafariWrap.grpWindowURL.field.text;
	exportInfo.safariWrap_backgroundColor   = dlgMain.pnlSafariWrap.grpBackgroundColor.field.text;

	exportInfo.fileType                     = dlgMain.pnlExportSettings.grpFileType.field.selection.index;
	exportInfo.icc                          = dlgMain.pnlExportSettings.grpIncludeICCProfile.field.value;

	return result;

}


///////////////////////////////////////////////////////////////////////////////
// Function: onFileTypeChange
// Usage: run on change the file type field
// Input: void
// Return: void
///////////////////////////////////////////////////////////////////////////////
function onFileTypeChange (){

	// Hide all additional options
	dlgMain.pnlExportSettings.grpOptions.grpJPGOptions.hide();
	dlgMain.pnlExportSettings.grpOptions.grpPNGOptions.hide();
	dlgMain.pnlExportSettings.grpOptions.grpPSDOptions.hide();
	dlgMain.pnlExportSettings.grpOptions.grpTIFFOptions.hide();

	// Show selected
	var selectedIndex = dlgMain.pnlExportSettings.grpFileType.field.selection.index;
	var selectedFileType = fileTypes[selectedIndex];
	switch (selectedFileType) {
		case "JPG": 	dlgMain.pnlExportSettings.grpOptions.grpJPGOptions.show(); 		break;
		case "PNG": 	dlgMain.pnlExportSettings.grpOptions.grpPNGOptions.show(); 		break;
		case "PSD": 	dlgMain.pnlExportSettings.grpOptions.grpPSDOptions.show(); 		break;
		case "TIFF":	dlgMain.pnlExportSettings.grpOptions.grpTIFFOptions.show(); 	break;
	}

}


///////////////////////////////////////////////////////////////////////////////
// Function: onRunButtonPress
// Usage: run on run button press
// Input: void
// Return: void
///////////////////////////////////////////////////////////////////////////////
function onRunButtonPress() {

	// Destination Specified?
	var destination = dlgMain.grpDesination.field.text;
	if (destination.length == 0) {
		alert(strAlertSpecifyDestination);
		return;
	}

	// Destination exists?
	var testFolder = new Folder(destination);
	if (!testFolder.exists) {
		alert(strAlertDestinationNotExist);
		return;
	}

	// Everything is ok, GO GO GO!
	dlgMain.close(runButtonID);
}


///////////////////////////////////////////////////////////////////////////////
// Function: onRunButtonCancelButtonPressonPress
// Usage: run on cancel button press
// Input: void
// Return: void
///////////////////////////////////////////////////////////////////////////////
function  onCancelButtonPress(){
	dlgMain.close(cancelButtonID);
}


///////////////////////////////////////////////////////////////////////////////
// Function: onHelpButtonPress
// Usage: open help
// Input: void
// Return: void
///////////////////////////////////////////////////////////////////////////////
function onHelpButtonPress(){
	alert('Help is coming soon...')
}


///////////////////////////////////////////////////////////////////////////////
// Function: onBrowseButtonPress
// Usage: open help
// Input: void
// Return: void
///////////////////////////////////////////////////////////////////////////////
function onBrowseButtonPress(){
	var defaultFolder = dlgMain.grpDestination.field.text;
	var testFolder = new Folder(defaultFolder);
	if (!testFolder.exists) {
		defaultFolder = "~";
	}
	var selFolder = Folder.selectDialog(strTitleSelectDestination, defaultFolder);
	if ( selFolder != null ) {
		dlgMain.grpDestination.field.text = selFolder.fsName;
	}
	dlgMain.defaultElement.active = true;
}
