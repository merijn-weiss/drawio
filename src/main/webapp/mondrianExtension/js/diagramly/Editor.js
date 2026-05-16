// mondrianExtension/js/diagramly/Editor.js
(function ()
{
    if (typeof Editor === 'undefined' || typeof Graph === 'undefined')
    {
        console.warn('Mondrian extension: Editor or Graph not found');
        return;
    }

    // Prevent double application
    if (Editor.prototype.__mondrianExtended)
    {
        return;
    }
    Editor.prototype.__mondrianExtended = true;

    // -------------------------
    // Editor overrides
    // -------------------------
    Editor.prototype.appName = 'Mondrian Diagrams';

    // -------------------------
    // Graph extensions
    // -------------------------
    Graph.prototype.setMondrianHighlightPredefinedEnabled = function (value, fireEvent)
    {
        if (mxClient.IS_SVG && !mxClient.IS_SF)
        {
            this.mondrianHighlightPredefinedEnabled = value;

            fireEvent = (fireEvent != null) ? fireEvent : true;

            if (fireEvent)
            {
                this.fireEvent(new mxEventObject('mondrianHighlightPredefinedChanged'));
            }
        }
    };

    Graph.prototype.refreshMondrianDiagram = function ()
    {
        if (mxClient.IS_SVG && !mxClient.IS_SF)
        {
            this.fireEvent(new mxEventObject('mondrianHighlightPredefinedChanged'));
        }
    };

})();