<template>
    <h1>Active Auctions</h1>
    <div>
        <active-auctions/>
    </div>
</template>


<script lang="ts">
import ActiveAuctions from "../components/ActiveAuctions.vue"

export default {
  name: 'Auctions',
  components: {
    ActiveAuctions
  }
}

</script>