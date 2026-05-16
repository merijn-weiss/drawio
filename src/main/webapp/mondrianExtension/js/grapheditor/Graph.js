(function () {
    if (typeof Graph === 'undefined') {
        console.warn('Mondrian: Graph not available');
        return;
    }

    // Prevent double patching
    if (Graph.prototype.__mondrianBuiltinsExtended) {
        return;
    }
    Graph.prototype.__mondrianBuiltinsExtended = true;

    const extraProps = [
        'mondrianVersion',
        'repoAttributes',
        'templateAttributes',
        'templateAttributesMandatory'
    ];

    // Ensure array exists
    Graph.prototype.builtInProperties = Graph.prototype.builtInProperties || [];

    // Merge without duplicates
    extraProps.forEach(prop => {
        if (Graph.prototype.builtInProperties.indexOf(prop) === -1) {
            Graph.prototype.builtInProperties.push(prop);
        }
    });

})();