define([
	'Backbone',
	'json!data/elements.json'
], function(Backbone, elements) {
	var Atom = Backbone.Model.extend({
		defaults : function() {
			return {
				symbol            : '',
				name              : 'Carbon',
				atomic_number     : 0,
				atomic_weight     : 0,
				lattice_structure : '',
				color             : '#000000',
				stroke_color      : '#000000'
			};
		},

		initialize : function() {
			// load element properties
			if (this.get('name')) {
				this.loadElementData(this.get('name'), {silent: true});
			}
		},

		changeElement : function(elementName) {
			if (this.get('name') != elementName) {
				this.loadElementData(elementName);
			}
		},

		loadElementData : function(elementName, options) {
			var options = options || {};
			return this.set(elements[this.get('name')], options);
		}
	});

	return Atom;
});