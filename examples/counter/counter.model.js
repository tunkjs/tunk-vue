import Vue from 'vue';

Vue.flow.model('counter',{

    default:{
        num: {int:0},
        nnn:{nn:{n:111111111}}
    },

    add:function(opt){
		var state=this.getState();
        state.nnn.nn.n+=opt;
        this.dispatch({nnn:state.nnn});
        this.addOne();
		console.log(this.getState('text'));
        this.dispatch('text.hello');
		throw '0'
    },

    addOne:function(){
		var state=this.getState();
        state.num.int++;
		this.dispatch('text.world');
        return {num:state.num};
    },

});

