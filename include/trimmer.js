
function trimmer(docRef){

    // Select All Layers
    var desc1 = new ActionDescriptor();
    var ref1 = new ActionReference();
    ref1.putEnumerated(cTID('Lyr '), cTID('Ordn'), cTID('Trgt'));
    desc1.putReference(cTID('null'), ref1);
    executeAction(sTID('selectAllLayers'), desc1, DialogModes.NO);

    // Merge Layers
    executeAction(sTID('mergeLayersNew'), undefined, DialogModes.NO);

    // Trim document
    docRef.trim(TrimType.TRANSPARENT);

}

