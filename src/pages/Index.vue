<template>
  <h1>Secret Auctions</h1>
  <button @click="bootstrap">Connect</button>

  <scrt-balance/>
  <token-balance/>

  <ul>
    <li v-for="auction in activeAuctions" :key="auction.address">
      {{ auction.pair }}
      <button @click="viewMore(auction.address)">View More</button>
      </li>
  </ul>

  <div v-if="auctionInfo">
    <h2>{{ auctionInfo.auction_address }}</h2>
    <p>{{ auctionInfo.description }}</p>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  ref
} from 'vue';
import {
  bootstrap,
  createContract,
  refContract,
} from '@stakeordie/griptape.js';
import { auctionFactory, Auction } from '../contracts/auctions-factory';
import { auctionDef, AuctionContract, AuctionInfo } from '../contracts/auction';
import ScrtBalance from '../components/ScrtBalance.vue'
import TokenBalance from '../components/TokenBalance.vue'

export default defineComponent({
  components: { ScrtBalance, TokenBalance },

  setup() {
    const activeAuctions = ref<Auction[]>([]);
    const auctionInfo = ref<AuctionInfo>();

    async function listActiveAuctions() {
      const { list_active_auctions: { active: result } }
      = await auctionFactory.listActiveAuctions();
      activeAuctions.value = result;

      initAuctionContracts(activeAuctions.value)
    }

    function initAuctionContracts(auctions: Auction[]) {
      const addresses = auctions.map(it => it.address);
      addresses.forEach(it => {
        createContract<AuctionContract>({
          id: it,
          at: it,
          definition: auctionDef
        });
      });
    }

    async function viewMore(address:string) {
      const contract = refContract<AuctionContract>(address);
      const { auction_info:result } = await contract.getAuctionInfo();
      auctionInfo.value = result;
    }

    onMounted( ()=> {
      listActiveAuctions()
    });

    return {
      activeAuctions,
      auctionInfo,
      bootstrap,
      viewMore
    }
  }
});
</script>