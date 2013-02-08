JXG.Options.grid.snapToGrid = true;
JXG.Options.grid.gridX = 1;
JXG.Options.grid.gridY = 1;
JXG.Options.grid.strokeColor = '#C0C0C0';
JXG.Options.grid.strokeOpacity = '0.5';
JXG.Options.grid.strokeWidth = 1;
JXG.Options.grid.dash = 0;

var NUMBERS = {
    'H' : 1,
    'He' : 2,
    'Li' : 3,
    'Be' : 4,
    'B' : 5,
    'C' : 6,
    'N' : 7,
    'O' : 8,
    'F' : 9,
    'Ne' : 10
};

var self  = this;
self.bondList = {};
self.BOND_COUNT = 0;
self.ATOM_COUNT = 0;
var board = JXG.JSXGraph.initBoard('jxgbox',{
    boundingbox:[0,10,20,0],
    shownavigation:false
});
board.addGrid();
$(document).bind('keyup', function(e){
    if( e.keyCode == 27 ) {
        if( self.hook ) killBond(true);
        if( self.editing ) stopEditing();
    } else if ( e.keyCode == 46 && self.editing ) {
    } else if ( self.editing && e.keyCode >= 65 && e.keyCode <= 91 ) {
        self.editing.symbol.setText(String.fromCharCode(e.keyCode));
        board.update();
    }
});

function getCoords(e) {
    var cPos = board.getCoordsTopLeftCorner(e),
    absPos   = JXG.getPosition(e),
    dx       = absPos[0]-cPos[0],
    dy       = absPos[1]-cPos[1];
    
    return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], board);
}

function stopEditing() {
    self.editing.setAttribute({strokeColor:'#000000'});
    delete( self.editing );
}

function killBond(escaped) {
    board.removeHook( self.hook );
    var bond = self.bond;
    if( escaped && bond.atomA.isNew ) {
        board.removeObject(bond.atomA);
        board.removeObject(bond.atomA.symbol);
    }
    if (bond.atomB) {
        board.removeObject(bond.atomB);    
        board.removeObject(bond.atomB.symbol);
        for (var i = 0; i < bond.atomB.bonds.length; i++) {
            if (bond.atomB.bonds[i].id == bond.atomA.id) {
                bond.atomB.bonds.splice(i, 1);
                break;
            }
        }
    }
    
    for (var i = 0; i < bond.atomA.bonds.length; i++) {
        if (bond.atomA.bonds[i].id == bond.atomB.id) {
            bond.atomA.bonds.splice(i, 1);
            break;
        }
    }
    
    board.removeObject(bond);
    
    delete(bond.atomA);
    delete(bond.atomB);
    delete(self.hook);
    delete(self.bond);
    delete(self.bondList[bond.id]);
}

function createAtom(x, y, visible) {
    x = Math.round(x);
    y = Math.round(y);
    var atom = board.create('point', [x, y], {
        withLabel:false,
        showInfobox:false,
        visible:visible,
        size:7,
        fillColor:'#FFFFFF',
        strokeColor:'#000000'
    });
    atom.show = function() {
        this.setAttribute({visible:true});
        this.symbol.setAttribute({visible:true});
    }
    atom.id = self.ATOM_COUNT++;
    atom.bonds = [];
    atom.symbol = board.create('text', [function(){return atom.X() - 0.2}, function(){return atom.Y() - 0.160}, 'C'], {visible:visible});
    
    return atom;
}

function createBond( atomA, atomB, options, secondary ) {
    if( !options ) {
        options = {
            strokeColor:'#000000',
            strokeWidth:3
        };
    }
    var bond = board.create('segment', [atomA, atomB], options);
    if( secondary ) {
        bond.secondary = true;
    } else {
        bond.bondType = 'single';
    }
    bond.atomA = atomA;
    bond.atomB = atomB;
    atomA.bonds.push(atomB);
    atomB.bonds.push(atomA);
    bond.id    = self.BOND_COUNT++;
    self.bondList[bond.id] = bond;
    return bond;
}

function onAtomClick(atom) {
    if( self.hook ) {
        var tmp = self.bond.atomA;
        killBond();
        if( tmp.id != atom.id ) {
            tmp.isNew = false;
            createBond( tmp, atom );
        }
        return;
        
    }
    return atom;
}

