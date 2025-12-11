<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <!-- Header avec compteur -->
      <div class="flex items-center justify-between mb-4 sm:mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold">Produits Disponibles</h1>
        <span class="text-sm sm:text-base text-gray-400">
          {{ filteredProducts.length }} produit{{ filteredProducts.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Barre de recherche -->
      <div class="mb-4">
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Rechercher un produit..."
            class="w-full bg-dark-200 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-3 top-3 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Filtres avec icônes et compteurs -->
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          @click="filterCategory = 'all'"
          :class="filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2 flex items-center justify-center gap-2"
        >
          <span>Tous</span>
          <span class="text-xs opacity-75">({{ getCategoryCount('all') }})</span>
        </button>
        <button 
          @click="filterCategory = 'favorites'"
          :class="filterCategory === 'favorites' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2 flex items-center justify-center gap-2"
        >
          <span>⭐</span>
          <span class="text-xs opacity-75">({{ userFavorites.length }})</span>
        </button>
        <button 
          @click="filterCategory = 'boissons'"
          :class="filterCategory === 'boissons' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2 flex items-center justify-center gap-2"
        >
          <span>🥤</span>
          <span class="text-xs opacity-75">({{ getCategoryCount('boissons') }})</span>
        </button>
        <button 
          @click="filterCategory = 'snacks'"
          :class="filterCategory === 'snacks' ? 'btn-primary' : 'btn-secondary'"
          class="flex-1 min-w-[80px] text-sm sm:text-base px-3 py-2 flex items-center justify-center gap-2"
        >
          <span>🍫</span>
          <span class="text-xs opacity-75">({{ getCategoryCount('snacks') }})</span>
        </button>
      </div>

      <!-- Tri -->
      <div class="flex items-center gap-2 mb-4">
        <span class="text-sm text-gray-400">Trier par :</span>
        <select
          v-model="sortBy"
          class="bg-dark-200 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="favorites">Favoris d'abord</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="stock-asc">Stock croissant</option>
          <option value="stock-desc">Stock décroissant</option>
          <option value="name">Nom (A-Z)</option>
        </select>
      </div>

      <LoadingSpinner v-if="productsStore.loading || loadingFavorites" />

      <!-- Message si aucun résultat -->
      <div v-else-if="filteredProducts.length === 0" class="text-center py-12">
        <div class="text-6xl mb-4">{{ getEmptyStateEmoji() }}</div>
        <p class="text-gray-400 text-lg mb-2">{{ getEmptyStateMessage() }}</p>
        <button
          v-if="searchQuery || filterCategory !== 'all'"
          @click="resetFilters"
          class="btn-secondary mt-4"
        >
          Réinitialiser les filtres
        </button>
      </div>

      <!-- Grille de produits avec animation -->
      <TransitionGroup
        v-else
        name="product-list"
        tag="div"
        class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
      >
        <ProductCard 
          v-for="product in filteredProducts" 
          :key="product.id"
          :product="product"
          :favorites="userFavorites"
          @consumed="handleConsumed"
          @favorite-changed="loadUserFavorites"
        />
      </TransitionGroup>

      <!-- Bouton scroll to top (si > 6 produits) -->
      <button
        v-if="filteredProducts.length > 6 && showScrollTop"
        @click="scrollToTop"
        class="fixed bottom-6 right-6 w-12 h-12 bg-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-40"
      >
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
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
const searchQuery = ref('')
const sortBy = ref('favorites')
const userFavorites = ref([])
const loadingFavorites = ref(false)
const showScrollTop = ref(false)

// Détection du scroll pour le bouton "retour en haut"
const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const filteredProducts = computed(() => {
  if (!productsStore.products || productsStore.products.length === 0) {
    return []
  }

  let filtered = []

  // Filtrage par catégorie
  if (filterCategory.value === 'all') {
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number'
    )
  } else if (filterCategory.value === 'favorites') {
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number' &&
      userFavorites.value.includes(p.id)
    )
  } else {
    filtered = productsStore.products.filter(p => 
      p && 
      p.id && 
      p.name && 
      typeof p.price === 'number' &&
      typeof p.stockFrigo === 'number' &&
      p.category === filterCategory.value
    )
  }

  // Filtrage par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }

  // Tri
  return filtered.sort((a, b) => {
    const aIsFav = userFavorites.value.includes(a.id)
    const bIsFav = userFavorites.value.includes(b.id)

    switch (sortBy.value) {
      case 'favorites':
        if (aIsFav !== bIsFav) return bIsFav ? 1 : -1
        return a.name.localeCompare(b.name)
      
      case 'price-asc':
        return a.price - b.price
      
      case 'price-desc':
        return b.price - a.price
      
      case 'stock-asc':
        return a.stockFrigo - b.stockFrigo
      
      case 'stock-desc':
        return b.stockFrigo - a.stockFrigo
      
      case 'name':
        return a.name.localeCompare(b.name)
      
      default:
        return 0
    }
  })
})

const getCategoryCount = (category) => {
  if (!productsStore.products) return 0
  
  if (category === 'all') {
    return productsStore.products.filter(p => 
      p && p.id && p.name && typeof p.price === 'number'
    ).length
  }
  
  return productsStore.products.filter(p => 
    p && p.id && p.name && p.category === category
  ).length
}

const getEmptyStateEmoji = () => {
  if (searchQuery.value) return '🔍'
  if (filterCategory.value === 'favorites') return '⭐'
  if (filterCategory.value === 'boissons') return '🥤'
  if (filterCategory.value === 'snacks') return '🍫'
  return '📦'
}

const getEmptyStateMessage = () => {
  if (searchQuery.value) {
    return `Aucun produit trouvé pour "${searchQuery.value}"`
  }
  if (filterCategory.value === 'favorites') {
    return 'Aucun produit favori'
  }
  if (filterCategory.value === 'boissons') {
    return 'Aucune boisson disponible'
  }
  if (filterCategory.value === 'snacks') {
    return 'Aucun snack disponible'
  }
  return 'Aucun produit disponible'
}

const resetFilters = () => {
  searchQuery.value = ''
  filterCategory.value = 'all'
  sortBy.value = 'favorites'
}

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
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  productsStore.stopListening()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Animation d'entrée des produits */
.product-list-enter-active {
  transition: all 0.3s ease-out;
}

.product-list-leave-active {
  transition: all 0.2s ease-in;
  position: absolute;
}

.product-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.product-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.product-list-move {
  transition: transform 0.3s ease;
}
</style>