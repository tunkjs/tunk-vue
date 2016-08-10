(function () {

	/**

	Vue.flow.model()
	Vue.flow.config(hook)
	Vue.flow.mixin()
	Vue.flow.bind()
	ajax
	 *  */


	var vueState = {

		install: function (Vue) {

			var store = {},
				models = {},
				listeners = [],
				protos = {},
				proto,
				hook_beforeDispatch = [],
				hook_beforeStore = [],
				hook_beforeFlowIn = [];

			Vue.flow = {};

			Vue.flow.model = function (name, opts) {
				if (!name || !opts) throw 'two arguments are required';
				if (typeof opts.default !== 'object') throw 'please set an default object-type property to be the default data of the model';

				store[name] = clone(opts.default);
				//定义一个model类
				function Model() {
					this.state = clone(store[name]);
					this._name = name;
					this._opts = opts;
				}

				proto = Model.prototype = Object.assign({
					constructor: Model,
				}, protos);



				for (var x in opts) if (opts.hasOwnProperty(x) && x != 'default') {
					proto[x] = (function (modelName, actionName) {

						proto.dispatch = dispatch;

						//需要支持 Promiss dispatch 
						return function (options) {
							//获取状态
							models[modelName].state = clone(store[modelName]);

							var result = opts[actionName].call(models[modelName], options);
							if (typeof result === 'object') dispatch.call(models[modelName], result);

						};

						function dispatch(name, obj) {
							var result;
							if ((result = run_beforeDispatch_hooks(this, Array.prototype.slice.call(arguments), store[modelName])) === false) return;
							else if (typeof result === 'object' && result.constructor === Array) {
								name = result[0];
								obj = result[1];
							}

							if (typeof name === 'object') {
								obj = name;
								result = run_beforeStore_hooks(obj, store[modelName]);
								if (typeof result === 'object') obj = result;
								storeState(obj);
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

						//需要移出下面一些方法
						//数据进出 store 通过 clone 隔离
						function storeState(obj) {
							var pathValue_, state = store[modelName], handlers = listeners[modelName], changedFields = Object.keys(obj), meta;

							Object.assign(state, clone(obj));

							for (var i = 0, l = handlers.length; i < l; i++) if (handlers) {
								// 第2层根据changedFields判断是否有更新，过滤一把
								if (handlers[i].statePath[1] && changedFields.indexOf(handlers[i].statePath[1]) === -1) continue;
								// 数据流入前hook
								pathValue_ = pathValue(handlers[i].statePath);

								meta = {
									name: handlers[i].dataName,
									value: pathValue_,
									action: modelName + '.' + actionName
								};

								run_beforeFlowIn_hooks(handlers[i].comp, meta);

								if (handlers[i].comp.$options.beforeFlowIn)
									handlers[i].comp.$options.beforeFlowIn.call(handlers[i].comp, meta);

								handlers[i].comp.$set(handlers[i].dataName, pathValue_);

							}
						}

						//控制执行流程，往下流，重新流，停止流
						//中间件需要返回一个数组才能进行下一个中间件的执行，否则停止执行余下的中间件
						function run_beforeDispatch_hooks(model, args, state) {
							var result;
							if (hook_beforeDispatch.length) {
								for (var i = 0, l = hook_beforeDispatch.length; i < l; i++) {
									result = hook_beforeDispatch[i].call(model, args, state, dispatch);
									if (!result) break;
									else if (typeof result === 'object' && result.constructor === Array) args = result;
								}
								return result;
							} else return args;
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
								hook_beforeFlowIn[i](comp, meta);
							}
						}

					})(name, x);
				}

				models[name] = new Model();

			};


			Vue.flow.bind = function (bindName, func) {
				if (typeof middleware === 'function')
					switch (hookName) {
						case 'beforeDispatch':
							hook_beforeDispatch.push(func);
							break;
						case 'beforeStore':
							hook_beforeStore.push(func);
							break;
						case 'beforeFlowIn':
							hook_beforeFlowIn.push(func);
					}
				else throw 'a function as the second argument is needed';
			};

			Vue.flow.mixin = function (obj) {
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




			Vue.flow.mixin({

				each: function (obj, cb) {
					if (typeof obj === 'object') {
						if (typeof obj.length !== 'undefined')
							for (var i = 0, l = obj.length; i < l; i++)
								if (cb(obj[i], i) === false) break;
								else for (var x in obj)
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
