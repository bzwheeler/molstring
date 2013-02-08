require.config({
	baseUrl: 'js/',
	paths: {
		JXG:          'lib/jsxgraphcore.min',
		jQuery:       'lib/jquery-1.9.1.min',
		Underscore:   'lib/underscore.min',
		Backbone:     'lib/backbone.min'
	},
	shim: {
		'Backbone': {
			deps:    ['Underscore', 'jQuery'],
			exports: 'Backbone'
		},
		'jQuery': {
			exports: '$'
		},
		'Underscore': {
			exports: '_'
		},
		'JXG': {
			exports: 'JXG'
		}
	}
});