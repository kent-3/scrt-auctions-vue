<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/wallet">Wallet</router-link> |
    <router-link to="/auctions">Auctions</router-link> |
    <router-link to="/create">Create</router-link> |
    <router-link to="/about">About</router-link> |
    powered by griptape.js! 🛹
  </div>
  <div>
    <br>
    <scrt-balance/>
    <create-viewing-key/>
  </div>
  <router-view/>

  
</template>

<script lang="ts">
import CreateViewingKey from '@/components/CreateViewingKey.vue'
import ScrtBalance from './components/ScrtBalance.vue'
import { bootstrap, shutdown, onAccountAvailable } from '@stakeordie/griptape.js'

export default {
  components: {CreateViewingKey, ScrtBalance},
  setup(){
    return{
      bootstrap,
      shutdown,
      onAccountAvailable,
    }
  }
}
</script>


<style>

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  padding: 0.5%;
}

#nav {
  padding: 0px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>
