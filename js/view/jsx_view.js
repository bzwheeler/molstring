define([
    'jQuery',
    'Underscore',
    'Backbone',
    'util/attributes',
    'model/Atom',
    'model/Bond',
    'view/atom'
], function($, _, Backbone, Attributes, Atom, Bond, AtomView){

/**************
if a bond is NOT yet started:
    on atom click, start a new bond
    on atom dbl-click, select the atom (bring up atom editor widget)
    on atom drag, move the atom
    on bond click, cycle bond types (single, double, triple, wedge, dashed-wedge)
    on bond dbl-click, select the bond (bring up bond editor widget)
    on bond-drag, move the bond
    on board click, add an atom and start a bond
    on board dbl-click, add an atom

if a bond IS started
    on atom click, if you click the origin atom, cancel the bond
    on atom click, if you click an atom other than the origin atom, complete the bond and start a new bond
    on atom dbl-click, if a bond is started from a different atom, complete the bond and DO NOT start a new bond
    on atom dbl-click, if you click the origin atom, cancel the bond and select the atom
    'esc' key, cancel the bond
**************/

    /*** CONSTANTS ***/
    var ATOM = 'atom',
        BOND = 'bond';

    var View = Backbone.View.extend({
        initialize : function(options) {
            _.bindAll(this, 'onMouseDown', 'onMouseMove', 'onMouseUp');
            this.board = options.board;
            this.board.addHook(this.onMouseDown, 'mousedown');
            this.board.addHook(this.onMouseMove, 'mousemove');
            this.board.addHook(this.onMouseUp,   'mouseup');
        },

        onMouseDown : function(e) {
            this.isMouseDown(true);
        },

        onMouseMove : function(e) {
            if (this.isMouseDown()) {
                if (!this.isDragging()) {
                    this.isDragging(true);
                }
            }
            else if (this.isBondInProgress()) {
                var coords = this.getUsrCoords(e);
                this.updateActiveBond(coords.x, coords.y);
            }
            else if (this.startBondOnMove()) {
                this.startBondOnMove(false);
                this.startBond(this.lastPlacedAtom());
            }
        },

        onMouseUp : function(e) {
            var coords    = this.getUsrCoords(e),
                now       = Date.now();

            this.isMouseDown(false);
            if (this.isDragging()) {
                this.isDragging(false);
            }
            else {
                if (this.isBondInProgress()) {
                    var bond = this.completeBond(this.getObjectUnderMouse(e, [ATOM]));
                    if (bond) {
                        this.lastPlacedAtom(bond.end);
                        this.startBondOnMove(true);
                    }
                }
                else {
                    var element = this.getObjectUnderMouse(e, [ATOM, BOND]);
                    if (this.lastUpEvent() && now - this.lastUpEvent().time < 250) {
                        this.startBondOnMove(false);
                        this.trigger('selected', element);
                    }
                    else if (!element) {
                        this.startBond(element || this.createAtom(coords.x, coords.y));
                    } else if (element.isAtom) {
                        this.lastPlacedAtom(element);
                        this.startBondOnMove(true);
                    } else {
                        console.log('cycle bond type');
                    }
                }
            }

            this.lastUpEvent({
                time   : Date.now(),
                event  : e
            });
        },

        createAtom : function(x, y) {
            var atom = new AtomView({
                model : new Atom(),
                board : this.board,
                x     : x,
                y     : y
            });
            
            this.trigger('atom-added', atom);
            
            return atom.renderer;
        },

        createBond : function(atomA, atomB, trigger) {
            var bond = this.board.create('segment', [atomA, atomB], {
                strokeColor:'#000000',
                strokeWidth:3
            });
            bond.start = atomA;
            bond.end   = atomB;
            bond.isBond = true;
            bond.model  = new Bond();

            if (trigger) {
                this.trigger('bond-added', bond.model);
            }

            return bond;
        },

        startBond : function(atom) {
            var end  = this.board.create('point', [atom.X(), atom.Y()], {visible:false});
            var bond = this.createBond(atom, end);

            this.activeBond(bond);
            this.isBondInProgress(true);

            return bond;
        },

        completeBond : function(atom) {
            var bond = this.activeBond();

            atom = atom || this.createAtom(bond.end.X(), bond.end.Y());

            this.board.removeObject(bond);
            this.board.removeObject(bond.end);
            this.board.removeObject(bond.end.symbol);
            if (atom != bond.start) {
                bond = this.createBond(bond.start, atom, true);
            } else {
                bond = null;
            }

            this.isBondInProgress(false);

            return bond;
        },

        updateActiveBond : function(x, y) {
            var bond = this.activeBond();

            this.board.suspendUpdate();
            bond.end.setPosition(JXG.COORDS_BY_USER, [Math.round(x), Math.round(y)]);
            this.board.unsuspendUpdate();
        },

        getUsrCoords : function(e) {
            var coords = this.getCoords(e);
            return {
                x : coords.usrCoords[1],
                y : coords.usrCoords[2]
            };
        },

        getCoords : function(e) {
            var cPos = this.board.getCoordsTopLeftCorner(e),
            absPos   = JXG.getPosition(e),
            dx       = absPos[0]-cPos[0],
            dy       = absPos[1]-cPos[1];
            
            return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], this.board);
        },

        getObjectUnderMouse : function(e, types) {
            var under = this.board.getAllObjectsUnderMouse(e);
            for (var i in under) {
                if (!under[i].getAttribute('visible')){
                    continue;
                }
                if (under[i].isAtom && types.indexOf(ATOM) >= 0) {
                    return under[i];
                }
                if (under[i].isBond && types.indexOf(BOND) >= 0) {
                    return under[i];
                }
            }

            return undefined;
        }
    });

    Attributes.readWrite(View.prototype, [
        'isBondInProgress',
        'isDragging',
        'isMouseDown',
        'lastUpEvent',
        'activeBond',
        'lastPlacedAtom',
        'startBondOnMove'
    ]);

    return View;
});