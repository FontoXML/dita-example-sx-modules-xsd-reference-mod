define([
	'fontoxml-base-flow/addCustomMutation',
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-documents/documentsManager',
	'fontoxml-operations/addTransform',
	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToFirstNode',

	'./api/removePropertiesColumn'
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

		addTransform(
			'setChildNodeStructureForExistingColumns',
			function setChildNodeStructureForExistingColumns (stepData) {
				stepData.childNodeStructure = [stepData.rowElement];

				if (!stepData.contextNodeId) {
					return stepData;
				}

				var contextNode = documentsManager.getNodeById(stepData.contextNodeId);

				if (stepData.parentElement && contextNode.nodeName !== stepData.parentElement) {
					contextNode = evaluateXPathToFirstNode('ancestor::' + stepData.parentElement, contextNode, readOnlyBlueprint);
				}

				var columnCounter = 0;

				for (var i = 0; i < stepData.columns.length; i++) {
					var selector = 'child::*/' + stepData.columns[i].currentNodeName;
					selector += stepData.columns[i].otherNodeNames ? ' or child::*/' + stepData.columns[i].otherNodeNames.join(' or child::*/') : '';

					if (evaluateXPathToBoolean(selector, contextNode, readOnlyBlueprint)) {
						columnCounter++;
						var cellNode = [stepData.columns[i].currentNodeName];
						if (columnCounter === 1) {
							cellNode.push([{ "bindTo": "selection", "empty": true }]);
						}
						stepData.childNodeStructure.push(cellNode);
					}
				}

				return stepData;
			});
	};
});
