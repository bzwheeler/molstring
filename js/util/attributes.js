define([
    'Underscore'
],
function(_) {
    function read(object, attributes) {
        _.each(attributes, function(attr) {
            object[attr] = function() {
                return this['_' + attr];
            }
        });
    };

    function readWrite(object, attributes) {
        _.each(attributes, function(attr) {
            object[attr] = function(value) {
                if (value !== undefined) {
                    this['_' + attr] = value;
                }
                return this['_' + attr];
            }
        });
    };
    
    return {
        read      : read,
        readWrite : readWrite
    };
});