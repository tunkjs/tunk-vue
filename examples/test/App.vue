<template>
  <section  v-for="comp in compons">
    <component :is='comp'></component>
  </section>
</template>

<style scoped>
	section{
		padding:20px;
		margin:5px;
		background-color:#eee;
	}
</style>
<script>





var compons = require('./components/main');
console.log(compons);
export default {

	data(){
		return {
			compons:Object.keys(compons),
		};
	},

	components:compons,

	created(){
		console.log(compons);
	},

    
}
</script>
