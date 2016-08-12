import Vue from 'vue';
import vueFlow from "./vue-flow";
import promiseMiddleware from "./vue-flow-promise-middleware";
import functionMiddleware from "./vue-flow-function-middleware";

Vue.use(vueFlow);

Vue.flow.addMiddleware([functionMiddleware,promiseMiddleware]);

new Vue({
    el: 'body',
    components: { 
		App:require('./App.vue'),
	}
})
