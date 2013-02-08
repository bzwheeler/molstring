startSelection( coords, target ) {
}

updateSelection( coords, target ) {
}

completeSelection( coords, target ) {
    resetEventMap();
    addOneTimeEvent('mousedown', {
        board: killSelection
        atom : killSelection
        bond : killSelection
    });
}

cancelSelection( coords, target ) {
}

EventManager = new Class({
    init : function(){
        
    },
    
    onMouseDown : function() {
    },
    
    onMouseMove : function() {
    },
    
    onMouseUp : function() {
    },
    
    onKeyDown : function() {
    }
    
    onKeyUp : function() {
    }
});

startBond( coords, target ) {
    if ( target.type != 'atom' ) {
        target = addAtom();
    }
    addData( 'bond', createBond(target) );
    
    clearEventMap();
    addEvent('click', 'completeBond', ['board','atom'] );
    addEvent('escape', 'cancelBond');
}

updateBond( coords, target, data ) {
    // if there is a currently highlighted atom, kill the highlight if the mouse
    // is no longer over it
    if ( data.highlight && (target.type != 'atom' || target.id != data.highlight.id)) {
        data.highlight.unhighlight();
        clearData('highlight');
    }
    // highlight the atom if the mouse is currently over it
    if ( target.type == 'atom' ) {
        target.highlight();
        addData('highlight', target);
    }
    // update the position of the end of the bond
    data.bond.atomB.setPosition( coords.x, coords.y );
}

completeBond( coords, target ) {
    if ( target.type == 'atom' && target.id == data.bond.atomA.id ) {
        cancelBond( coords, target );
    }
    else if ( target.type != 'atom' ) {
        target = addAtom();
    }
    data.bond.finalizeAtomB( target );
    
    resetData();
    resetEventMap();
}

cancelBond( coords, target ) {
}