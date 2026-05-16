(function()
{
	window.MondrianDialogConfig =
		window.MondrianDialogConfig || {};

	var MDC = window.MondrianDialogConfig;

	MDC.resolve = function(value)
	{
		return (typeof value === 'function') ?
			value() :
			value;
	};

	MDC.getResponsiveHeight = function(min, max, offset, unit)
	{
		offset = offset || 0;

		var value = Math.max(
			min,
			Math.min(
				max,
				window.innerHeight - offset
			)
		);

		return (unit != null) ?
			value + unit :
			value;
	};

	MDC.getResponsiveWidth = function(min, max, offset, unit)
	{
		offset = offset || 0;

		var value = Math.max(
			min,
			Math.min(
				max,
				window.innerWidth - offset
			)
		);

		return (unit != null) ?
			value + unit :
			value;
	};

	MDC.editData = {
		width: 680,

		height: function()
		{
			return MDC.getResponsiveHeight(
				620,
				820,
				80
			);
		}
	};

	MDC.git = {
		width: 702,

		height: function()
		{
			return MDC.getResponsiveHeight(
				620,
				820,
				80
			);
		},

		contentHeight: function()
		{
			return (
				MDC.resolve(MDC.git.height) - 66
			) + 'px';
		},

		folderHeight: function()
		{
			return (
				MDC.resolve(MDC.git.height) - 96
			) + 'px';
		}
	};

	MDC.gitLab = MDC.git;
	MDC.gitHub = MDC.git;
})();