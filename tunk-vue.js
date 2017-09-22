(function () {

    function tunkVue(utils) {
        var tunk = this;
        tunk.install = function (Vue) {
            utils.hook('updateComponentState', function (origin) {
                return function (targetObject, stateName, newValue, options) {
                    if (targetObject.$options.beforeStateChange)
                        targetObject.$options.beforeStateChange.call(targetObject, stateName, newValue);
                    targetObject[stateName] = newValue;
                    origin(targetObject, stateName, newValue, options);
                }
            });

            Vue.mixin({
                init: init,
                beforeCreate: init, // for Vue2.0 
                beforeDestroy: function () {
                    utils.connect.clean(this);
                },
            });

            function init() {
                if (this.$options.state) {
                    var stateOptions = this.$options.state;
                    if (stateOptions.constructor === Array) {
                        for (var i = 0; i < stateOptions.length; i++) {
                            Vue.util.defineReactive(this, stateOptions[i], utils.connect.state(this, stateOptions[i], stateOptions[i].split('.')));
                        }
                    } else
                        for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                            Vue.util.defineReactive(this, x, utils.connect.state(this, x, stateOptions[x].split('.')));
                        }
                }

                if (this.$options.actions) {
                    var actionOptions = this.$options.actions, tmp;
                    if (actionOptions.constructor === Array) {
                        for (var i = 0, x = actionOptions[0]; i < actionOptions.length; i++ , x = actionOptions[i]) {
                            var proto = utils.connect.getModule(x).__proto__,
                                protoNames = Object.getOwnPropertyNames(proto);
                            for (var i = 0, y = protoNames[0]; i < protoNames.length; i++ , y = protoNames[i]) if (proto[y].options && proto[y].options.isAction) {
                                utils.connect.action(this, x + '_' + y, x, y);
                            }
                        }
                    } else
                        for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                            if (typeof actionOptions[x] === 'string')
                                if (actionOptions[x].indexOf('.') > -1) {
                                    tmp = actionOptions[x].split('.');
                                    utils.connect.action(this, x, tmp[0], tmp[1]);
                                } else {
                                    var proto = utils.connect.getModule(actionOptions[x]).__proto__,
                                        protoNames = Object.getOwnPropertyNames(proto);
                                    for (var i = 0, y = protoNames[0]; i < protoNames.length; i++ , y = protoNames[i]) if (proto[y].options && proto[y].options.isAction) {
                                        utils.connect.action(this, x + '_' + y, actionOptions[x], y);
                                    }
                                }
                        }
                }

                utils.connect.dispatch(this, 'dispatch', function (dispatch) {
                    return function (actionPath) {
                        if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw '[TUNK-VUE]:the first argument should has dot between module name and action name: ' + actionPath;
                        actionPath = actionPath.split('.');
                        dispatch(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                    }
                });
            }
        }
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