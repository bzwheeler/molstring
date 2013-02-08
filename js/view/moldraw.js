define([
	'jQuery',
	'Underscore',
	'JXG',
	'util/event_manager',
	'Backbone',
	'model/Molecule',
	'model/Atom',
	'model/Bond'
], function($, _, JXG, EventManager, Backbone, Molecule, Atom, Bond) {

	var View = Backbone.View.extend({
		events: {
			'keyup #jxgbox' : 'handleKeyPress'
		},
		subscribers: {},

		initialize : function(options) {
			var molecule = new Molecule();
			this.ATOM_COUNT = 0;
			this.bondList = {};
			this.BOND_COUNT = 0;
			this.board = this.buildJSXBoard();
		},

		handleKeyPress : function(e) {
			if( e.keyCode == 27 ) {
		        if (this.hook) this.killBond(true);
		        if (this.editing) this.stopEditing();
		    } else if ( e.keyCode == 46 && this.editing ) {
		    } else if ( this.editing && e.keyCode >= 65 && e.keyCode <= 91 ) {
		        this.editing.symbol.setText(String.fromCharCode(e.keyCode));
		        this.board.update();
		    }
		},

		buildJSXBoard : function() {
			var self = this;

			JXG.Options.grid.snapToGrid = true;
			JXG.Options.grid.gridX = 1;
			JXG.Options.grid.gridY = 1;
			JXG.Options.grid.strokeColor = '#C0C0C0';
			JXG.Options.grid.strokeOpacity = '0.5';
			JXG.Options.grid.strokeWidth = 1;
			JXG.Options.grid.dash = 0;

			var board = JXG.JSXGraph.initBoard('jxgbox',{
				boundingbox:[0,10,20,0],
				shownavigation:false
			});
			board.addGrid();

			board.addHook(function(e){
				self.lastUp = Date.now();
				if (self.editing) {
					self.stopEditing();
					return;
				}
				
				if (self.hasMoved) {
					self.hasMoved = false;
					return;
				}
				if (self.doubleClick){
					self.editing = self.getFirstAtom(board.getAllObjectsUnderMouse(e));
					if (self.editing) {
						self.editing.setAttribute({strokeColor:'#0000FF'});
					}
					self.killBond();
					return;
				}
				
				var a, b, bond, coords = self.getCoords(e);
				
				var under = board.getAllObjectsUnderMouse(e)
				for (var i in under) {
					if (!under[i].getAttribute('visible')){
						continue;
					}
					if (under[i].elementClass == JXG.OBJECT_CLASS_POINT) {
						a = self.onAtomClick(under[i]);
						if( !a ) return;
						else break;
					}
					if (under[i].elementClass == JXG.OBJECT_CLASS_LINE && !self.hook && !under[i].secondary) {
						return self.onBondClick(under[i]);
					}
				}

				if (self.hook) {
					self.bond.atomB.show();
					self.bond.atomA.isNew = false;
					board.removeHook( self.hook );
					a = self.bond.atomB;
				} else if( !a ) {
					a = self.createAtom(coords.usrCoords[1], coords.usrCoords[2], true);
					a.isNew = true;
				}
				b         = self.createAtom(coords.usrCoords[1], coords.usrCoords[2], false);
				self.bond = self.createBond(a, b);
				self.hook = board.addHook(function(e){
					board.suspendUpdate();
					var c = self.getCoords(e);
					b.setPosition(JXG.COORDS_BY_USER, Math.round(c.usrCoords[1]), Math.round(c.usrCoords[2]));
					board.unsuspendUpdate();
				}, 'mousemove');
			}, 'mouseup');

			board.addHook(function(e){
				self.doubleClick = false;
				if (self.lastUp) {
					diff = Date.now() - self.lastUp;
					if (diff < 250) {
						self.doubleClick = true;
					}
				}
				self.hasMoved = false;
			}, 'mousedown');

			board.addHook(function(e){
				self.hasMoved = true;
			}, 'mousemove');

			return board;
		},

		getFirstAtom : function(elements) {
			for (var i in elements) {
				if (elements[i].elementClass == JXG.OBJECT_CLASS_POINT) {
					return elements[i];
				}
			}
			return undefined;
		},

		getCoords : function(e) {
			var cPos = this.board.getCoordsTopLeftCorner(e),
			absPos   = JXG.getPosition(e),
			dx       = absPos[0]-cPos[0],
			dy       = absPos[1]-cPos[1];
			
			return new JXG.Coords(JXG.COORDS_BY_SCREEN, [dx, dy], this.board);
		},

		createAtom : function(x, y, visible) {
		    x = Math.round(x);
		    y = Math.round(y);
		    var atom = this.board.create('point', [x, y], {
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
		    atom.id = this.ATOM_COUNT++;
		    atom.bonds = [];
		    atom.symbol = this.board.create('text', [function(){return atom.X() - 0.2}, function(){return atom.Y() - 0.160}, 'C'], {visible:visible});
		    
		    return atom;
		},

		createBond : function(atomA, atomB, options, secondary) {
		    if (!options) {
		        options = {
		            strokeColor:'#000000',
		            strokeWidth:3
		        };
		    }
		    var bond = this.board.create('segment', [atomA, atomB], options);
		    if (secondary) {
		        bond.secondary = true;
		    } else {
		        bond.bondType = 'single';
		    }
		    bond.atomA = atomA;
		    bond.atomB = atomB;
		    atomA.bonds.push(atomB);
		    atomB.bonds.push(atomA);
		    bond.id    = this.BOND_COUNT++;
		    this.bondList[bond.id] = bond;
		    return bond;
		},

		onAtomClick : function(atom) {
		    if (this.hook) {
		        var tmp = this.bond.atomA;
		        this.killBond();
		        if (tmp.id != atom.id) {
		            tmp.isNew = false;
		            this.createBond(tmp, atom);
		        }
		        return;
		        
		    }
		    return atom;
		},

		killBond : function(escaped) {
		    this.board.removeHook( this.hook );
		    var bond = this.bond;
		    if (escaped && bond.atomA.isNew) {
		        this.board.removeObject(bond.atomA);
		        this.board.removeObject(bond.atomA.symbol);
		    }
		    if (bond.atomB) {
		        this.board.removeObject(bond.atomB);    
		        this.board.removeObject(bond.atomB.symbol);
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
		    
		    this.board.removeObject(bond);
		    
		    delete(bond.atomA);
		    delete(bond.atomB);
		    delete(this.hook);
		    delete(this.bond);
		    delete(this.bondList[bond.id]);
		},

		stopEditing : function() {
		    this.editing.setAttribute({strokeColor:'#000000'});
		    delete(this.editing);
		},

		onBondClick : function(bond) {
		    switch (bond.bondType) {
		        case 'single':
		            bond.doubleBond = this.createBond(bond.atomA, bond.atomB, {strokeColor:'#FFFFFF'}, true);
		            bond.setAttribute({strokeWidth:5, strokeColor:'#000000'});
		            bond.bondType = 'double';
		        break;
		        case 'double':
		            bond.tripleBond = this.createBond(bond.atomA, bond.atomB, {strokeColor:'#000000'}, true);
		            bond.doubleBond.setAttribute({strokeWidth:5});
		            bond.setAttribute({strokeWidth:8, strokeColor:'#000000'});
		            bond.bondType = 'triple'
		        break;
		        case 'triple':
		            bond.doubleBond.remove();
		            bond.tripleBond.remove();
		            delete(bond.doubleBond);
		            delete(bond.tripleBond);
		            bond.setAttribute({strokeWidth:3, strokeColor:'#000000'});
		            bond.bondType = 'single';
		        break;
		    }
		}
	});

	// Mix in the event manager functionality
	EventManager(View.prototype);

	return View;
});