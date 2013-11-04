
function trimmer(docRef){

    // Get the number of layers in the document
    var layersNumber = docRef.layers.length;

    // Merge layers if there are more than 1 layer
    if (layersNumber > 1) {

        // Select All Layers
        var desc1 = new ActionDescriptor();
        var ref1 = new ActionReference();
        ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
        desc1.putReference(cTID('null'), ref1);
        executeAction(sTID('selectAllLayers'), desc1, DialogModes.NO);

        // Merge Layers
        executeAction(sTID('mergeLayersNew'), undefined, DialogModes.NO);

    }

    // Trim document
    docRef.trim(TrimType.TRANSPARENT);

}

