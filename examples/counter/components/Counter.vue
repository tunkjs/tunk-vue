<template>
  <div>
    Clicked: {{ count }} times
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
  </div>
</template>

<script>
'use strict';
export default {
	replace:true,
    flow: {
      count: 'counter.count'
    },
	created(){
		console.log(this);
	},
    methods:{
		increment(){
			this.$action('counter.increment');
		},
		decrement(){
			this.$action('counter.decrement');
		},
		incrementIfOdd(){
			this.$action('counter.incrementIfOdd');
		},
		incrementAsync(){
			this.$action('counter.incrementAsync');
		},
	}
}
</script>
