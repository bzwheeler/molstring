require(['config/config'],
    function(config){
    require([
        'jQuery',
        'router/root',
        'Backbone'
    ], function($, Router, Backbone) {
        Backbone.history.start();
    });
});