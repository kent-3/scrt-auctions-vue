<template>
  <span v-if="mounting"><h2>Querying...</h2></span>
  
  <ul>
    <li v-for="auction in activeAuctions" :key="auction.address">
      {{ auction.pair }}
      <router-link @click.prevent="viewMore(auction.address)" :to="{ path: `/auctions/${auction.address}`}">
      <button :disabled="loading">View More</button></router-link>
    </li>
  </ul>

  <div v-if="auctionInfo">
    <p><span style="text-decoration: underline; font-weight: bold;">Auction Info:</span></p>

      <button @click="closeAuction" :disabled="loading">Close Auction</button>

      <div>
        <button @click="checkHasBids">Check Bids</button>
        <p v-if="hasBids">This auction has bids</p>
      </div>

      <form @submit.prevent="placeBid">
        <input type="text" v-model="bid" placeholder="Amount">
        <button :disabled="loading">Place Bid</button>
      </form>

      <form @submit.prevent="changeMinimumBid">
        <input type="text" v-model="newMinimumBid" placeholder="Amount">
        <button :disabled="loading">Change Minimum Bid</button>
      </form>

      <dl>
        <dt>Contract Address:</dt>
        <dd style="font-weight: bold;">{{ auctionInfo.auction_address }}</dd>
        <dt>Ends at:</dt> <dd>{{ auctionInfo.ends_at }}</dd>
        <dt>Status:</dt> <dd>{{ auctionInfo.status }}</dd>
        <dt>Sell Token:</dt> <dd>{{ auctionInfo.sell_token.token_info.name }} (your balance: {{ sellBalance }})</dd>
        <dt>Sell Amount:</dt> <dd>{{ sellAmount }}</dd>
        <dt>Bid Token:</dt> <dd>{{ auctionInfo.bid_token.token_info.name }} (your balance: {{ bidBalance }})</dd>
        <dt>Minimum Bid:</dt> <dd>{{ minimumBid }}</dd>
      </dl>

  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  computed
} from 'vue';
import { useRoute } from "vue-router";
import {
  createContractClient,
  refContract,
  EventCallback,
  isAccountAvailable,
  onAccountAvailable,
  coinConvert,
  Snip20Contract,
  snip20Def,
  viewingKeyManager,
} from '@stakeordie/griptape.js';
import { auctionFactory, Auction } from '../contracts/auctions-factory';
import { auctionDef, AuctionContract, AuctionInfo, Token } from '../contracts/auction';

