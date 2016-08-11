
import Vue from 'vue';
import VueRouter from 'vue-router';
import configureRouter from './router.config';
import vueState from "../../vue-state";


Vue.config.debug=true;
Vue.config.devtools=true;

Vue.use(VueRouter);
Vue.use(vueState);


require('./text.model');
require('./counter.model');

let router = new VueRouter();

configureRouter(router);

let App = Vue.extend({});

router.start(App, '#app');
