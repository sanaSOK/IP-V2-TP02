<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

interface Order {
  id?: number
  item: string
  quantity: number
}

const orders = ref<Order[]>([])
const error = ref('')
const success = ref('')

const formItem = ref('')
const formQuantity = ref<number | null>(null)

async function loadOrders() {
  try {
    error.value = ''
    const { data } = await api.get('/orders')
    orders.value = data
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load orders'
  }
}

async function createOrder() {
  try {
    error.value = ''
    success.value = ''
    await api.post('/orders', {
      item: formItem.value,
      quantity: formQuantity.value,
    })
    formItem.value = ''
    formQuantity.value = null
    success.value = 'Order created!'
    await loadOrders()
  } catch (e: any) {
    const msg = e.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create order'
  }
}

onMounted(loadOrders)
</script>

<template>
  <div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <!-- Create Form -->
    <div class="card">
      <h2>New Order</h2>
      <form @submit.prevent="createOrder">
        <div class="form-row" style="grid-template-columns: 1fr 1fr">
          <div class="form-group">
            <label>Item</label>
            <input v-model="formItem" type="text" placeholder="Item name" required />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input v-model.number="formQuantity" type="number" min="1" placeholder="1" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Create Order</button>
      </form>
    </div>

    <!-- Orders Table -->
    <div class="card">
      <h2>All Orders</h2>
      <div v-if="orders.length === 0" class="empty-state">
        No orders yet. Create one above!
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, index) in orders" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ o.item }}</td>
            <td>{{ o.quantity }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
