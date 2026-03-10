import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'x-api-key': 'itc-123',
  },
})

export default api
