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
// Div
//=============================================================================


function is_array(input){
	return typeof(input)=='object'&&(input instanceof Array);
}

function isGiven(v) {
	return v!=undefined && v!=null && String(v).length>0;
}

function convertToString(s) {
	return String(s);
}

function MergeObjectsRecursive(obj1, obj2) {
	//alert("Received:\n\n" +obj1+"\n\n"+ obj2);
	for (var p in obj2) {
		try {
			// Property in destination object set. Update its value.
			if ( obj2[p].constructor == Object || obj2[p].constructor == Array ) {
				obj1[p] = MergeObjectsRecursive(obj1[p], obj2[p]);
			} else {
				obj1[p] = obj2[p];
			}
		} catch(e) {
			//Log.error("Error", e);
			// Property in destination object not set; create it and set its value.
			obj1[p] = obj2[p];
		}
	}
	//alert("Return:\n\n" +obj1+"\n\n"+ obj2);
	// I could'nt figure out this bug. For some reason it returns 'undefined' if obj2 has a property
	// Obejct{} (empty object) and obj1 doesn't have this property at all. Or similar situation. This helps for some reason...
	if (obj1.toSource) obj1.toSource();
	return obj1;
}


///////////////////////////////////////////////////////////////////////////////
// Function: getLayerByPath
// Usage:
// Input: container Document object, Path string, e.g. "Layerset name / Set name/Layer"
// Return: artLayer object
///////////////////////////////////////////////////////////////////////////////
function getLayerByPath( doc, path ){
	var target = doc;
	var layerPath = String(path).split(/\/|\\/);
	for ( var i = 0; i < layerPath.length; i++ ) {
		var pathSegment = layerPath[i].trim();
		try {
			target = target.layerSets.getByName(pathSegment);
		} catch(e){
			// Layerset was not found, look for a layer
			try {
				target = target.artLayers.getByName(pathSegment);
				break;
			} catch (e) {
				Log.warning('Layer or layer set reference was not found by path:' + path);
				return undefined;
			}
		}
	}
	return target;
}


///////////////////////////////////////////////////////////////////////////////
// Function: escapeString
// Usage: replaces '\' with '\\' and '"' with '\"'. Used in ui.js
// Input: any object, prefered a string
// Return: escaped string
///////////////////////////////////////////////////////////////////////////////
function escapeString(str){
	var str = new String(str);
	return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}


var Url = {
	getAbsolute: function( basePath, targetPath ){

		if ( !basePath ) throw(new Error('Url.getAbsolute: Invalid input'));
		basePath = new String(basePath);

		if (!targetPath) targetPath = '';
		targetPath = new String(targetPath);

		basePath = basePath.replace(/^\//, '/');
		targetPath = targetPath.replace(/^\//, '/');

		// c:/path and ~/path are already absolute
		var isAbsolute = (/^(~|\/|[a-z]:)/i.test(targetPath)) ? true : false;
		basePath = isAbsolute ? targetPath : basePath + '/' + targetPath;

		return Folder(basePath).fullName;
	},
}






