import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'
import Wallet from '../views/Wallet.vue'
import Auctions from '../views/Auctions.vue'
import Create from '../views/Create.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/wallet',
    name: 'Wallet',
    component: Wallet
  },
  {
    path: '/auctions',
    name: 'Auctions',
    component: Auctions
  },
  {
    path: '/auctions/:address',
    name: 'specific auction',
    component: Auctions
  },
  {
    path: '/create',
    name: 'Create',
    component: Create
  }
  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
