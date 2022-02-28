<template>
    <h1>Create an Auction</h1>
    <create-auction/>
</template>

<script lang="ts">
import CreateAuction from '@/components/CreateAuction.vue'

export default {
  components: { CreateAuction },
    name: 'Create',
    component: CreateAuction
}
</script>