function onBondClick(bond) {
    switch( bond.bondType ) {
        case 'single':
            bond.doubleBond = createBond( bond.atomA, bond.atomB, {strokeColor:'#FFFFFF'}, true );
            bond.setAttribute({strokeWidth:5, strokeColor:'#000000'});
            bond.bondType = 'double';
        break;
        case 'double':
            bond.tripleBond = createBond( bond.atomA, bond.atomB, {strokeColor:'#000000'}, true );
            bond.doubleBond.setAttribute({strokeWidth:5});
            bond.setAttribute({strokeWidth:8, strokeColor:'#000000'});
            bond.bondType = 'triple'
        break;
        case 'triple':
            bond.doubleBond.remove();
            bond.tripleBond.remove();
            delete( bond.doubleBond );
            delete( bond.tripleBond );
            bond.setAttribute({strokeWidth:3, strokeColor:'#000000'});
            bond.bondType = 'single';
        break;
    }
}

function getFirstAtom(elements) {
    for( var i in elements ) {
        if( elements[i].elementClass == JXG.OBJECT_CLASS_POINT ) {
            return elements[i];
        }
    }
    return undefined;
}

board.addHook(function(e){
    self.lastUp = Date.now();
    if( self.editing ) {
        stopEditing();
        return;
    }
    
    if( self.hasMoved ) {
        self.hasMoved = false;
        return;
    }
    if( self.doubleClick ){
        self.editing = getFirstAtom(board.getAllObjectsUnderMouse(e));
        if( self.editing ) {
            self.editing.setAttribute({strokeColor:'#0000FF'});
        }
        killBond();
        return;
    }
    
    var i, a, b, bond, coords = getCoords(e);
    
    var under = board.getAllObjectsUnderMouse(e)
    for (i in under) {
        if(!under[i].getAttribute('visible')){
            continue;
        }
        if(under[i].elementClass == JXG.OBJECT_CLASS_POINT ) {
            a = onAtomClick(under[i]);
            if( !a ) return;
            else break;
        }
        if(under[i].elementClass == JXG.OBJECT_CLASS_LINE && !self.hook && !under[i].secondary ) {
            return onBondClick(under[i]);
        }
    }

    if( self.hook ) {
        self.bond.atomB.show();
        self.bond.atomA.isNew = false;
        board.removeHook( self.hook );
        a = self.bond.atomB;
    } else if( !a ) {
        a = createAtom( coords.usrCoords[1], coords.usrCoords[2], true );
        a.isNew = true;
    }
    b    = createAtom( coords.usrCoords[1], coords.usrCoords[2], false );
    self.bond = createBond( a, b );
    self.hook = board.addHook(function(e){
        board.suspendUpdate();
        var c = getCoords(e);
        b.setPosition( JXG.COORDS_BY_USER, Math.round(c.usrCoords[1]), Math.round(c.usrCoords[2]) );
        board.unsuspendUpdate();
    }, 'mousemove');
}, 'mouseup');

board.addHook(function(e){
    self.doubleClick = false;
    if( self.lastUp ) {
        diff = Date.now() - self.lastUp;
        if( diff < 250 ) {
            self.doubleClick = true;
        }
    }
    self.hasMoved = false;
}, 'mousedown');

board.addHook(function(e){
    self.hasMoved = true;
}, 'mousemove');

$('#stringify').on('click', function() {
    var seen  = {};
    var atoms = [];
    for (var key in self.bondList) {
        var bond = self.bondList[key];
        storeAtomJSON(seen, bond.atomA, atoms);
        storeAtomJSON(seen, bond.atomB, atoms);
    }
    console.log(atoms);
    console.log(canonicalize(atoms));
});

function storeAtomJSON(seen, atom, atoms) {
    if (seen[atom.id]) return;
    seen[atom.id] = true;
    
    var h_count     = 0,
        non_h_count = 0;
        
    for (var i = 0; i < atom.bonds.length; i++) {
        if (atom.bonds[i].symbol.text == 'H') {
            h_count++;
        }
        else {
            non_h_count++;
        }
    }
    
    atoms.push({
        connections : atom.bonds.length,
        non_h_bonds : non_h_count,
        number      : NUMBERS[atom.symbol.plaintext],
        sign        : 0,
        hydrogens   : h_count
    });
}