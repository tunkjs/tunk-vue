import Vue from 'vue';
import vueFlow from "vue-flow";
import App from "./compenents/app.vue";

Vue.use(vueFlow);

require('./models/text');
require('./models/counter');

new Vue({
    el: 'body',
    components: { App }
})