define([
	'Backbone'
], function(Backbone) {
	var Atom = Backbone.Model.extend({
		defaults : function() {
			return {
				symbol : '',
				name   : '',
				weight : '',
				bonds  : []
			};
		},

		initialize : function(){},

	});

	return Atom;
});