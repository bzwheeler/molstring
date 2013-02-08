(function(){

var AtomLayer = Backbone.View.extend({
    initialize : function() {
        this.model.on('add', this.atomAdded, this);
        this.canvas = this.options.canvas;
    },
    
    atomAdded : function(obj, model){
        var atom = new fabric.Circle({
            left   : model.x(),
            top    : model.y(),
            radius : 10,
            fill   : '#0000FF'
        });
        atom.hasControls = false;
        atom.set('model', model);
        atom.on('change:pos', $.proxy(this.move, this));
        this.canvas.add(atom);
    },
    
    modeChanged : function(obj, mode) {
        for( var i = 0; i < this.atoms.length; i++ ) {
            this.configureAtom( this.atoms[i] );
        }
    },
    
    move : function(obj, pos) {
        this.atoms[obj.id].set('left', pos.x);
        this.atoms[obj.id].set('top', pos.y);
        console.log('moved atom to ' + pos);
    },
    
    configureAtom : function( atom ) {
        switch(mode) {
            case 'select':
                atom.selectable = true;
                atom.lockMovementX = false;
                atom.lockMovementY = false;
            break;
            case 'atom':
                atom.selectable = false;
                atom.lockMovementX = true;
                atom.lockMovementY = true;
            break;
            case 'bond':
                atom.selectable = true;
                atom.lockMovementX = true;
                atom.lockMovementY = true;
            break;
        }
    }
});

})();