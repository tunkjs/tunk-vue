
import Vue from 'vue';
import vueState from "./vue-flow";
import App from "./index.vue";

//Vue.config.debug=true;

Vue.use(vueState);

require('./text.model');
require('./counter.model');
//
//var pro=new Promise(function(resolve,reject){
//    setTimeout(function(){
//        resolve(1);
//    },2000);
//});
//
//var func= async function(){
//    var a= await pro;
//    alert(a);
//};

new Vue({
    el: 'body',
    components: { App }
})