(function () {

    if (typeof Graph === 'undefined') {

        console.warn(
            'Mondrian: Graph not available'
        );

        return;
    }

    //
    // Prevent double patching
    //

    if (Graph.prototype.__mondrianBuiltinsExtended) {
        return;
    }

    Graph.prototype.__mondrianBuiltinsExtended = true;

    //
    // Extend built-in properties
    //

    const extraProps = [
        'mondrianVersion',
        'repoAttributes',
        'templateAttributes',
        'templateAttributesMandatory'
    ];

    if (!Array.isArray(
        Graph.prototype.builtInProperties
    )) {

        Graph.prototype.builtInProperties = [];
    }

    extraProps.forEach((prop) => {

        if (
            Graph.prototype.builtInProperties
                .indexOf(prop) === -1
        ) {

            Graph.prototype.builtInProperties
                .push(prop);
        }
    });

    //
    // Graph extensions
    //

    Graph.prototype
        .setMondrianHighlightPredefinedEnabled =
        function (value, fireEvent)
        {
            if (mxClient.IS_SVG && !mxClient.IS_SF)
            {
                this.mondrianHighlightPredefinedEnabled =
                    value;

                fireEvent =
                    (fireEvent != null)
                        ? fireEvent
                        : true;

                if (fireEvent)
                {
                    this.fireEvent(
                        new mxEventObject(
                            'mondrianHighlightPredefinedChanged'
                        )
                    );
                }
            }
        };

    Graph.prototype
        .refreshMondrianDiagram =
        function ()
        {
            if (mxClient.IS_SVG && !mxClient.IS_SF)
            {
                this.fireEvent(
                    new mxEventObject(
                        'mondrianHighlightPredefinedChanged'
                    )
                );
            }
        };

})();