define([
	'fontoxml-base-flow/CustomMutationResult',
	'fontoxml-blueprints',
	'fontoxml-selectors/evaluateXPathToNodes'
], function (
	CustomMutationResult,
	blueprints,
	evaluateXPathToNodes
	) {
	'use strict';

	var blueprintQuery = blueprints.blueprintQuery;

	// This custom mutation allows the user to "remove a column" from the <properties> structure as they would with
	// any table. A custom mutation is necessary because we're actually removing a bunch of elements from different
	// parents.

	return function removePropertiesColumn (argument, blueprint, format) {
		var contextNode = blueprint.lookup(argument.contextNodeId);

		// If no context node was set, or if it was already removed from the document, abort.
		if (!contextNode || !blueprintQuery.isInDocument(blueprint, contextNode)) {
			return CustomMutationResult.notAllowed();
		}

		// find the name of the cell that was clicked, and the "hd"(-less) equivalents.
		//     eg. propvalue + propvaluehd, propdeschd + propdesc
		var contextNodeName = contextNode.nodeName;
		var otherNodeName = contextNodeName.slice(-2) === 'hd' ?
			contextNodeName.slice(0, -2) :
			contextNodeName + 'hd';

		// Find the nodes that should be removed.
		//     This assumes that the context node is a child of <properties>. If it isn't then the node names we've
		//     been looking for are wrong and this query will not yield any results, this failing silently.
		var columnNodes = evaluateXPathToNodes(
			'ancestor::properties/*/*[self::' + contextNodeName + ' or self::' + otherNodeName + ']',
			contextNode, blueprint);
		if (columnNodes.length === 0) {
			return CustomMutationResult.notAllowed();
		}

		// Remove all selected nodes.
		columnNodes.forEach(function removeNodes(node) {
			var parentNode = blueprint.getParentNode(node);
			blueprint.removeChild(parentNode, node);
		});

		// Send the OK signal after which Fonto will apply validation.
		return CustomMutationResult.ok();
	};
});
