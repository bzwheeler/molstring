define([
	'jQuery',
	'Backbone',
	'util/event_manager',
	'view/moldraw'
], function($, Backbone, EventManager, MolView) {

	var RootRouter = Backbone.Router.extend({
		routes : {
			'' : 'start'
		},

		start : function() {
			var View = new MolView({el: '#jsgbox'});
		}
	});

	EventManager(RootRouter.prototype);

	var router = new RootRouter();

	return router;
});