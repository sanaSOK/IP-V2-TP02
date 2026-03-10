import { createRouter, createWebHistory } from 'vue-router'
import ReceiptsView from './views/ReceiptsView.vue'
import OrdersView from './views/OrdersView.vue'

const routes = [
  { path: '/', redirect: '/receipts' },
  { path: '/receipts', name: 'Receipts', component: ReceiptsView },
  { path: '/orders', name: 'Orders', component: OrdersView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
