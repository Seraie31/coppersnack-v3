import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)

  const fetchProducts = async () => {
    try {
      loading.value = true
      const snapshot = await getDocs(collection(db, 'products'))
      products.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Erreur chargement produits:', error)
      products.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    fetchProducts
  }
})
