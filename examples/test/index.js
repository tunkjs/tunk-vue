import Vue from 'vue';
import vueFlow from "./vue-flow";

Vue.use(vueFlow);

new Vue({
    el: 'body',
    components: { 
		App:require('./App.vue'),
	}
})
