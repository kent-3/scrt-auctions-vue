<template>
  <div>
      <!-- <button @click="bootstrap">Connect</button> -->
      <!-- <button @click="disconnect">Disconnect</button> -->
  </div>
  <div id="key">
      <span v-if="loading">Loading...</span>
      <button v-else-if="!isConnected" @click="bootstrap">Connect</button>
      <span v-else-if="isConnected">SCRT Balance: {{ coinConvert(balance, 6, 'human', 2)}}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { 
    getNativeCoinBalance,
    onAccountAvailable,
    bootstrap,
    shutdown,
    coinConvert
} from '@stakeordie/griptape.js'
import { EventCallback } from "@stakeordie/griptape.js"

export default defineComponent({
    setup() {
        const balance = ref<string | undefined>();
        const loading = ref<boolean>(false);
        const isConnected = ref<boolean>(false);

        async function getBalance() {
            loading.value = true;
            const result = await getNativeCoinBalance();
            balance.value = result;
            loading.value = false;
        }

        function disconnect() {
            shutdown();
            isConnected.value = false;
        }

        let stopListen: EventCallback | undefined;
        onMounted(() => {
            stopListen = onAccountAvailable(()=> {
                isConnected.value = true;
                getBalance();
            })
        });

        onUnmounted(() => {
            if (stopListen) stopListen();
            isConnected.value = false;
        })

        return {
            coinConvert,
            bootstrap,
            disconnect,
            balance,
            loading,
            isConnected
        };
    }
});
</script>