<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

interface Receipt {
  _id: string
  issuedAt: string
  name: string
  price: number
}

const receipts = ref<Receipt[]>([])
const error = ref('')
const success = ref('')

// Form fields
const formName = ref('')
const formPrice = ref<number | null>(null)
const formDate = ref('')

// Edit state
const editingId = ref<string | null>(null)
const editName = ref('')
const editPrice = ref<number | null>(null)
const editDate = ref('')

async function loadReceipts() {
  try {
    error.value = ''
    const { data } = await api.get('/receipts')
    receipts.value = data
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load receipts'
  }
}

async function createReceipt() {
  try {
    error.value = ''
    success.value = ''
    await api.post('/receipts', {
      name: formName.value,
      price: formPrice.value,
      issuedAt: formDate.value || new Date().toISOString(),
    })
    formName.value = ''
    formPrice.value = null
    formDate.value = ''
    success.value = 'Receipt created!'
    await loadReceipts()
  } catch (e: any) {
    const msg = e.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to create receipt'
  }
}

function startEdit(r: Receipt) {
  editingId.value = r._id
  editName.value = r.name
  editPrice.value = r.price
  editDate.value = r.issuedAt.slice(0, 10)
}

function cancelEdit() {
  editingId.value = null
}

async function saveEdit(id: string) {
  try {
    error.value = ''
    success.value = ''
    await api.patch(`/receipts/${id}`, {
      name: editName.value,
      price: editPrice.value,
      issuedAt: editDate.value,
    })
    editingId.value = null
    success.value = 'Receipt updated!'
    await loadReceipts()
  } catch (e: any) {
    const msg = e.response?.data?.message
    error.value = Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to update receipt'
  }
}

async function deleteReceipt(id: string) {
  if (!confirm('Delete this receipt?')) return
  try {
    error.value = ''
    success.value = ''
    await api.delete(`/receipts/${id}`)
    success.value = 'Receipt deleted!'
    await loadReceipts()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to delete receipt'
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString()
}

function formatPrice(price: number) {
  return price.toFixed(2)
}

onMounted(loadReceipts)
</script>

<template>
  <div>
    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <!-- Create Form -->
    <div class="card">
      <h2>New Receipt</h2>
      <form @submit.prevent="createReceipt">
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input v-model="formName" type="text" placeholder="Receipt name" required />
          </div>
          <div class="form-group">
            <label>Price</label>
            <input v-model.number="formPrice" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>
          <div class="form-group">
            <label>Date</label>
            <input v-model="formDate" type="date" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary">Create Receipt</button>
      </form>
    </div>

    <!-- Receipts Table -->
    <div class="card">
      <h2>All Receipts</h2>
      <div v-if="receipts.length === 0" class="empty-state">
        No receipts yet. Create one above!
      </div>
      <table v-else>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in receipts" :key="r._id">
            <template v-if="editingId === r._id">
              <td><input v-model="editName" type="text" /></td>
              <td><input v-model.number="editPrice" type="number" step="0.01" min="0" /></td>
              <td><input v-model="editDate" type="date" /></td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-primary btn-sm" @click="saveEdit(r._id)">Save</button>
                  <button class="btn btn-sm" @click="cancelEdit" style="background:#6b7280;color:#fff">Cancel</button>
                </div>
              </td>
            </template>
            <template v-else>
              <td>{{ r.name }}</td>
              <td>${{ formatPrice(r.price) }}</td>
              <td>{{ formatDate(r.issuedAt) }}</td>
              <td>
                <div class="btn-group">
                  <button class="btn btn-primary btn-sm" @click="startEdit(r)">Edit</button>
                  <button class="btn btn-danger btn-sm" @click="deleteReceipt(r._id)">Delete</button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
