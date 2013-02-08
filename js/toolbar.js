(function(){
    window.ToolBar = Backbone.View.extend({
        el : $('#toolbar'),
        
        initialize : function() {
            this.model.bind('change', this.render, this);
            this.modes = {
                'select' : $('#toolbar .select'),
                'atom'   : $('#toolbar .atom'),
                'bond'   : $('#toolbar .bond')
            };
            
            this.render();
        },
        
        render : function() {
            if( this.active ) {
                this.active.removeClass('active');
            }
            
            this.active = this.modes[this.model.mode()];
            this.active.addClass('active');
        },
        
        events : {
            'click .select' : function(){this.model.mode('select')},
            'click .atom'   : function(){this.model.mode('atom')},
            'click .bond'   : function(){this.model.mode('bond')}
        }
    });
})();