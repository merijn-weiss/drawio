(function ()
{
    if (typeof DiagramFormatPanel === 'undefined') return;

    if (DiagramFormatPanel.prototype.__mondrianExtended) return;
    DiagramFormatPanel.prototype.__mondrianExtended = true;

    // =========================================================================
    // Mondrian SVG Toolbar/Icon Image
    // =========================================================================

    Format.mondrianEdgeImage = Graph.createSvgImage(
        20,
        20,

        // Scale original artwork into centered square area
        '<g transform="translate(1,1) scale(0.43,0.43)">' +

            // Background
            '<rect x="0" y="0" width="42" height="42" fill="#000000"/>' +

            // Top-left red block
            '<rect x="0" y="0" width="26" height="15" fill="#ff3131"/>' +

            // Top-right white block
            '<rect x="31" y="0" width="11" height="15" fill="#e8e8e8"/>' +

            // Bottom-left yellow block
            '<rect x="0" y="22" width="16" height="20" fill="#f3d132"/>' +

            // Center white block
            '<rect x="21" y="22" width="5" height="20" fill="#e8e8e8"/>' +

            // Bottom-right blue block
            '<rect x="31" y="22" width="11" height="20" fill="#3b82f6"/>' +

        '</g>',

        20,
        20
    );

    // =========================================================================
    // Mondrian Format Panel Extension
    // =========================================================================

    DiagramFormatPanel.prototype.addMondrianOptions = function (div)
    {
        var ui = this.editorUi;
        var graph = ui.editor.graph;

        div.appendChild(this.createTitle('Mondrian Options'));

        if (graph.isEnabled())
        {
            div.appendChild(this.createOption(
                'Highlight Predefined',

                function ()
                {
                    return graph.mondrianHighlightPredefinedEnabled;
                },

                function (checked)
                {
                    var change = new ChangePageSetup(ui);
                    change.mondrianHighlightPredefinedEnabled = checked;
                    graph.model.execute(change);
                }
            ));
        }

        return div;
    };

})();