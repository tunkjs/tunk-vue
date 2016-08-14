(function(){

    var function_middleware = function(dispatch, next, end, context){
        return function(func){
            if(typeof func !== 'function') {
                return next(arguments);
            }

            var result = func();
            if(typeof result !=='undefined')
                next([result]);

        };
    };

    if (typeof module === 'object' && module.exports) {
        module.exports = function_middleware
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () { return function_middleware })
    }

})();
