<template>
  <section class="alert alert-success" role="alert">
    
	<h4>
			<i class="fa {{ok?'fa-check-circle':'fa-times-circle'}}"></i> {{title}}
	</h4>
	<span class="pull-right">
    	<span class="label {{item?'label-success':'label-danger'}}" v-for='(key, item) in units'>{{key}}</span>
	</span>
	<div>
		<slot></slot>
	</div>
  </section>
</template>
<style>
	section{
		margin:5px;
		overflow:hidden;
		margin-bottom:5px !important;
	}
	h4{
		display:inline;
		
	}
	span.label{
		margin:5px;
		font-size:12px;
		font-weight:normal;
	}
	div{
		margin:5px;
	}
</style>
<script>


export default {
	props:{
		title:'',
		units:[],
	},
	data(){
		return {
			ok:false,
		}
	},
	ready(){

		var units=this.units;


		for(var x in units){
			if(!units[x]) {
				this.$set('ok',false);
				return;
			}
		}
		this.$set('ok',true);
	}
}
</script>
