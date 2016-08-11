import Vue from 'vue';

Vue.flow.model('text', {

    default: {
        text: '',
    },

    hello: function (opt) {
        this.dispatch({ text: 'hello' });
    },
	world: function (opt) {
        this.dispatch({ text: 'world' });
    },

});

