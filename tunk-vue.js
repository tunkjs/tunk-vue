(function() {

    function tunkVue (tunk){

        tunk.install = function (Vue) {

            tunk.hook('updateComponentState', function(origin){
                return function(targetObject, stateName, newValue, module, action){
                    if (targetObject.$options.beforeStateInject)
                        targetObject.$options.beforeStateInject.call(targetObject, stateName, newValue, module+'.'+action);

                    targetObject[stateName] = newValue;

                }
            });

            Vue.mixin({
                init: init,
                beforeCreate: init, // for Vue2.0 
                beforeDestroy: function () {
                    tunk.connection.clean(this);
                },
            });

            function init(){
                if (this.$options.state) {

                    var stateOptions = this.$options.state;
                    if(stateOptions.constructor === Array) {
                        for (var i=0; i<stateOptions.length; i++) {
                            Vue.util.defineReactive(this, stateOptions[i], tunk.connection.state(this, stateOptions[i], stateOptions[i].split('.')));
                        }
                    }else
                        for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                            Vue.util.defineReactive(this, x, tunk.connection.state(this, x, stateOptions[x].split('.')));
                        }
                }

                if (this.$options.actions) {

                    var actionOptions = this.$options.actions, tmp;

                    if(actionOptions.constructor === Array) {
                        for (var i=0, x=actionOptions[0]; i<actionOptions.length; i++, x=actionOptions[i]) {
                            var proto = tunk.connection.getModule(x).__proto__,
                                protoNames = Object.getOwnPropertyNames(proto);
                            for(var i = 0, y = protoNames[0]; i< protoNames.length; i++, y = protoNames[i]) if(proto[y].actionOptions) {
                                tunk.connection.action(this, x + '_' + y, x, y);
                            }
                        }
                    }else
                        for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                            if (typeof actionOptions[x] === 'string' )
                                if(actionOptions[x].indexOf('.') > -1) {
                                    tmp = actionOptions[x].split('.');
                                    tunk.connection.action(this, x, tmp[0], tmp[1]);
                                } else {
                                    var proto = tunk.connection.getModule(actionOptions[x]).__proto__,
                                        protoNames = Object.getOwnPropertyNames(proto);
                                    for(var i = 0, y = protoNames[0]; i< protoNames.length; i++, y = protoNames[i]) if(proto[y].actionOptions) {
                                        tunk.connection.action(this, x + '_' + y, actionOptions[x], y);
                                    }
                                }
                        }
                }

                tunk.connection.dispatch(this, 'dispatch', function(dispatch){
                    return function(actionPath){
                        if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw '[TUNK-VUE]:the first argument should has dot between module name and action name: ' + actionPath;
                        actionPath = actionPath.split('.');
                        dispatch(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                    }
                });
            }
        }

        return tunk;
    }


    if (typeof module === 'object' && module.exports) {
        module.exports = tunkVue;
    }
    else if (typeof define === 'function' && define.amd) {
        define(function () {
            return tunkVue;
        })
    }


})();