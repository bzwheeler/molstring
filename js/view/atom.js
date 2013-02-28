define([
    'jQuery',
    'Underscore',
    'Backbone',
], function($, _, Backbone){

    var View = Backbone.View.extend({
        initialize : function(options) {
            _.bindAll(this, 'labelX', 'labelY', 'onAtomUpdate');

            this.board = options.board;

            this.renderer = this.board.create(
                'point',
                [
                    Math.round(options.x),
                    Math.round(options.y)
                ],
                {
                    withLabel:false,
                    showInfobox:false,
                    size:14,
                    fillColor: this.model.get('color'),
                    strokeColor: this.model.get('stroke_color')
                }
            );
            this.renderer.isAtom = true;

            this.symbol = this.board.create(
                'text',
                [
                    this.labelX,
                    this.labelY,
                    this.model.get('symbol')
                ]
            );

            this.model.on('change', this.onAtomUpdate);
        },

        labelX : function() {
            if (this.symbol) {
                var $el  = $(this.symbol.rendNode);
                var size = this.screenToUser($el.outerWidth(), 0);
            } else {
                size = {x:0};
            }

            return this.renderer.X() - size.x/2;
        },

        labelY : function() {
            return this.renderer.Y();
        },

        screenToUser : function(x,y) {
            return {
                x : x/this.board.unitX,
                y : y/this.board.unitY
            };
        },

        onAtomUpdate : function(atom) {
            console.log('atom changed');
        }
    });

    return View;
});