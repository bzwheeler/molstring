require.config({
	baseUrl: 'js/',
	paths: {
		text:         'lib/requirejs-plugins/text',
		json:         'lib/requirejs-plugins/json',
		JXG:          'lib/jsxgraphcore.min',
		jQuery:       'lib/jquery-1.9.1.min',
		Underscore:   'lib/underscore.min',
		Backbone:     'lib/backbone.min'
	},
	shim: {
		'json': {
			deps:    ['text']
		},
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