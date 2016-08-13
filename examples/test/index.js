import Vue from 'vue';
import vueFlow from "./vue-flow";
import promiseMiddleware from "./middlewares/promise/vue-flow-promise-middleware";
import functionMiddleware from "./middlewares/function/vue-flow-function-middleware";
import actionMiddleware from "./middlewares/action/vue-flow-action-middleware";



Vue.use(vueFlow);

Vue.flow.addMiddleware([actionMiddleware, functionMiddleware, promiseMiddleware]);

new Vue({
    el: 'body',
    components: { 
		App:require('./App.vue'),
	}
})
