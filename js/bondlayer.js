(function(){

var BondLayer = Backbone.View.extend({
    initialize : function() {
        this.model.on('add', this.bondAdded, this);
        this.canvas = this.options.canvas;
    },
    
    bondAdded : function(obj, model){
        var bond = new fabric.Line([model.x1(), model.y1(), model.x2(), model.y2()], {
            fill        : '#0000FF',
            stroke      : '#00FF00',
            strokeWidth : 5
        });
        bond.hasControls = false;
        bond.set('model', model);
        bond.on('change:pos', $.proxy(this.move, this));
        this.canvas.add( bond );
    },
    
    modeChanged : function(obj, mode) {
        for( var i = 0; i < this.bonds.length; i++ ) {
            this.configureBonds( this.bonds[i] );
        }
    },
    
    move : function( bond, pos ) {
        this.bonds[bond.id].set('x1', pos.x1);
        this.bonds[bond.id].set('y1', pos.y1);
        this.bonds[bond.id].set('x1', pos.x2);
        this.bonds[bond.id].set('y1', pos.y2);
        console.log('moving bond');
    },
    
    configureAtom : function( bond ) {
        switch(mode) {
            case 'select':
                bond.selectable = true;
                bond.lockMovementX = false;
                bond.lockMovementY = false;
            break;
            case 'atom':
                bond.selectable = false;
                bond.lockMovementX = true;
                bond.lockMovementY = true;
            break;
            case 'bond':
                bond.selectable = false;
                bond.lockMovementX = true;
                bond.lockMovementY = true;
            break;
        }
    }
});

})();