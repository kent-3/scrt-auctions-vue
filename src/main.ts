import { createApp } from 'vue'
import App from './App.vue'

import  {
    gripApp,
    getKeplrAccountProvider
} from '@stakeordie/griptape.js'

import router from './router'

const restUrl = 'https://api.pulsar.griptapejs.com';
const provider = getKeplrAccountProvider();
function runApp() {
    createApp(App).use(router)
        .mount('#app');
}

gripApp(restUrl, provider, runApp);