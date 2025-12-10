import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, getDocs, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase/config'

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const loading = ref(false)
  const unsubscribe = ref(null)

  // Lecture ponctuelle (tu peux la garder si besoin)
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

  // 🔴 Abonnement temps réel
  const listenProducts = () => {
    if (unsubscribe.value) return // déjà abonné

    loading.value = true

    const q = query(collection(db, 'products'), orderBy('name'))

    unsubscribe.value = onSnapshot(
      q,
      snapshot => {
        products.value = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        loading.value = false
      },
      error => {
        console.error('Erreur abonnement produits:', error)
        loading.value = false
      }
    )
  }

  const stopListening = () => {
    if (unsubscribe.value) {
      unsubscribe.value()
      unsubscribe.value = null
    }
  }

  return {
    products,
    loading,
    fetchProducts,
    listenProducts,
    stopListening
  }
})
