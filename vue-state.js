(function () {

  var vueState = {
    install: function (Vue, opt) {
      var store = {}, actions = {},listeners=[];
      Vue.model = function (name, opts) {
        if(!name||!opts) throw 'at least two arguments are required';
        if(typeof opts.default !== 'object') throw 'please set an default object-type property to be the default data of the model';

        store[name] = clone(opts.default);

        for(var x in opts) if(opts.hasOwnProperty(x) && x!='default'){

          actions[name+'.'+x]=(function(modelName,actionName){

            return function(options){
              //console.time('action');
              opts[actionName](clone(store[modelName]), dispatch, options);
              //console.timeEnd('action');
            };

            function dispatch(name,obj){
              if(arguments.length===1){
                obj=name;
                var state=store[modelName], handlers=listeners[modelName], changedFields = Object.keys(obj);
                //合并到store
                Object.assign(state,clone(obj));
  
                for(var i=0,l=handlers.length; i<l; i++) if(handlers){
                  // 第2层根据changedFields判断是否有更新，过滤一把
                  if(handlers[i].paths[1]&& changedFields.indexOf(handlers[i].paths[1])===-1) continue;
                  handlers[i].comp.$set(handlers[i].data, handlers[i].pathValue(store));
  
                }
              }else if(arguments.length===2){
                if(name.indexOf('.')===-1) name=modelName+'.'+name;
                actions[name](obj);
              }
            }

          })(name,x);
        }
      };

      Vue.mixin({

        init() {
          if(this.$options.state){
            for(var x in this.$options.state) if(this.$options.state.hasOwnProperty(x)){
              var statePath=this.$options.state[x].split('.');
              listeners[statePath[0]]=listeners[statePath[0]]||[];
              listeners[statePath[0]].push({
                comp:this,
                data:x,
                paths:statePath,
                pathValue:(function(statePath){
                  //效率，支持路径层数为5
                  return function(store){
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
                  };
                })(statePath),
              });

              //设置组件默认数据
              Vue.util.defineReactive(this, x, listeners[statePath[0]][listeners[statePath[0]].length-1].pathValue(store))
              this.$set(x, listeners[statePath[0]][listeners[statePath[0]].length-1].pathValue(store));
            }
          }

        },
        beforeDestroy(){
          if(this.$options.state){
            var statePath,tmp;
            for(var x in this.$options.state) if(this.$options.state.hasOwnProperty(x)){
              statePath=this.$options.state[x].split('.');
              tmp=[];
              for(var i=0, l=listeners[statePath[0]].length; i<l; i++){
                if(listeners[statePath[0]][i].comp!==this) tmp.push(listeners[statePath[0]][i]);
                else console.log('beforeDestroy demaged-',this);
              }
              listeners[statePath[0]]=tmp;
              this.$data[x]=null;
            }
          }
        },
        methods:{
          $action:function(name,opts){
            actions[name](opts);
          }
        }
      });


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
function clone(obj){
  if(typeof obj ==='object')
    return JSON.parse(JSON.stringify(obj));
  else return obj;
}
})();








