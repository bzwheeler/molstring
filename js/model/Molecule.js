define([
	'Backbone'
], function(Backbone) {
	var Molecule = Backbone.Model.extend({
		defaults : function() {
			return {
				atoms : []
			};
		},

		initialize : function() {},

		addAtom : function() {},

		removeAtom : function(atom) {},
		addBond : function(atom1, atom2) {},
		removeBond : function(bond) {}

	});

	return Molecule;
});