(function () {

    var connections = [];

    function tunkVue(utils) {
        var tunk = this;

        tunk.install = function (Vue) {
            utils.hook('setState', function (origin) {
                return function (newState, options) {
                    var pipes = connections[options.moduleName],
                        changedFields = Object.keys(newState),
                        statePath;

                    origin(newState, options);

                    setTimeout(function () {
                        if (pipes && pipes.length) for (var i = 0, l = pipes.length; i < l; i++) if (pipes[i]) {
                            statePath = pipes[i].statePath;
                            // 只更新 changedFields 字段
                            if (statePath[1] && changedFields.indexOf(statePath[1]) === -1) continue;
                            //减少克隆次数，分发出去到达 View 的数据用同一个副本，减少调用 hooks.getState
                            (function (targetObject, propName, newValue, options) {
                                if (targetObject.$options.beforeStateChange)
                                    targetObject.$options.beforeStateChange.call(targetObject, statePath, newValue);
                                targetObject[propName] = newValue;
                            })(pipes[i].comp, pipes[i].propName, utils.hooks.getState(statePath, options), options);
                        }
                    });
                }
            });

            Vue.mixin({
                init: init,
                beforeCreate: init, // for Vue2.0 
                beforeDestroy: function () {
                    if (this._tunkOptions_) {
                        var stateOption = this._tunkOptions_;
                        var tmp;
                        for (var x in stateOption) {
                            tmp = [];
                            for (var i = 0, l = connections[stateOption[x][0]].length; i < l; i++) {
                                if (connections[stateOption[x][0]][i].comp !== this) tmp.push(connections[stateOption[x][0]][i]);
                            }
                            connections[stateOption[x][0]] = tmp;
                        }
                    }
                },
            });

            function init() {
                if (this.$options.state) {
                    var stateOptions = this.$options.state;
                    for (var x in stateOptions) if (stateOptions.hasOwnProperty(x)) {
                        Vue.util.defineReactive(this, x, connectState(this, x, stateOptions[x].split('.')));
                    }
                }

                if (this.$options.actions) {

                    if (this.$options.actions.constructor === Object) {

                        var actionOptions = this.$options.actions, tmp;

                        for (var x in actionOptions) if (actionOptions.hasOwnProperty(x)) {
                            if (actionOptions[x] && typeof actionOptions[x] === 'string'){
                                tmp = actionOptions[x].split('.');
                                connectAction(this, x, tmp[0], tmp[1]);
                            }
                        }
                    }  else {
                        throw '[tunk-vue]:the actions setting should be type of Object';
                    }
                }

                this.dispatch = function (actionPath) {
                    if (typeof actionPath !== 'string' || actionPath.indexOf('.') === -1) throw '[TUNK-VUE]:the first argument should has dot between module name and action name: ' + actionPath;
                    actionPath = actionPath.split('.');
                    return utils.dispatchAction(actionPath[0], actionPath[1], Array.prototype.slice.call(arguments, 1));
                }
            }

            function connectState(targetObject, propName, statePath) {
                if (!statePath[0] || !utils.modules[statePath[0]]) throw '[tunk]:unknown module name:' + statePath[0];
                connections[statePath[0]] = connections[statePath[0]] || [];
                connections[statePath[0]].push({
                    comp: targetObject,
                    propName: propName,
                    statePath: statePath,
                });
                targetObject._tunkOptions_ = targetObject._tunkOptions_ || {};
                targetObject._tunkOptions_[propName] = statePath;
                //返回组件默认数据
                return utils.hooks.getState(statePath, utils.modules[statePath[0]].options);
            }

            function connectAction(target, propName, moduleName, actionName) {
                console.log(target, propName, moduleName, actionName);
                if(!actionName){
                    var proto = getModule(moduleName).__proto__,
                        protoNames = Object.getOwnPropertyNames(proto);
                    target[propName] = {};
                    for (var i = 0, y = protoNames[0]; i < protoNames.length; i++ , y = protoNames[i]) if (proto[y].options) {
                        (function(moduleName, actionName){
                            target[propName][actionName] = function () {
                                utils.dispatchAction(moduleName, actionName, arguments)
                            };
                        })(moduleName, y)
                    }
                }else {
                    target[propName] = function () {
                        utils.dispatchAction(moduleName, actionName, arguments)
                    };
                }
            }

            function getModule(moduleName) {
                if (!utils.modules[moduleName]) throw '[tunk]:unknown module name ' + moduleName;
                return utils.modules[moduleName];
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
