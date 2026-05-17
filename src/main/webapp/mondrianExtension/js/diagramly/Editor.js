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

})();