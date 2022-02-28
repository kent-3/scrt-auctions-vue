<template>
    <div>
        <span id="key" v-if="hasViewingKey">Your Viewing Key is: {{ viewingKey }}</span>
        <button :disabled="loading" v-else @click="createViewingKey">Create Viewing Key</button>
    </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'
import { auctionFactory } from '@/contracts/auctions-factory'
import {
    CleanListenerCallback,
    viewingKeyManager,
    isAccountAvailable,
    onAccountAvailable
} from '@stakeordie/griptape.js'

export default defineComponent({
    setup() {
        let removeOnAccountAvailable: CleanListenerCallback | undefined;
        const viewingKey = ref<string | undefined>();
        const hasViewingKey = ref<boolean>();

        function checkHasViewingKey() {
            const vk = viewingKeyManager.get(auctionFactory.at);
            hasViewingKey.value = typeof vk !== 'undefined';
            viewingKey.value = vk;
        }

        async function createViewingKey() {
            try {
                const result = await auctionFactory.createViewingKey();
                if (result.isEmpty()) return;
                const { viewing_key: { key } } = result.parse();
                viewingKey.value = key;
                viewingKeyManager.add(auctionFactory, key);
            } finally {
                checkHasViewingKey();
            }
        }

        onMounted(()=> {
            if (isAccountAvailable()) {checkHasViewingKey();}
            else {
                removeOnAccountAvailable = onAccountAvailable( ()=> {
                    checkHasViewingKey();
                });
            }
        });

        onUnmounted(()=> {
            if (removeOnAccountAvailable)
                removeOnAccountAvailable();
        });

        return {
            viewingKey,
            hasViewingKey,
            createViewingKey
        };
    },
});
</script>

<style>

#key {
    color: #2c3e50;
    font-size: 14px;
    font-weight: bold;
}

</style>