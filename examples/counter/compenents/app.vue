<template>
		<button @click.stop='addOne'>
			----{{n}}  ----{{nn.n}} ----{{text}}
		</button>
</template>

<style scoped>

</style>

<script>
	'use strict';
	export default {
		flow:{
			n:'counter.num.int',
			num:'counter.num',
			nn:'counter.nnn.nn',
			text:'text.text'
		},
		replace: true,

		beforeFlowIn(data){

		},

		methods:{
			add(){
				this.$action('counter.add',100);
			},
			addOne(){
				this.$action('counter.addOne');
			}
		},
	}
</script>
