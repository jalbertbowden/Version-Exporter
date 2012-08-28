/**
 * ------------------------------------------------------------
 * Copyright (c) 2011 Artem Matevosyan
 * ------------------------------------------------------------
 *
 * @version $Revision: 212 $:
 * @author  $Author: mart $:
 * @date    $Date: 2012-05-16 16:48:36 +0200 (Mi, 16 Mai 2012) $:
 */


//=============================================================================
// Globals
//=============================================================================


// Constants
var SMARTSETCOLOR                       = "violet";
var DISABLEDSETCOLOR                    = "gray";
var ACTIONLAYERCOLOR                    = "blue";
var BACKGROUNDLAYERSETNAME              = "Background";
var SCRIPT_REGISTRY_ID                  = "yasoNEijdaP74gRLAeNpUiTr6m"
var INSTRUCTIONS_SPLIT_TOKEN            = "### VERSION EXPORTER DATA ###";
var HOME                                = "~/Pro Actions";

// logging
var LOG_FILE                            = HOME + '/Version Exporter/Logs/{document}_%Y-%m-%d_%H-%M-%S.log' // {document}, {loglevel}, +strftime
var LOG_APPEND                          = false;
var LOG_LEVEL                           = 3; // 3 Notice, 2 Warning, 1 Critical error, 0 Disable lgging

// Gloabal Variables
var origDocRef                          = null;
var origDocName                         = null;
var dupRef                              = null;
var backgroundLayerSet                  = null;
var exportInfo                          = null;
var documentConfig                      = null;
var dlgMain                             = null;

// the drop down list indexes for file type
var bmpIndex                            = 0;
var jpegIndex                           = 1;
var pdfIndex                            = 2;
var psdIndex                            = 3;
var targaIndex                          = 4;
var tiffIndex                           = 5;
var pngIndex                            = 6;

var fileTypes                           = [ 'JPG', 'PNG', 'PSD', 'TIFF' ];

var strLabelLayerSets  			        = "Use Layer Sets as versions";
var strLabelComps			            = "Use Comps as versions";
var operationModes						= [ strLabelLayerSets, strLabelComps ];

var strLabelWrapper						= "Wrapper";
var strLabelWrapperMode					= "Wrapper Mode";
var strLabelDisableWrap					= "Disabled";
var strLabelSafariWrap					= "Safari Wrap";
var strLabelFirefoxWrap					= "Firefox Wrap";
var wrapperModes						= [ strLabelDisableWrap, strLabelSafariWrap, strLabelFirefoxWrap ];

// the drop down list indexes for tiff compression
var compNoneIndex                       = 0;
var compLZWIndex                        = 1;
var compZIPIndex                        = 2;
var compJPEGIndex                       = 3;

// ok and cancel button
var runButtonID                         = 1;
var cancelButtonID                      = 2;

// UI strings to be localized
var strTitle                            = "Versions Exporter"
var strButtonRun                        = "Run"
var strButtonCancel                     = "Cancel"
var strButtonHelp                       = "Documentation"
var strButtonCreateConfig				= "Create Project Configuration"
var strButtonEditConfig					= "Edit Project Configuration"
var strHelpText                         = "Please specify the format and location for saving each layer as a file."
var strLabelDestination                 = "Destination:"
var strButtonBrowse                     = "&Browse..."
var strLabelFileNamePrefix              = "Filename Prefix:"
var strCheckboxVisibleOnly              = "&Visible Layers Only"
var strLabelFileType                    = "File Type:"
var strCheckboxIncludeICCProfile        = "&Include ICC Profile"
var strJPEGOptions                      = "JPEG Options:"
var strLabelQuality                     = "Quality:"
var strPSDOptions                       = "PSD Options:"
var strCheckboxMaximizeCompatibility    = "&Maximize Compatibility"
var strTIFFOptions                      = "TIFF Options:"
var strLabelImageCompression            = "Image Compression:"
var strNone                             = "None"
var strPDFOptions                       = "PDF Options:"
var strLabelEncoding                    = "Encoding:"
var strTargaOptions                     = "Targa Options:"
var strLabelDepth                       = "Depth:"
var strRadiobutton16bit                 = "16bit"
var strRadiobutton24bit                 = "24bit"
var strRadiobutton32bit                 = "32bit"
var strBMPOptions                       = "BMP Options:"
var strAlertSpecifyDestination          = "Please specify destination."
var strAlertDestinationNotExist         = "Destination does not exist."
var strTitleSelectDestination           = "Select Destination"
var strAlertDocumentMustBeOpened        = "You must have a document open to export!"
var strAlertNeedMultipleLayers          = "You need a document with multiple layers to export!"
var strAlertWasSuccessful               = " was successful."
var strUnexpectedError                  = "Unexpected error"
var strMessage                          = "Version Exporter Settings"
var stretQuality                        = localize( "$$$/locale_specific/JavaScripts/ExportLayersToFiles/ETQualityLength=30" );
var stretDestination                    = localize( "$$$/locale_specific/JavaScripts/ExportLayersToFiles/ETDestinationLength=160" );
var strddFileType                       = localize( "$$$/locale_specific/JavaScripts/ExportLayersToFiles/DDFileType=100" );
var strpnlOptions                       = localize( "$$$/locale_specific/JavaScripts/ExportLayersToFiles/PNLOptions=100" );
var strPNG8Options                      = "PNG-8 Options:"
var strCheckboxPNGTransparency          = "Transparency"
var strCheckboxPNGInterlaced            = "Interlaced"
var strCheckboxPNGTrm                   = "Trim Layers"
var strPNGOptions                       = "PNG Options:"

var strLabelMode  			            = "Operation Mode";
var strLabelExportSelected              = "Export Selected";
var strLabelTrim                        = "Trim Transparency";
var strCheckboxSafariWrap               = "Make Safari Screenshot";
var strEnable                           = "Enable";
var strSafariWrap                       = "Safari Wrap";
var strWindowTitle                      = "Window Title";
var strWindowURL                        = "URL";
var strBackgroundColor                  = "Background Color";
var strExportSettings                   = "Export Settings";
var strFileType                         = "File Type";
var strIncludeICCProfile                = "Include ICC Profile"
//var strCheckboxSafariWrapDisabled     = "Make Safari Screenshot (Action not found)";
var strCheckboxSafariWrap_makeSure      = "Please make sure the Safari Wrap has everything it needs before we proceed"
var strAlertSafariWrapNotFound          = "Safari Wrap folder was not fond in the destination folder. Please turn off \"Make Safari Screenshot\" option."
//var strCheckboxFastAndSimple          = "strCheckboxFastAndSimple"
//var strCheckboxInterlaced             = "strCheckboxFastAndSimple"
