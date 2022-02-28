<template>
    <form @submit.prevent="createAuction">
        <label>Sell Token</label>
        <select v-model="form.sellContract" @change="createSellTokenClient">
            <option value="">---</option>
            <option
                v-for="token in tokens"
                :key="token.address"
                :value="token.address"
            >
                {{ token.symbol }}
            </option>
        </select>

        <input type="text" placeholder="Sell Amount" v-model="form.sellAmount">

        <label>Bid Token</label>
        <select v-model="form.bidContract">
            <option value="">---</option>
            <option
                v-for="token in tokens"
                :key="token.address"
                :value="token.address"
            >
                {{ token.symbol }}
            </option>
        </select>

        <input type="text" placeholder='Minimum Bid' v-model="form.minimumBid">

        <label>Ends at</label>
        <input type="datetime-local" v-model="form.endsAt">

        <label>Description</label>
        <textarea v-model="form.description"></textarea>

        <button :disabled="loading">Create Auction</button>
    </form>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { CreateAuctionForm, auctionFactory } from '../contracts/auctions-factory'
import tokens from '@/data/tokens.json'
import { createContractClient, refContract, Snip20Contract, snip20Def } from '@stakeordie/griptape.js';
import { formatAmountforToken } from '@/utils';
import { useRouter } from 'vue-router'

export default defineComponent({
    setup() {
        const router = useRouter();
        const form = ref<CreateAuctionForm>({
            sellContract: '',
            sellAmount: '',
            bidContract: '',
            minimumBid: '',
            endsAt: '',
            description: ''
        });

        const loading = ref(false);

        function createSellTokenClient() {
            const contractAddress = form.value.sellContract;
            console.log(contractAddress);
            createContractClient({
                id: contractAddress,
                at: contractAddress,
                definition: snip20Def
            }) 
        }

        async function createAuction() {
            const theForm = form.value;
            const sellContract = refContract<Snip20Contract>(theForm.sellContract);
            const sellAmount = formatAmountforToken(theForm.sellContract, theForm.sellAmount);
            loading.value = true;
            try {
                await sellContract.increaseAllowances(auctionFactory.at , sellAmount);
                await auctionFactory.createAuction(theForm);
            } finally {
                loading.value = false;
                router.push({ path: '/' });
            }
        }

        return {
            form,
            tokens,
            loading,
            createAuction,
            createSellTokenClient
        }
    }
})
</script>

<style scoped>
form {
    display: grid;
    max-width: 250px;
    grid-row-gap: 12px;
}
</style>