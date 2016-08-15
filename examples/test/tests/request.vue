<template>
  <test title="request" :units='units'>
	  <b>pending:{{p}} ---</b>
	  <p v-for="item in q">{{item.id}} --- {{item.status}} --- <span class="label label-info" v-for="(key,tip) in item">{{key+':'+tip}} -- </span></p>
  </test>
</template>

<script>

import Vue from 'vue';

Vue.flow.model('request',{
    default:{
        t: '',
    },
	test_jsonp: function(){
		var self = this;
		var jsonp = this.jsonp('http://search.lefeng.com/ajax/getHotKeys',function(v){if(v.data) self.dispatch({t:'jsonp'});});
	},
	test_jsonp_promise: async function(){
		var jsonp = await this.jsonp('http://search.lefeng.com/ajax/getHotKeys',function(v){});
		if(jsonp.data) return {t:'jsonp_promise'};
	},
	test_jsonp_abort: function(){
		var self = this;
		var jsonp = this.jsonp('http://search.lefeng.com/ajax/getHotKeys',function(v){},function(e){
			console.log('test_jsonp_abort',arguments);
			self.dispatch({t:'jsonp_abort'});
		});
		jsonp.xhr.abort();
	},
	test_json: function(){
		var self = this;
		var json = this.getJson('http://search.lefeng.com/ajax/getHotKeys',function(v){if(v.data) self.dispatch({t:'json'});});
	},
	test_json_promise: async function(){
		var json = await this.getJson('http://search.lefeng.com/ajax/getHotKeys',function(v){});
		if(json.data) return {t:'json_promise'};
	},
	test_json_abort: function(){
		var self = this;
		var json = this.getJson('http://search.lefeng.com/ajax/getHotKeys',function(v){},function(e){
			console.log('test_json_abort',arguments);
			self.dispatch({t:'json_abort'});
		});
		json.xhr.abort();
	},
	test_$request_model: function(){
		var self = this;
		var json = this.request({
			url:'http://search.lefeng.com/ajax/getHotKeys',
			extra:{
				timeout:3,
				success:'成功',
				error:'失败',
				pending:'加载中...',
			},
			success:function(v){},
		});
	},

});

export default {
	flow:{
		t:'request.t',
		p:'$request.pending',
		q:'$request.queue'
	},
	actions:{
		jsonp:'request.test_jsonp',
		jsonp_promise:'request.test_jsonp_promise',
		jsonp_abort:'request.test_jsonp_abort',
		json:'request.test_json',
		json_promise:'request.test_json_promise',
		json_abort:'request.test_json_abort',
		request_model:'request.test_$request_model',

	},
	data(){
		return {
			units:{
				jsonp:false,
				jsonp_abort:false,
				jsonp_promise:false,
				json:false,
				json_promise:false,
				json_abort:false,
				request_model:false,
			}
		};
	},
	watch:{
		t:function(v){
			this.$set('units.'+v,true);
		}
	},
	components:{
		test:require('./base.vue'),
	},

	ready(){
		var self = this;
		this.jsonp();
		this.jsonp_promise();
		this.jsonp_abort();
		this.json();
		this.json_promise();
		setTimeout(function(){
			self.json_abort();
		},10);
		setTimeout(function(){
			self.request_model();
		},2000);

		
	}
    

}
</script>
