(function() {


    var tunk = require('tunk');
    var Vue = require('vue');

    tunk.install = function (Vue) {


        tunk.hook('updateComponentState', function(origin){
            return function(targetObject, stateName, newValue, action){
                if (targetObject.$options.beforeStateInject)
                    targetObject.$options.beforeStateInject.call(targetObject, stateName, newValue, action);
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
                            stateOptions_[x] = stateOptions[x].split('.');
                        } else {
                            throw 'the path of state should had dot separator: ' + x + ':' + stateOptions[x];
                        }
                    }

                    this.$options.stateOptions_=stateOptions_;

                    var initialState = tunk.connectionApi.connectState(this, stateOptions_);

                    for (var x in initialState) if (initialState.hasOwnProperty(x)) {
                        Vue.util.defineReactive(this, x, initialState[x]);
                    }

                }

                if (this.$options.actions) {

                    var actionOptions = this.$options.actions, actionOptions_ = {};

                    for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                        if (typeof actionOptions[x] === 'string' && actionOptions[x].indexOf('.') > -1) {
                            actionOptions_[x] = actionOptions[x].split('.');
                        } else {
                            throw 'the action option should has dot between module name and action name:' + x + ':' + actionOptions[x];
                        }
                    }

                    tunk.connectionApi.connectActions(this, actionOptions_);
                }

                tunk.connectionApi.setDispatchMethod(this, 'dispatch', function (dispatch) {
                    return function (name) {
                        if (typeof name !== 'string' || name.indexOf('.') === -1) throw 'the first argument should has dot between module name and action name: ' + name;
                        name = name.split('.');
                        dispatch(name[0], name[1], Array.prototype.slice.call(arguments, 1));
                    };
                });
            },


            beforeDestroy: function () {
                if (this.$options.stateOptions_) {
                    tunk.connectionApi.disconnect(this, this.$options.stateOptions_);
                }
            },
        });
    }


})();