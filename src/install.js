define([
	'fontoxml-base-flow/addCustomMutation',
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-documents/documentsManager',
	'fontoxml-operations/addTransform',
	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToFirstNode',

	'./api/removePropertiesColumnCustomMutation'
], function (
	addCustomMutation,
	readOnlyBlueprint,
	documentsManager,
	addTransform,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,

	removePropertiesColumn
) {
	'use strict';

	return function install () {
		addCustomMutation('remove-properties-column', removePropertiesColumn);

		/**
		 * Prepares the `childNodeStructure` operation data for inserting a new row in a <properties>-like table.
		 * @param  {Object} stepData
		 * @param  {NodeId}  stepData.tableNodeId
		 * @param  {string}  stepData.rowNodeName
		 * @param  {Object}  stepData.columns
		 * @param  {string[]}  stepData.columns.otherNodeNames
		 * @param  {string}  stepData.columns.currentNodeName
		 * @return {{ childNodeStructure: Stencil }}
		 */
		addTransform(
			'setChildNodeStructureForExistingColumns',
			function setChildNodeStructureForExistingColumns (stepData) {
				var tableNode = documentsManager.getNodeById(stepData.tableNodeId);
				if (!tableNode) {
					return stepData;
				}

				var isFirstCell = true;
				stepData.childNodeStructure = [stepData.rowNodeName];

				stepData.columns.forEach(function (column) {
					var selector = 'child::*/' + column.currentNodeName;
					selector += column.otherNodeNames ? ' or child::*/' + column.otherNodeNames.join(' or child::*/') : '';
					if (!evaluateXPathToBoolean(selector, tableNode, readOnlyBlueprint)) {
						return;
					}

					var cellNodeStructure = [column.currentNodeName];
					if (isFirstCell) {
						isFirstCell = false;
						cellNodeStructure.push([{ bindTo: 'selection', empty: true }]);
					}
					stepData.childNodeStructure.push(cellNodeStructure);
				});

				return stepData;
			});
	};
});
