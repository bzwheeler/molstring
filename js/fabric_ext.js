(function(){

fabric.Object.UID = 0;
fabric.Object.prototype.id = function(){
    if( !this.hasOwnProperty( '_id' ) ) {
        this._id = fabric.Object.UID++;
    }
    return this._id;
}

function onObjectMove(e) {
    var target   = e.memo.target;
    var bindings = target._bindings;
    if( bindings && bindings.length ) {
        for( var i = bindings.length; --i >= 0; ) {
            var o     = bindings[i].obj;
            var props = bindings[i].props;
            if( o.isActive() ) continue;
            for( var key in props ) {
                o.set(props[key], target.get(key));
            }
        }
    }
}

function bindObjects(a, b, props, invert) {
    if( !a.hasOwnProperty('_bindings') ) {
        a._bindings = [];
    }
    
    if( invert ) {
        var copy = {};
        for( var key in props ) {
            copy[props[key]] = key;
        }
        props = copy;
    }
    a._bindings.push({obj:b, props:props});
}

fabric.Canvas.prototype.objectBindingEnabled = function( on ) {
    if( !this.hasOwnProperty('_triggerObjectBindings') ) {
        this._triggerObjectBindings = $.proxy(onObjectMove, this)
    }
    if( on ) {
        this.observe('object:moving', this._triggerObjectBindings);
    }
    else {
        this.stopObserving('object:moving', this._triggerObjectBindings);
    }
};

fabric.Canvas.prototype.bindObjects = function(a, b, props, oneWay) {
    bindObjects(a, b, props, false);
    if(!oneWay) {
        bindObjects(b, a, props, true);
    }
};

})();