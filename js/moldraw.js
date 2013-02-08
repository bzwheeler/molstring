(function() {

window.MolDraw = Backbone.View.extend({
    el : $('#moldraw'),
    
    initialize : function() {
        this.board = JXG.JSXGraph.initBoard('moldraw', {
            boundingbox : [0,0,50,20]
        });
        this.board.addHook($.proxy(this.onMouseUp, this), 'mouseup');
        $(document).bind('keyup', $.proxy(this.onKeyPress, this));
    },
    
    onKeyPress : function(e) {
        if( e.keyCode == 27 ) {
            switch(this._action.type) {
                case 'bond:draw':
                    this.killCurrentBond();
                break;
            }
        }
    },
    
    onMouseUp : function(e) {
    },
    
    killCurrentBond : function() {
        this.board.removeHook( self.hook );
        self.bond.remove();
        self.atomB.remove();
        delete( self.hook );
        delete( self.bond );
        delete( self.atomB );
    }
    
});

})();

function getCoords(e) {
    var cPos = board.getCoordsTopLeftCorner(e),
    absPos   = JXG.getPosition(e),
    dx       = absPos[0]-cPos[0],
    dy       = absPos[1]-cPos[1];
    
    return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}
var self = this;
$(document).bind('keyup', function(e){
    if( e.keyCode == 27 && self.hook ) {
        killBond();
    }
});

function killBond() {
    board.removeHook( self.hook );
    self.bond.remove();
    self.atomB.remove();
    delete( self.hook );
    delete( self.bond );
    delete( self.atomB );
}

function createAtom(x, y, visible) {
    return board.create('point', [x, y], {withLabel:false, showInfobox:false, visible:visible});
}

function createBond( atomA, atomB ) {
    return board.create('segment', [atomA, atomB]);
}


board.addHook(function(e){
    var a, b, bond, 
        coords = getCoords(e);
    
    for (i in board.objects) {
        if(JXG.isPoint(board.objects[i]) && board.objects[i].getAttribute('visible') && board.objects[i].hasPoint(coords.scrCoords[1], coords.scrCoords[2])) {
            if( self.hook ) {
                if( self.atomA.id == board.objects[i].id ) {
                    killBond();
                    return;
                }
                var tmp = self.atomA;
                killBond();
                createBond( tmp, board.objects[i] );
            }
            a = board.objects[i];
            break;
        }
    }
    
    if( self.hook ) {
        self.atomB.setAttribute({visible:true});
        board.removeHook( self.hook );
        a = self.atomB;
    } else if( !a ) {
        a = createAtom( coords.usrCoords[1], coords.usrCoords[2], true );
    }
    b    = createAtom( coords.usrCoords[1], coords.usrCoords[2], false );
    bond = createBond( a, b );
    
    self.atomA = a;
    self.atomB = b;
    self.bond  = bond;
    self.hook  = board.addHook(function(e){
        board.suspendUpdate();
        var c = getCoords(e);
        b.setPosition( JXG.COORDS_BY_USER, c.usrCoords[1], c.usrCoords[2] );
        board.unsuspendUpdate();
    }, 'mousemove');
}, 'mouseup');

