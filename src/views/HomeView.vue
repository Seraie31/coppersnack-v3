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
  // Vérification stricte des produits
  if (!productsStore.products || productsStore.products.length === 0) {
    return []
  }

  let filtered = []

  if (filterCategory.value === 'all') {
    // Filtrer TOUS les produits valides avec TOUTES les propriétés requises
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number'
    )
  } else if (filterCategory.value === 'favorites') {
    // Filtrer favoris valides
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number' &&
      userFavorites.value.includes(p.id)
    )
  } else {
    // Filtrer par catégorie
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number' &&
      p.category === filterCategory.value
    )
  }

  // Tri : favoris d'abord, puis les autres
  return filtered.sort((a, b) => {
    const aIsFav = userFavorites.value.includes(a.id) ? 1 : 0
    const bIsFav = userFavorites.value.includes(b.id) ? 1 : 0
    return bIsFav - aIsFav  // favoris (1) avant non-favoris (0)
  })
})

const loadUserFavorites = async () => {
  if (!authStore.user) {
    userFavorites.value = []
    return
  }

  try {
    loadingFavorites.value = true
    const userDoc = await getDoc(doc(db, 'users', authStore.user.uid))
    if (userDoc.exists()) {
      userFavorites.value = userDoc.data().favorites || []
    } else {
      userFavorites.value = []
    }
  } catch (error) {
    console.error('Erreur chargement favoris:', error)
    userFavorites.value = []
  } finally {
    loadingFavorites.value = false
  }
}

const handleConsumed = () => {
  // Le onSnapshot met à jour automatiquement
}

onMounted(async () => {
  productsStore.listenProducts()
  await loadUserFavorites()
})

onUnmounted(() => {
  productsStore.stopListening()
})
</script>