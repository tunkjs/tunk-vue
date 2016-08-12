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

export default {
    flow: {
      count: 'counter.count'
    },

	action:{
		increment:'counter.increment',
		decrement:'counter.decrement',
		incrementIfOdd:'counter.incrementIfOdd',
		incrementAsync:'counter.incrementAsync',
	},
    
}
</script>
