(function () {

  var vueState = {

    install: function (Vue, opt) {

      var store = {}, actions = {}, listeners=[];

      Vue.model = function (name, opts) {
        if(!name||!opts) throw 'two arguments are required';
        if(typeof opts.default !== 'object') throw 'please set an default object-type property to be the default data of the model';

        store[name] = clone(opts.default);

        for(var x in opts) if(opts.hasOwnProperty(x) && x!='default'){
          actions[name] = actions[name]||{};
          actions[name][x] = (function(modelName,actionName){

            return function(options){
              //console.time('action');
              opts[actionName].call(Object.assign({}, actions[modelName], Vue.model.prototype, {
                state:store[modelName]/*clone(store[modelName])*/,
                dispatch:dispatch,
              }), options);
              //console.timeEnd('action');
            };

            function dispatch(name,obj){
              if(arguments.length===1 && typeof name === 'object'){

                  obj=name;
                  var state=store[modelName], handlers=listeners[modelName], changedFields = Object.keys(obj);
                  //合并到store
                  Object.assign(state,clone(obj));

                  for(var i=0,l=handlers.length; i<l; i++) if(handlers){
                    // 第2层根据changedFields判断是否有更新，过滤一把
                    if(handlers[i].paths[1] && changedFields.indexOf(handlers[i].paths[1])===-1) continue;
                    handlers[i].comp.$set(handlers[i].dataName, pathValue(handlers[i].statePath));

                  }
              }else if(typeof name === 'string'){
                if(name.indexOf('.')===-1) name=[modelName,name];
                else name=name.split('.');
                if(!actions[name[0]]) throw 'the model '+name[0]+' is not exist';
                if(!actions[name[0]][name[1]]) throw 'the action '+name[1]+' of model '+name[0]+' is not exist';
                actions[name[0]][name[1]](obj);
              }else { 
                throw 'please check the arguments of dispatch';
              }
            }

          })(name,x);
        }


      };

      Vue.mixin({

        init:function() {
          if(this.$options.flow){
            for(var x in this.$options.flow) if(this.$options.flow.hasOwnProperty(x)){
              var statePath=this.$options.flow[x].split('.');
              listeners[statePath[0]]=listeners[statePath[0]]||[];
              listeners[statePath[0]].push({
                comp:this,
                dataName:x,
                paths:statePath,
              });

              //设置组件默认数据
              Vue.util.defineReactive(this, x, pathValue(statePath));
              //this.$set(x, listeners[statePath[0]][listeners[statePath[0]].length-1].pathValue(store));
            }
          }

        },
        beforeDestroy:function(){
          if(this.$options.flow){
            var statePath,tmp;
            for(var x in this.$options.flow) if(this.$options.flow.hasOwnProperty(x)){
              statePath=this.$options.flow[x].split('.');
              tmp=[];
              for(var i=0, l=listeners[statePath[0]].length; i<l; i++){
                if(listeners[statePath[0]][i].comp!==this) tmp.push(listeners[statePath[0]][i]);
                //else console.log('beforeDestroy demaged-',this);
              }
              listeners[statePath[0]]=tmp;
            }
          }
        },
        methods:{
          $action:function(name,opts){
            if(name.indexOf('.')===-1) throw 'please check the argument of $action';
            else name=name.split('.');
            if(!actions[name[0]]) throw 'the model '+name[0]+' is not exist';
            if(!actions[name[0]][name[1]]) throw 'the action '+name[1]+' of model '+name[0]+' is not exist';
            actions[name[0]][name[1]](obj);
          }
        }
      });

      Vue.model.prototype={

        each:function(){},



      };

      function pathValue(statePath){
        var state = store[statePath[0]];
        if(!statePath[1]) return state;
        else {
          state=state[statePath[1]];
          if(!statePath[2] || typeof state !=='object') return state;
          else {
            state=state[statePath[2]];
            if(!statePath[3] || typeof state !=='object') return state;
            else {
              state=state[statePath[3]];
              if(!statePath[4] || typeof state !=='object') return state;
              else {
                return state[statePath[4]];
                //if(!statePath[5] || typeof state !=='object') return state;
              }
            }
          }
        }
      }

      function clone(obj){
        if(typeof obj ==='object')
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