export default defineComponent({
  
  setup() {
    let stopListen: EventCallback | undefined;
    let sellToken: Token;
    let bidToken: Token;
    let auctionAddress: string;
    const route = useRoute();
    const activeAuctions = ref<Auction[]>([]);
    const auctionInfo = ref<AuctionInfo>();
    const sellBalance = ref<string | undefined>();
    const bidBalance = ref<string | undefined>();
    const newMinimumBid = ref<string | undefined>();
    const mounting = ref<boolean>(true);
    const loading = ref<boolean>(false);
    const bid = ref<string | undefined>();
    const hasBids = ref<boolean | undefined>();
    const isOwner = ref<boolean>(false);

    async function listActiveAuctions() {
      const { list_active_auctions: { active: result } }
      = await auctionFactory.listActiveAuctions();
      activeAuctions.value = result;
      initAuctionContracts(activeAuctions.value)
      mounting.value = false;
    }

    function initAuctionContracts(auctions: Auction[]) {
      const addresses = auctions.map(it => it.address);
      addresses.forEach(it => {
        createContractClient<AuctionContract>({
          id: it,
          at: it,
          definition: auctionDef
        });
      });
    }

    function initTokenContracts(tokens: Token[]) {
      const addresses = tokens.map(it => it.contract_address);
      addresses.forEach(it => {
        createContractClient<Snip20Contract>({
          id: it,
          at: it,
          definition: snip20Def
        });
      });
    }
    

    async function viewMore(address:string) {
      loading.value = true;
      const contract = refContract<AuctionContract>(address);
      const { auction_info:result } = await contract.getAuctionInfo();
      auctionInfo.value = result;
      loading.value = false;

      auctionAddress = route.params.address as string;

      sellToken = auctionInfo.value.sell_token;
      bidToken = auctionInfo.value.bid_token;

      initTokenContracts([sellToken, bidToken]);

      const { sell_token: { contract_address: sell_address, token_info: { decimals: sell_decimals} } } = auctionInfo.value;
      const { bid_token: { contract_address: bid_address, token_info: { decimals: bid_decimals}  } } = auctionInfo.value;

      const sellContract = refContract<Snip20Contract>(sell_address);
      const bidContract = refContract<Snip20Contract>(bid_address); 

      const { balance: { amount: sellBalanceResult } } = await sellContract.getBalance();
      const { balance: { amount: bidBalanceResult } } = await bidContract.getBalance();

      sellBalance.value = coinConvert(sellBalanceResult, sell_decimals, 'human', sell_decimals);
      bidBalance.value = coinConvert(bidBalanceResult, bid_decimals, 'human', bid_decimals);
      console.log(auctionAddress);
      console.log(sellToken);
      console.log(bidToken);
      return{sellToken, bidToken, auctionAddress};
      
    }

    async function changeMinimumBid() {
      if (!auctionInfo.value || !newMinimumBid.value) return;
      const decimals = auctionInfo.value.bid_token.token_info.decimals;
      const amount = coinConvert(newMinimumBid.value, decimals, 'machine');
      const address = auctionAddress;
      const contract = refContract<AuctionContract>(address);
      loading.value = true;
      try {
        await contract.changeMinimumBid(amount)
      } finally {
        newMinimumBid.value = '';
        loading.value = false;
        
        await viewMore(address);
      }
    }

    async function checkHasBids() {
      const address = auctionAddress;
      const contract = refContract<AuctionContract>(address);
      const vk = viewingKeyManager.get(auctionFactory.at);
      if (!vk) return alert("You don't have a viewing key!");
      const result = await contract.hasBids(vk);    
      const { has_bids:{ has_bids } } = result;
      hasBids.value = has_bids;
    }

    async function placeBid() {
      if (!auctionInfo.value || !bid.value) return;
      const contract = refContract<Snip20Contract>(bidToken.contract_address);
      const decimals = auctionInfo.value.bid_token.token_info.decimals;
      const amount = coinConvert(bid.value, decimals, 'machine');

      loading.value = true;
      try {
        await contract.send(auctionAddress, amount);
      } finally {
        bid.value = '';
        loading.value = false;
        await viewMore(auctionAddress);
      }
    }

    async function closeAuction() {
      try {
        loading.value = true;
        const contract = refContract<AuctionContract>(auctionAddress);
        await contract.closeAuction();
      } finally {
        loading.value = false;
      }
    }

    onMounted(()=> {
      listActiveAuctions();
    })

    onUnmounted( ()=> {
        if (stopListen) stopListen();
    })

    const sellAmount = computed(()=> {
      if (!auctionInfo.value) return;
      const { sell_amount, sell_token: { token_info: { decimals } } } = auctionInfo.value
      return coinConvert(sell_amount, decimals, 'human', decimals);
    })

    const minimumBid = computed(()=> {
      if (!auctionInfo.value) return;
      const { minimum_bid, bid_token: { token_info: { decimals } } } = auctionInfo.value
      return coinConvert(minimum_bid, decimals, 'human', decimals);
    })

    return {
      mounting,
      activeAuctions,
      auctionInfo,
      sellAmount,
      sellBalance,
      minimumBid,
      newMinimumBid,
      bidBalance,
      bid,
      hasBids,
      loading,
      checkHasBids,
      placeBid,
      changeMinimumBid,
      viewMore,
      closeAuction
    }
  }
});
</script>