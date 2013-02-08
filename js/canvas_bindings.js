(function(){

window.CanvasBindings = BackBone.Model.extend({
    initialize : function() {
        this.get('canvas').observe('object:move', $.proxy(this.onMove, this));
    },
    
    onMove : function(e) {
        console.log(e);
    },
    
    bind : function(a, b, props, oneWay) {
        this._bind(a, b, props);
        if(!oneWay) {
            this._bind(b, a, props, true);
        }
    },
    
    _bind : function(a, b, props, invert) {
        if( invert ) {
            var copy = {};
            for( var key in props ) {
                copy[props[key]] = key;
            }
            props = copy;
        }
        a._bindings[b.id()] = {obj:b, props:props};
    }
});

})();