<template>
    <div>
      <button @click="getBalances">Get Balances</button>
      <div v-for="token in tokens" :key="token.address">
        <div v-if="vks[token.symbol]">
          <!-- TODO: add token image files
          <img style="width: 25px; border-radius: 50%;"
            :src="`/assets/images/${token.symbol}.png`" :alt="`${token.symbol}` "> -->
          <span>{{ token.symbol }}</span>
          &nbsp;&nbsp;
          <span>{{ coinConvert(balances[token.symbol],token.decimals,'human') }}</span>
        </div>
        <button v-else @click="createViewingKey(token)">Get Viewing Key for {{token.symbol}}</button>
      </div>
    </div>
</template>

<script lang="ts">
import {
  createContractClient,
  snip20Def,
  Snip20Contract,
  refContract,
  keplrViewingKeyManager,
  onAccountAvailable,
  EventCallback,
  coinConvert
} from '@stakeordie/griptape.js'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import tokenInfo from '../data/tokens.json'

interface Token {
  name: string;
  label: string;
  address: string;
  symbol: string;
  decimals: number;
}

export default defineComponent({
  setup() {
    const balances = ref<{ [key: string]: string }>({});
    const vks = ref<{ [key: string]: boolean}>({});
    const tokens = ref<Token[]>(tokenInfo);
    let stopListen: EventCallback | undefined;

    function initContracts() {
      tokens.value.forEach((token: Token) => {
        createContractClient({
          id: token.symbol,
          at: token.address,
          definition: snip20Def
        });
      });
    }

    async function getBalances() {
      const promises = tokens.value
        .filter(token => keplrViewingKeyManager.get(token.address))
        .map(token => {
          const contract = refContract<Snip20Contract>(token.address);
          return contract.getBalance();
      });

      const result = await Promise.allSettled(promises);
      const balancesResult = result
        .filter(token => token.status === 'fulfilled')
        // @ts-ignore
        .map(token => token.value.balance.amount);
      
      tokens.value.forEach((token, idx) => {
        if (hasViewingKey(token.address)) {
          vks.value[token.symbol]=true;
        }
        balances.value[token.symbol] =
          balancesResult[idx];
      });
    }

    function hasViewingKey(address: string) {
      const vk = keplrViewingKeyManager.get(address);
      return typeof vk !== 'undefined';
    }

    async function createViewingKey(token: Token) {
      const contract = refContract<Snip20Contract>(token.address);
      await keplrViewingKeyManager.add(contract);
      vks.value[token.symbol] = true;
      const result = await contract.getBalance();
      balances.value[token.symbol] = result.balance.amount;
    }

    onMounted( () => {
      initContracts();

      stopListen = onAccountAvailable( ()=> {
        getBalances();
      });
    });

    onUnmounted( ()=> {
      if (stopListen) stopListen();
    });

    return {
      getBalances,
      balances,
      tokens,
      vks,
      hasViewingKey,
      createViewingKey,
      coinConvert,
    };
  }
})
</script>