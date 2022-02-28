<template>
  <div class="wallet">
    <h1>SNIP-20 Wallet</h1>
    
    <token-balance/>
  </div>
</template>

<script lang="ts">
import TokenBalance from '@/components/TokenBalance.vue'
import { bootstrap, shutdown, EventCallback, onAccountAvailable }from '@stakeordie/griptape.js'

export default {
  name: 'Wallet',
  components: {
    TokenBalance
  },
  setup(){
    return{
      bootstrap
    }
  }
}
</script>