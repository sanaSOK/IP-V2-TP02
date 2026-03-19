<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

interface Order {
  _id?: string
  id?: string
  item: string
  quantity: number
  unitPrice?: number
}

const orders = ref<Order[]>([])
const error = ref('')
const success = ref('')

const formItem = ref('')
const formQuantity = ref<number | null>(null)
const formUnitPrice = ref<number | null>(1)

const editingId = ref<string | null>(null)
const editingItem = ref('')
const editingQuantity = ref<number | null>(null)
const editingUnitPrice = ref<number | null>(null)

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
      unitPrice: formUnitPrice.value ?? undefined,
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

function startEdit(o: Order) {
  editingId.value = o._id || o.id || null
  editingItem.value = o.item
  editingQuantity.value = o.quantity
  editingUnitPrice.value = (o as any).unitPrice ?? 1
}

function cancelEdit() {
  editingId.value = null
  editingItem.value = ''
  editingQuantity.value = null
}

async function saveEdit() {
  if (!editingId.value) return
  try {
    error.value = ''
    success.value = ''
    await api.patch(`/orders/${editingId.value}`, {
      item: editingItem.value,
      quantity: editingQuantity.value,
      unitPrice: editingUnitPrice.value ?? undefined,
    })
    success.value = 'Order updated'
    cancelEdit()
    await loadOrders()
  } catch (e: any) {
    const msg = e.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update order'
  }
}

async function deleteOrder(id: string) {
  if (!confirm('Delete this order?')) return
  try {
    error.value = ''
    success.value = ''
    await api.delete(`/orders/${id}`)
    success.value = 'Order deleted'
    await loadOrders()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to delete order'
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
        <div class="form-row" style="grid-template-columns: 1fr 1fr 1fr">
          <div class="form-group">
            <label>Item</label>
            <input v-model="formItem" type="text" placeholder="Item name" required />
          </div>
          <div class="form-group">
            <label>Quantity</label>
            <input v-model.number="formQuantity" type="number" min="1" placeholder="1" required />
          </div>
            <div class="form-group">
              <label>Unit Price</label>
              <input v-model.number="formUnitPrice" type="number" min="0" step="0.01" placeholder="1.00" />
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
            <th>Unit Price</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(o, index) in orders" :key="o._id || o.id || index">
            <td>{{ index + 1 }}</td>
            <td v-if="editingId !== (o._id || o.id)">{{ o.item }}</td>
            <td v-else>
              <input v-model="editingItem" />
            </td>
            <td v-if="editingId !== (o._id || o.id)">{{ o.quantity }}</td>
            <td v-else>
              <input v-model.number="editingQuantity" type="number" min="1" />
            </td>
            <td v-if="editingId !== (o._id || o.id)">{{ (o as any).unitPrice ?? 1 }}</td>
            <td v-else>
              <input v-model.number="editingUnitPrice" type="number" min="0" step="0.01" />
            </td>
            <td>
              <div v-if="editingId !== (o._id || o.id)">
                <button class="btn btn-secondary" @click="startEdit(o)">Edit</button>
                <button class="btn btn-danger" @click="deleteOrder(o._id || o.id || '')">Delete</button>
              </div>
              <div v-else>
                <button class="btn btn-primary" @click="saveEdit">Save</button>
                <button class="btn" @click="cancelEdit">Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
