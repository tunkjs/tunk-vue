(function () {

  /**

  Vue.flow.model()
  Vue.flow.config(hook)
  Vue.flow.model,mixin()
  ajax
   *  */


  var vueState = {

    install: function (Vue, configs) {

      var store = {}, models = {}, listeners = [], protos = {}, proto;

      Vue.flow = {};

      configs = Object.assign({
        beforeStore: function (oldState, newState) { },
        beforeFlowIn: function (name, obj) { },
        beforeDispatch: function (dispatch, name, obj) { return true; },
      }, configs);

      Vue.flow.model = function (name, opts) {
        if (!name || !opts) throw 'two arguments are required';
        if (typeof opts.default !== 'object') throw 'please set an default object-type property to be the default data of the model';

        store[name] = clone(opts.default);
        //定义一个model类
        function Model() {
          this.state = clone(opts.default);
          this._name = name;
          this._opts = opts;
        }

        proto = Model.prototype = Object.assign({
          constructor: Model,
        }, protos);



        for (var x in opts) if (opts.hasOwnProperty(x) && x != 'default') {
          proto[x] = (function (modelName, actionName) {

            proto.dispatch = dispatch;

            return function (options) {
              //获取状态，需要frozen
              models[modelName].state = store[modelName];

              var result = opts[actionName].call(models[modelName], options);
              if (typeof result === 'object') dispatch.call(models[modelName], result);

            };

            function dispatch(name, obj) {

              if (configs.beforeDispatch(this, dispatch.bind(this), name, obj) === false) return;

              if (typeof name === 'object') {
                var pathValue_;
                obj = name;
                var state = store[modelName], handlers = listeners[modelName], changedFields = Object.keys(obj);

                //合并到store

                configs.beforeStore(state, obj);
                Object.assign(state, clone(obj));

                for (var i = 0, l = handlers.length; i < l; i++) if (handlers) {
                  // 第2层根据changedFields判断是否有更新，过滤一把
                  if (handlers[i].statePath[1] && changedFields.indexOf(handlers[i].statePath[1]) === -1) continue;
                  // 数据流入前hook
                  pathValue_ = pathValue(handlers[i].statePath);

                  configs.beforeFlowIn(handlers[i].dataName, pathValue_);

                  if (handlers[i].comp.$options.beforeFlowIn)
                    handlers[i].comp.$options.beforeFlowIn.call(handlers[i].comp, {
                      name: handlers[i].dataName,
                      value: pathValue_,
                    });

                  handlers[i].comp.$set(handlers[i].dataName, pathValue_);

                }
              } else if (typeof name === 'string') {
                if (name.indexOf('.') === -1) name = [modelName, name];
                else name = name.split('.');
                if (!models[name[0]]) throw 'the model ' + name[0] + ' is not exist';
                if (!models[name[0]][name[1]]) throw 'the action ' + name[1] + ' of model ' + name[0] + ' is not exist';
                models[name[0]][name[1]](obj);
              } else {
                throw 'please check the arguments of dispatch';
              }
            }

          })(name, x);
        }


        models[name] = new Model();


      };


      Vue.flow.config = function (obj) {
        Object.assign(configs, obj);
      };

      Vue.flow.model.mixin = function (obj) {
        Object.assign(protos, obj);
      };

      Vue.mixin({

        init: function () {
          if (this.$options.flow) {
            for (var x in this.$options.flow) if (this.$options.flow.hasOwnProperty(x)) {
              var statePath = this.$options.flow[x].split('.');
              listeners[statePath[0]] = listeners[statePath[0]] || [];
              listeners[statePath[0]].push({
                comp: this,
                dataName: x,
                statePath: statePath,
              });

              //设置组件默认数据
              Vue.util.defineReactive(this, x, pathValue(statePath));
              //this.$set(x, listeners[statePath[0]][listeners[statePath[0]].length-1].pathValue(store));
            }
          }

        },
        beforeDestroy: function () {
          if (this.$options.flow) {
            var statePath, tmp;
            for (var x in this.$options.flow) if (this.$options.flow.hasOwnProperty(x)) {
              statePath = this.$options.flow[x].split('.');
              tmp = [];
              for (var i = 0, l = listeners[statePath[0]].length; i < l; i++) {
                if (listeners[statePath[0]][i].comp !== this) tmp.push(listeners[statePath[0]][i]);
                //else console.log('beforeDestroy demaged-',this);
              }
              listeners[statePath[0]] = tmp;
            }
          }
        },
        methods: {
          $action: function (name, opts) {
            if (name.indexOf('.') === -1) throw 'please check the argument of $action';
            else name = name.split('.');
            if (!models[name[0]]) throw 'the model ' + name[0] + ' is not exist';
            if (!models[name[0]][name[1]]) throw 'the action ' + name[1] + ' of model ' + name[0] + ' is not exist';
            models[name[0]][name[1]](opts);
          }
        }
      });




      Vue.flow.model.mixin({

        each: function (obj, cb) {
          if (typeof obj === 'object') {
            if (typeof obj.length !== 'undefined') for (var i = 0, l = obj.length; i < l; i++) if (cb(obj[i], i) === false) break;
            else for (var x in obj) if (obj.hasOwnProperty(x)) if (cb(obj[x], x) === false) break;
          }else console.error('argument is wrong');
        },

        map: function (obj, cb) {
          var tmp, result = [];
          this.each(obj, function (value, key) {
            tmp = cb(value, key);
            if (typeof tmp !== 'undefined') result.push(tmp);
          });
          return result;
        },

        find: function (obj, cb) {
          var result;
          this.each(obj, function (value, key) {
            if (cb(value, key)) {
              result=value;
              return false;
            }
          });
          return result;
        },

        clone: clone,

      });

      function pathValue(statePath) {
        var state = store[statePath[0]];
        if (!statePath[1]) return state;
        else {
          state = state[statePath[1]];
          if (!statePath[2] || typeof state !== 'object') return state;
          else {
            state = state[statePath[2]];
            if (!statePath[3] || typeof state !== 'object') return state;
            else {
              state = state[statePath[3]];
              if (!statePath[4] || typeof state !== 'object') return state;
              else {
                return state[statePath[4]];
                //if(!statePath[5] || typeof state !=='object') return state;
              }
            }
          }
        }
      }

      function clone(obj) {
        if (typeof obj === 'object')
          return JSON.parse(JSON.stringify(obj));
        else return obj;
      }
    }
  };



  if (typeof module === 'object' && module.exports) {
    module.exports = vueState
  }
  else if (typeof define === 'function' && define.amd) {
    define(function () { return vueState })
  }
  else if (typeof window !== undefined) {
    return window.vueState = vueState
  }

})();
