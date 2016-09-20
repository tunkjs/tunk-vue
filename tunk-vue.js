(function() {


    var tunk = require('tunk');
    var Vue = require('vue');

    tunk.install = function (Vue) {


        tunk.hook('updateComponentState', function(origin){
            return function(targetObject, stateName, newValue, module, action){
                if (targetObject.$options.beforeStateInject)
                    targetObject.$options.beforeStateInject.call(targetObject, stateName, newValue, module+'.'+action);
                targetObject.$set(stateName, newValue);
                //origin.call(null, targetObject, stateName, newValue, action);
            }
        });


        Vue.mixin({

            init: function () {
                if (this.$options.state) {

                    var stateOptions = this.$options.state, stateOptions_ = {};

                    for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                        if (typeof stateOptions[x] === 'string' && stateOptions[x].indexOf('.') > -1) {
                            Vue.util.defineReactive(this, x, tunk.connection.state(this, x, stateOptions[x].split('.')));
                        } else {
                            throw 'the path of state should had dot separator ' + x + ':' + stateOptions[x];
                        }
                    }
                }

                if (this.$options.actions) {

                    var actionOptions = this.$options.actions, tmp;

                    for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                        if (typeof actionOptions[x] === 'string' && actionOptions[x].indexOf('.') > -1) {
                            tmp = actionOptions[x].split('.');
                            tunk.connection.action(this, x, tmp[0], tmp[1]);
                        } else {
                            throw 'the action option should has dot between module name and action name ' + x + ':' + actionOptions[x];
                        }
                    }
                }

                tunk.connection.dispatch(this, 'dispatch', function(dispatch){
                    return function(actionPath){
                        if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw 'the first argument should has dot between module name and action name: ' + actionPath;
                        actionPath = actionPath.split('.');
                        dispatch(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                    }
                });

            },


            beforeDestroy: function () {
                tunk.connection.clean(this);
            },
        });
    }


})();