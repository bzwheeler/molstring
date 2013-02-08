(function(){

window.MolDrawSettings = Backbone.Model.extend({
    initialize : function() {
        this.set('mode', 'bond');
    },
    
    mode : function(value) {
        if( value  ) {
            this.set({mode:value});
        }
        return this.get('mode');
    }
});

})();