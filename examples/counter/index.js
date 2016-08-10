
import Vue from 'vue';
import VueRouter from 'vue-router';
import configureRouter from './router.config';
import editor from "vue-html5-editor";
import vueState from "utils/js/vue-state";

import 'utils/js/vue-mixin';

Vue.config.debug=true;
Vue.config.devtools=true;

Vue.use(editor, { name : "editor"});
Vue.use(VueRouter);
Vue.use(vueState);


require('model/main');

let router = new VueRouter();

configureRouter(router);

let App = Vue.extend({});

console.log('Vue.config',Vue.config);

router.start(App, '#app');


(function($this) {
    $this.rt = router;
})(window);