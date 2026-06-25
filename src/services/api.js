import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'http://34.162.105.49/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    console.error('API Netzwerkfehler:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export default {
  runMeanReversion(payload) {
    return apiClient.post('/strategy/mean-reversion', payload)
  },
  runMoneyManagement(payload) {
    return apiClient.post('/strategy/mean-reversion/money-management', payload)
  },
  runOptimizer(payload) {
    return apiClient.post('/strategy/optimize/grid-search', payload)
  },
  runMoneyManagementGridSearch(payload) {
    return apiClient.post('/strategy/optimize/money-management/grid-search', payload)
  },
  runMoneyManagementRandomized(payload) {
    return apiClient.post('/strategy/optimize/money-management/randomized-grid-search', payload)
  },
  getPrediction(payload) {
    return apiClient.post('/predictions/predict', payload)
  }
}