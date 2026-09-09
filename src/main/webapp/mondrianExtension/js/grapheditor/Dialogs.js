(function () {
    if (window.MondrianDialogs != null) {
        return;
    }

    window.MondrianDialogs = {};

    // =========================================================================
    // Utilities
    // =========================================================================

    MondrianDialogs.isMondrianShape = function (graph, cell) {
        let shape = mxUtils.getValue(
            graph.getCurrentCellStyle(cell),
            'shape'
        );

        return (shape === 'mxgraph.mondrian.base');
    };

    MondrianDialogs.isMondrianConnector = function (graph, cell) {
        let shape = mxUtils.getValue(
            graph.getCurrentCellStyle(cell),
            'shape'
        );

        return (shape === 'mxgraph.mondrian.connector');
    };

    MondrianDialogs.isMondrianElement = function (graph, cell) {
        return (
            this.isMondrianShape(graph, cell) ||
            this.isMondrianConnector(graph, cell)
        );
    };

    MondrianDialogs.isDefaultAttribute = function (name) {
        return [
            'Element-ID',
            'Element-Name',
            'Icon-Name',
            'Tag-Text',
            'Interface-ID',
            'Interface-Name'
        ].indexOf(name) >= 0;
    };

    MondrianDialogs.isTextAreaField = function (name, value) {
        return (
            value != null &&
            value.indexOf('\n') >= 0
        );
    };

    MondrianDialogs.isEditable = function (ctx, item) {
        return !(
            ctx.meta[item.name] != null &&
            ctx.meta[item.name].editable == false
        );
    };

    MondrianDialogs.createOptGroup = function (optgroup) {
        var capitalised =
            optgroup.charAt(0).toUpperCase() +
            optgroup.substring(1);

        var group =
        {
            label: capitalised
        };

        group[this.settings.optgroupValueField] = optgroup;

        return group;
    };

    //TODO: Migrate to https://tom-select.js.org/
    MondrianDialogs.registerSelectize = function (selector, config) {
        var field = $(selector);

        if (field.length === 0) {
            return null;
        }

        if (field[0].selectize) {
            return field[0].selectize;
        }

        return field.selectize(config)[0].selectize;
    };

    // =========================================================================
    // Metadata Processing
    // =========================================================================

    MondrianDialogs.processMetaData = function (
        graph,
        cell,
        value,
        meta
    ) {
        if (meta == null) {
            meta = {};
        }

        if (!this.isMondrianElement(graph, cell)) {
            return meta;
        }

        // ---------------------------------------------------------------------
        // Repo attributes
        // ---------------------------------------------------------------------

        let repoAttributesItem =
            value.attributes.getNamedItem(
                'repoAttributes'
            );

        if (repoAttributesItem != null) {
            let repoAttributes =
                repoAttributesItem.value.split(',');

            for (let i = 0; i < repoAttributes.length; i++) {
                meta[repoAttributes[i]] =
                {
                    editable: false
                };
            }
        }

        // ---------------------------------------------------------------------
        // Mandatory template attributes
        // ---------------------------------------------------------------------

        let templateAttributesMandatoryItem =
            value.attributes.getNamedItem(
                'templateAttributesMandatory'
            );

        if (templateAttributesMandatoryItem != null) {
            let templateAttributes =
                templateAttributesMandatoryItem.value.split(',');

            for (let i = 0; i < templateAttributes.length; i++) {
                meta[templateAttributes[i]] =
                {
                    editable: false
                };
            }
        }

        return meta;
    };

    // =========================================================================
    // Attribute Visibility Filtering
    // =========================================================================

    MondrianDialogs.filterAttributes = function (
        graph,
        cell,
        temp
    ) {
        if (!this.isMondrianElement(graph, cell)) {
            return temp;
        }

        let hiddenAttributes =
            [
                'label',
                'repoAttributes',
                'mondrianVersion',
                'templateAttributes',
                'templateAttributesMandatory'
            ];

        return temp.filter(function (item) {
            return (
                hiddenAttributes.indexOf(item.name) < 0
            );
        });
    };

    // =========================================================================
    // Attribute Processing
    // =========================================================================

    MondrianDialogs.processAttributes = function (
        graph,
        cell,
        value,
        temp
    ) {
        let mondrianShape =
            this.isMondrianShape(graph, cell);

        let mondrianConnector =
            this.isMondrianConnector(graph, cell);

        if (!mondrianShape && !mondrianConnector) {
            return temp;
        }

        let mondrianAttributesDefault = [];
        let mondrianAttributesPredefined = [];
        let mondrianAttributesTemplate = [];
        let mondrianAttributesCustom = [];

        let attributesDefaultIndex =
            (mondrianShape) ?
                {
                    'Element-ID': 0,
                    'Element-Name': 1,
                    'Icon-Name': 2,
                    'Tag-Text': 3
                } :
                {
                    'Interface-ID': 0,
                    'Interface-Name': 1
                };

        // ---------------------------------------------------------------------
        // repoAttributes
        // ---------------------------------------------------------------------

        let repoAttributesItem =
            value.attributes.getNamedItem(
                'repoAttributes'
            );

        let repoAttributes = [];

        if (repoAttributesItem != null) {
            repoAttributes =
                repoAttributesItem.value.split(',');
        }

        // ---------------------------------------------------------------------
        // templateAttributes
        // ---------------------------------------------------------------------

        let templateAttributesItem =
            value.attributes.getNamedItem(
                'templateAttributes'
            );

        let templateAttributes = [];

        if (templateAttributesItem != null) {
            templateAttributes =
                templateAttributesItem.value.split(',');
        }

        // ---------------------------------------------------------------------
        // Split attributes into categories
        // ---------------------------------------------------------------------

        for (let i = 0; i < temp.length; i++) {
            if (
                attributesDefaultIndex[temp[i].name] != undefined
            ) {
                mondrianAttributesDefault[
                    attributesDefaultIndex[temp[i].name]
                ] = temp[i];
            }
            else if (
                repoAttributes.includes(temp[i].name)
            ) {
                if (
                    mondrianAttributesPredefined.length === 0
                ) {
                    mondrianAttributesPredefined.push(
                        {
                            header: 'Predefined'
                        });
                }

                mondrianAttributesPredefined.push(temp[i]);
            }
            else if (
                templateAttributes.includes(temp[i].name)
            ) {
                if (
                    mondrianAttributesTemplate.length === 0
                ) {
                    mondrianAttributesTemplate.push(
                        {
                            header: 'Template'
                        });
                }

                mondrianAttributesTemplate.push(temp[i]);
            }
            else {
                if (
                    mondrianAttributesCustom.length === 0
                ) {
                    mondrianAttributesCustom.push(
                        {
                            header: 'Custom'
                        });
                }

                mondrianAttributesCustom.push(temp[i]);
            }
        }

        // ---------------------------------------------------------------------
        // Add default header
        // ---------------------------------------------------------------------

        let output =
            [
                {
                    header: 'Default'
                }
            ]
                .concat(mondrianAttributesDefault)
                .concat(mondrianAttributesPredefined)
                .concat(mondrianAttributesTemplate)
                .concat(mondrianAttributesCustom);

        return output;
    };

    // =========================================================================
    // Row Rendering
    // =========================================================================

    MondrianDialogs.renderInputRow = function (ctx) {
        let item = ctx.item;

        ctx.names[ctx.count] = item.name;

        let editable =
            this.isEditable(ctx, item);

        // =========================================================
        // Row
        // =========================================================

        var row =
            document.createElement('div');

        row.className =
            'geDialogFormRow';

        // =========================================================
        // Label
        // =========================================================

        var lbl =
            document.createElement('span');

        lbl.className =
            'geDialogFormLabel';

        mxUtils.write(
            lbl,
            item.name + ':'
        );

        row.appendChild(lbl);

        // =========================================================
        // Input
        // =========================================================

        var input =
            document.createElement('input');

        input.type = 'text';
        input.id = item.name;
        input.value = item.value || '';

        if (item.mixed) {
            ctx.mixed[ctx.count] = true;

            input.setAttribute(
                'placeholder',
                mxResources.get('multipleValues')
            );
        }

        row.appendChild(input);

        // =========================================================
        // Tracking
        // =========================================================

        ctx.texts[ctx.count] = input;
        ctx.rows[ctx.count] = row;

        // =========================================================
        // Remove button
        // =========================================================

        if (
            editable &&
            !this.isDefaultAttribute(item.name)
        ) {
            ctx.addRemoveButton(
                row,
                item.name
            );
        }

        // =========================================================
        // Add row
        // =========================================================

        ctx.propertiesContainer.appendChild(
            row
        );

        // =========================================================
        // Readonly
        // =========================================================

        if (!editable) {
            input.setAttribute(
                'readonly',
                'readonly'
            );
        }
    };

    MondrianDialogs.renderTextAreaRow = function (ctx) {
        let item = ctx.item;

        ctx.names[ctx.count] = item.name;

        let editable =
            this.isEditable(ctx, item);

        // =========================================================
        // Row
        // =========================================================

        var row =
            document.createElement('div');

        row.className =
            'geDialogFormRow';

        row.style.alignItems =
            'flex-start';

        // =========================================================
        // Label
        // =========================================================

        var lbl =
            document.createElement('span');

        lbl.className =
            'geDialogFormLabel';

        mxUtils.write(
            lbl,
            item.name + ':'
        );

        row.appendChild(lbl);

        // =========================================================
        // Textarea
        // =========================================================

        var textarea =
            document.createElement('textarea');

        textarea.value =
            item.value || '';

        if (item.mixed) {
            ctx.mixed[ctx.count] = true;

            textarea.setAttribute(
                'placeholder',
                mxResources.get('multipleValues')
            );
        }

        textarea.setAttribute(
            'rows',
            (item.value &&
                item.value.indexOf('\n') >= 0) ?
                '3' :
                '1'
        );

        row.appendChild(textarea);

        // =========================================================
        // Tracking
        // =========================================================

        ctx.texts[ctx.count] = textarea;
        ctx.rows[ctx.count] = row;

        // =========================================================
        // Remove button
        // =========================================================

        if (
            editable &&
            !this.isDefaultAttribute(item.name)
        ) {
            ctx.addRemoveButton(
                row,
                item.name
            );
        }

        // =========================================================
        // Add row
        // =========================================================

        ctx.propertiesContainer.appendChild(
            row
        );

        // =========================================================
        // Readonly
        // =========================================================

        if (!editable) {
            textarea.setAttribute(
                'readonly',
                'readonly'
            );
        }
    };

    MondrianDialogs.renderDataRow = function (ctx) {
        let item = ctx.item;

        if (item == null) {
            return 0;
        }

        let mondrianShape =
            this.isMondrianShape(
                ctx.graph,
                ctx.cell
            );

        let mondrianConnector =
            this.isMondrianConnector(
                ctx.graph,
                ctx.cell
            );

        let mondrianElement =
            mondrianShape ||
            mondrianConnector;

        // =========================================================
        // Header rows
        // =========================================================

        if (item.header != null) {
            var headerRow =
                document.createElement('div');

            headerRow.className =
                'geDialogSectionHeader';

            mxUtils.write(
                headerRow,
                'Mondrian Attributes: ' +
                item.header
            );

            ctx.propertiesContainer.appendChild(
                headerRow
            );

            return 0;
        }

        // =========================================================
        // Render field
        // =========================================================

        if (
            item.name === 'Element-ID' ||
            item.name === 'Interface-ID' ||
            item.name === 'Icon-Name'
        ) {
            this.renderInputRow(ctx);
        }
        else {
            this.renderTextAreaRow(ctx);
        }

        // =========================================================
        // Non-Mondrian elements stop here
        // =========================================================

        if (!mondrianElement) {
            return 1;
        }

        // =========================================================
        // Icon Selectize
        // =========================================================

        if (
            item.name === 'Icon-Name' &&
            (
                ctx.meta[item.name] == null ||
                ctx.meta[item.name].editable !== false
            )
        ) {
            setTimeout(mxUtils.bind(this, function () {
                this.applyIconNameSelectize(ctx);
            }), 0);
        }

        // =========================================================
        // Element / Interface Selectize
        // =========================================================

        if (
            (
                item.name === 'Element-ID' ||
                item.name === 'Interface-ID'
            ) &&
            (
                ctx.meta[item.name] == null ||
                ctx.meta[item.name].editable !== false
            )
        ) {
            setTimeout(mxUtils.bind(this, function () {
                this.applyElementSelectize(
                    ctx,
                    mondrianShape,
                    mondrianConnector
                );
            }), 0);
        }
        return 1;
    };

    // =========================================================================
    // Icon Selectize
    // =========================================================================

    MondrianDialogs.applyIconNameSelectize = function (ctx) {
        let editable =
            this.isEditable(
                ctx,
                ctx.item
            );

        let selectize =
            this.registerSelectize(
                '#Icon-Name',
                {
                    maxItems: 1,

                    options:
                        window.MONDRIAN_REPO.ICONS,

                    optionGroupRegister:
                        this.createOptGroup,

                    optgroupField:
                        'group',

                    labelField:
                        'name',

                    searchField:
                        [
                            'name'
                        ],

                    sortField:
                        'name',

                    plugins:
                        editable ?
                            [
                                'select_on_focus',
                                'clear_button'
                            ] :
                            []
                }
            );

        if (!editable && selectize != null) {
            selectize.lock();

            selectize.$control.addClass(
                'readonly'
            );
        }
    };

    // =========================================================================
    // Element / Interface Selectize
    // =========================================================================

    MondrianDialogs.applyElementSelectize = function (
        ctx,
        mondrianShape,
        mondrianConnector
    ) {
        let graph =
            ctx.graph;

        let cell =
            ctx.cell;

        let value =
            ctx.value;

        let editable =
            this.isEditable(
                ctx,
                ctx.item
            );

        let elementType =
            (mondrianShape) ?
                'SHAPE' :
                'INTERFACE';

        let client =
            'default';

        let predefinedElements =
            [];

        let canvasCell =
            graph.getModel().getRoot();

        if (
            canvasCell != undefined &&
            canvasCell.value != undefined
        ) {
            predefinedElements =
                (
                    canvasCell.hasAttribute(
                        'Predefined-Elements'
                    )
                ) ?
                    (
                        canvasCell.value
                            .getAttribute(
                                'Predefined-Elements'
                            )
                            .split(',')
                    ).map(
                        element =>
                            element.toLowerCase()
                    ) :
                    [];

            if (
                predefinedElements.length > 0
            ) {
                client =
                    predefinedElements[0];
            }
        }

        let availableOptions =
            window.MONDRIAN_REPO.getElementRepo(
                client,
                elementType
            );

        let optionID =
            (mondrianShape) ?
                value.getAttribute(
                    'Element-ID'
                ) :
                value.getAttribute(
                    'Interface-ID'
                );

        let hasOptionID =
            (optionID != null);

        let isKnownPredefinedElement =
            (
                value.attributes.getNamedItem(
                    'repoAttributes'
                ) != null &&
                value.attributes.getNamedItem(
                    'repoAttributes'
                ).value != ""
            );

        if (
            hasOptionID &&
            !isKnownPredefinedElement
        ) {
            availableOptions.unshift(
                {
                    type:
                        '[Not Predefined]',

                    client:
                        'default',

                    id:
                        optionID,

                    name:
                        ''
                }
            );
        }

        let selector =
            (mondrianShape) ?
                '#Element-ID' :
                '#Interface-ID';

        let selectize =
            this.registerSelectize(
                selector,
                {
                    maxItems: 1,

                    options:
                        availableOptions,

                    optionGroupRegister:
                        this.createOptGroup,

                    persist:
                        false,

                    create:
                        editable,

                    valueField:
                        'id',

                    labelField:
                        'id',

                    optgroupField:
                        'type',

                    searchField:
                        [
                            'id',
                            'name',
                            'client',
                            'type',
                            'nameFull'
                        ],

                    sortField:
                        [
                            'type',
                            'nameFull'
                        ],

                    plugins:
                        editable ?
                            [
                                'select_on_focus',
                                'clear_button'
                            ] :
                            [],

                    // =====================================================
                    // CHANGE HOOK
                    // =====================================================

                    onChange:
                        mxUtils.bind(this, function (selectedId) {

                            if (
                                selectedId == null ||
                                selectedId === ''
                            ) {
                                return;
                            }

                            let repoEntry =
                                availableOptions.find(
                                    function (x) {
                                        return (
                                            x.id === selectedId
                                        );
                                    }
                                );

                            if (repoEntry == null) {
                                return;
                            }

                            // -------------------------------------------------
                            // Update primary ID
                            // -------------------------------------------------

                            if (mondrianShape) {
                                value.setAttribute(
                                    'Element-ID',
                                    selectedId
                                );
                            }
                            else {
                                value.setAttribute(
                                    'Interface-ID',
                                    selectedId
                                );
                            }

                            // -------------------------------------------------
                            // Apply predefined attributes
                            // -------------------------------------------------

                            if (
                                repoEntry.attributes != null
                            ) {
                                Object.keys(
                                    repoEntry.attributes
                                ).forEach(function (key) {

                                    value.setAttribute(
                                        key,
                                        repoEntry.attributes[key]
                                    );

                                });
                            }

                            // -------------------------------------------------
                            // repoAttributes
                            // -------------------------------------------------

                            if (
                                repoEntry.repoAttributes != null
                            ) {
                                value.setAttribute(
                                    'repoAttributes',
                                    repoEntry.repoAttributes.join(',')
                                );
                            }
                            else {
                                value.removeAttribute(
                                    'repoAttributes'
                                );
                            }

                            // -------------------------------------------------
                            // templateAttributes
                            // -------------------------------------------------

                            if (
                                repoEntry.templateAttributes != null
                            ) {
                                value.setAttribute(
                                    'templateAttributes',
                                    repoEntry.templateAttributes.join(',')
                                );
                            }
                            else {
                                value.removeAttribute(
                                    'templateAttributes'
                                );
                            }

                            // -------------------------------------------------
                            // Refresh dialog
                            // -------------------------------------------------

                            this.refreshDataDialog(ctx);

                        }),


                    render:
                    {
                        option:
                            function (
                                item,
                                escape
                            ) {
                                var label =
                                    item.id +
                                    ': ' +
                                    item.name;

                                var caption =
                                    (
                                        item.client ===
                                        'default'
                                    ) ?
                                        item.nameFull :
                                        item.client +
                                        ': ' +
                                        item.nameFull;

                                return (
                                    "<div class='option'>" +
                                    escape(label) +
                                    (
                                        caption ?
                                            "<span class='sub-option'>" +
                                            escape(caption) +
                                            "</span>" :
                                            ""
                                    ) +
                                    "</div>"
                                );
                            }
                    }
                }
            );

        if (!editable && selectize != null) {
            selectize.lock();

            selectize.$control.addClass(
                'readonly'
            );
        }
    };

    MondrianDialogs.refreshDataDialog = function (ctx) {
        if (
            ctx == null ||
            ctx.container == null
        ) {
            return;
        }

        // Clear existing rows
        while (ctx.container.firstChild) {
            ctx.container.removeChild(
                ctx.container.firstChild
            );
        }

        // Rebuild attributes
        let temp =
            ctx.getDisplayAttributes();

        temp =
            this.filterAttributes(
                ctx.graph,
                ctx.cell,
                temp
            );

        temp =
            this.processAttributes(
                ctx.graph,
                ctx.cell,
                ctx.value,
                temp
            );

        // Re-render rows
        let visibleIndex = 0;

        for (let i = 0; i < temp.length; i++) {
            ctx.item = temp[i];
            ctx.count = visibleIndex;

            visibleIndex +=
                this.renderDataRow(ctx);
        }
    };
})();