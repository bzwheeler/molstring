define([
	'Backbone'
], function(Backbone) {
	var Bond = Backbone.Model.extend({
		defaults : function() {
			return {
				type : 'single'
			};
		}
	});

	return Bond;
});