<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <!-- Header -->
      <h1 class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Produits Disponibles</h1>

      <!-- Filtres Mobile Optimisés -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          @click="filterCategory = 'all'"
          :class="filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2"
        >
          Tous
        </button>
        <button 
          @click="filterCategory = 'favorites'"
          :class="filterCategory === 'favorites' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2"
        >
          ⭐
        </button>
        <button 
          @click="filterCategory = 'boissons'"
          :class="filterCategory === 'boissons' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2"
        >
          🥤
        </button>
        <button 
          @click="filterCategory = 'snacks'"
          :class="filterCategory === 'snacks' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2"
        >
          🍫
        </button>
      </div>

      <LoadingSpinner v-if="productsStore.loading || loadingFavorites" />

      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <p class="text-gray-400 text-lg">
          {{ filterCategory === 'favorites' ? 'Aucun produit favori' : 'Aucun produit disponible' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id"
          :product="product"
          :favorites="userFavorites"
          @consumed="handleConsumed"
          @favorite-changed="loadUserFavorites"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Navbar from '@/components/Navbar.vue'
import ProductCard from '@/components/ProductCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const productsStore = useProductsStore()
const authStore = useAuthStore()
const filterCategory = ref('all')
const userFavorites = ref([])
const loadingFavorites = ref(false)

const filteredProducts = computed(() => {
  if (!productsStore.products || productsStore.products.length === 0) {
    return []
  }

  if (filterCategory.value === 'all') {
    return productsStore.products.filter(p => p && p.id)
  }

  if (filterCategory.value === 'favorites') {
    return productsStore.products.filter(p => p && p.id && userFavorites.value.includes(p.id))
  }
  
  return productsStore.products.filter(p => p && p.id && p.category === filterCategory.value)
})

const loadUserFavorites = async () => {
  if (!authStore.user) return

  try {
    loadingFavorites.value = true
    const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
    if (userDoc.exists()) {
      userFavorites.value = userDoc.data().favorites || []
    }
  } catch (error) {
    console.error('Erreur chargement favoris:', error)
  } finally {
    loadingFavorites.value = false
  }
}

const handleConsumed = () => {
  // Plus besoin de refetch, le onSnapshot mettra à jour tout seul
  // productsStore.fetchProducts()
}

onMounted(async () => {
  productsStore.listenProducts()
  await loadUserFavorites()
})

onUnmounted(() => {
  productsStore.stopListening()
})
</script>