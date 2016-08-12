(function () {

	/**
	 Vue.flow.model()
	 Vue.flow.addMiddleware()
	 Vue.flow.mixin()
	 Vue.flow.bind()
	 *  */


	var vueState = {

		install: function (Vue) {

			var store = {},
				models = {},
				connections = [],
				protos = {},
				proto,
				middlewares = [],
				hook_beforeStore = [],
				hook_beforeFlowIn = [];

			Vue.flow = {};

			Vue.flow.model = function (name, opts) {

				if (!name || !opts) throw 'two arguments are required';
				if (!opts.default || opts.default.constructor !== Object) throw 'please set an default object-type property to be the default data of the model';

				store[name] = clone(opts.default);
				//定义一个model类
				function Model() {
					this.name = name;
				}

				proto = Model.prototype = Object.assign({
					constructor: Model,
					getState: getState,
				}, protos);



				for (var x in opts) if (opts.hasOwnProperty(x) && x != 'default') {
					proto[x] = (function (modelName, actionName) {

						proto.dispatch = dispatch;

						return function (options) {
							var result = opts[actionName].call(models[modelName], options);
							if (typeof result !== 'undefined') return dispatch.call(models[modelName], result);
						};

						function dispatch() {

							return run_middlewares(this, Array.prototype.slice.call(arguments), {
								modelName:modelName,
								actionName:actionName,
								models:models,
								store:store,
							}, dispatch);
						}
					})(name, x);
				}

				models[name] = new Model();

				function getState(otherModelName) {
					if (!otherModelName) return clone(store[this.name]);
					else return clone(store[otherModelName]);
				}


				function run_middlewares(model, args, meta, dispatch) {
					var index=0;

					return next(args);

					function next(args){
						if(!args || args.constructor !== Array) throw 'the argument of next should be an array';
						if(index<middlewares.length)
							return middlewares[index++](dispatch, next, end, meta).apply(model, args);
						else return end(args[0]);
					}
					function end(result){
						if(!result) return;
						if(result.constructor !== Object) throw 'the argument of end should be a plain object';
						index = middlewares.length;
						result = run_beforeStore_hooks(result, store[meta.modelName]);
						return storeState(result, meta.modelName, meta.actionName)
					}
				}

				//数据进出 store 通过 clone 隔离
				function storeState(obj, modelName, actionName) {
					var pathValue_,
						state = store[modelName],
						pipes = connections[modelName],
						changedFields = Object.keys(obj),
						meta,
						changedState=clone(obj);

					Object.assign(state, changedState);

					for (var i = 0, l = pipes.length; i < l; i++) if (pipes[i]) {
						// 第2层根据changedFields判断是否有更新，过滤一把
						if (pipes[i].statePath[1] && changedFields.indexOf(pipes[i].statePath[1]) === -1) continue;
						// 数据流入前hook
						pathValue_ = pathValue(pipes[i].statePath);

						meta = {
							name: pipes[i].dataName,
							value: pathValue_,
							action: modelName + '.' + actionName
						};

						run_beforeFlowIn_hooks(pipes[i].comp, meta);

						if (pipes[i].comp.$options.beforeFlowIn)
							pipes[i].comp.$options.beforeFlowIn.call(pipes[i].comp, meta);

						pipes[i].comp.$set(pipes[i].dataName, pathValue_);

					}

					return changedState;

				}

				function run_beforeStore_hooks(newState, state) {
					var result;
					for (var i = 0, l = hook_beforeStore.length; i < l; i++) {
						result = hook_beforeStore[i](newState, state);
						if (typeof result === 'object') newState = result;
					}
					return newState;
				}

				function run_beforeFlowIn_hooks(comp, meta) {
					for (var i = 0, l = hook_beforeStore.length; i < l; i++) {
						hook_beforeFlowIn[i].call(comp, meta);
					}
				}

			};

			Vue.flow.bind = function (bindName, func) {
				if (typeof func === 'function')
					switch (bindName) {
						case 'beforeStore':
							hook_beforeStore.push(func);
							break;
						case 'beforeFlowIn':
							hook_beforeFlowIn.push(func);
					}
				else throw 'a callback as the second argument is needed';
			};

			Vue.flow.addMiddleware = function (middleware) {
				if(typeof middleware === 'object' && middleware.constructor === Array)
					middlewares = middleware.concat(middleware);
				else if(typeof middleware === 'function') middlewares.push(middleware);
			};

			Vue.flow.mixin = function (obj) {
				Object.assign(protos, obj);
			};

			Vue.mixin({

				init: function () {
					if (this.$options.pipes) {
						for (var x in this.$options.pipes) if (this.$options.pipes.hasOwnProperty(x)) {
							var statePath = this.$options.pipes[x].split('.');
							connections[statePath[0]] = connections[statePath[0]] || [];
							connections[statePath[0]].push({
								comp: this,
								dataName: x,
								statePath: statePath,
							});

							//设置组件默认数据
							Vue.util.defineReactive(this, x, pathValue(statePath));
						}
					}

					if(this.$options.action){
						var action;
						for (var x in this.$options.action) if (this.$options.action.hasOwnProperty(x)) {
							action = this.$options.action[x].split('.');
							if (!models[action[0]]) throw 'the model ' + action[0] + ' is not exist';
							if (!models[action[0]][action[1]]) throw 'the action ' + action[1] + ' of model ' + action[0] + ' is not exist';
							this[x]=(function(modelName,actionName){
								return function(){
									models[modelName][actionName].call(models[modelName], Array.prototype.slice.call(arguments));
								};
							})(action[0], action[1]);
						}
					}

				},
				beforeDestroy: function () {
					if (this.$options.pipes) {
						var statePath, tmp;
						for (var x in this.$options.pipes) if (this.$options.pipes.hasOwnProperty(x)) {
							statePath = this.$options.pipes[x].split('.');
							tmp = [];
							for (var i = 0, l = connections[statePath[0]].length; i < l; i++) {
								if (connections[statePath[0]][i].comp !== this) tmp.push(connections[statePath[0]][i]);
							}
							connections[statePath[0]] = tmp;
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


			//extentions

			Vue.flow.addMiddleware(function(dispatch, next, end, meta){
				return function(name, options){
					if(typeof name !== 'string') {
						return next(Array.prototype.slice.call(arguments));
					}
					if (name.indexOf('.') === -1) name = [meta.modelName, name];
					else name = name.split('.');
					if (!meta.models[name[0]]) throw 'the model ' + name[0] + ' is not exist';
					if (!meta.models[name[0]][name[1]]) throw 'the action ' + name[1] + ' of model ' + name[0] + ' is not exist';
					return meta.models[name[0]][name[1]](options);
				};
			});


			Vue.flow.mixin({

				each: function (obj, cb) {
					if (typeof obj === 'object') {
						if (typeof obj.length !== 'undefined') {
							for (var i = 0, l = obj.length; i < l; i++)
								if (cb(obj[i], i) === false) break;
						} else for (var x in obj)
							if (obj.hasOwnProperty(x) && cb(obj[x], x) === false) break;
					} else console.error('argument is wrong');
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
							result = value;
							return false;
						}
					});
					return result;
				},

				clone: clone,

			});

			function pathValue(statePath) {
				console.log(statePath);
				var state = store[statePath[0]];
				if (!statePath[1]) return clone(state);
				else {
					state = state[statePath[1]];
					if (!statePath[2] || typeof state !== 'object') return clone(state);
					else {
						state = state[statePath[2]];
						if (!statePath[3] || typeof state !== 'object') return clone(state);
						else {
							state = state[statePath[3]];
							if (!statePath[4] || typeof state !== 'object') return clone(state);
							else {
								return clone(state[statePath[4]]);
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
