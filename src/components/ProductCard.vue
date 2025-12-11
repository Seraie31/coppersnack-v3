<template>
  <div v-if="product" class="card relative" :class="{ 'opacity-50': isOutOfStock }">
    
    <!-- FAVORIS -->
    <button 
      @click.stop="toggleFavorite"
      class="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-dark-300 hover:bg-dark-400 flex items-center justify-center transition-all"
      :class="isFavorite ? 'text-yellow-400' : 'text-gray-500'"
      :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    >
      <svg class="w-6 h-6" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>

    <!-- OVERLAY RUPTURE -->
    <div
      v-if="isOutOfStock"
      class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl z-10"
    >
      <span class="text-2xl font-bold text-red-500">Rupture de stock</span>
    </div>

    <!-- IMAGE -->
    <div class="aspect-square bg-dark-200 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
      <img 
        v-if="product.image" 
        :src="product.image" 
        :alt="product.name"
        class="w-full h-full object-cover"
        @error="handleImageError"
      />
      <span v-else class="text-6xl">📦</span>
    </div>

    <!-- TITRE -->
    <h3 class="font-bold text-lg mb-2 truncate" :title="product.name">
      {{ product.name }}
    </h3>
    
    <!-- PRIX + STOCK -->
    <div class="flex items-center justify-between mb-4">
      <span class="text-2xl font-bold text-primary">
        {{ formatCurrency(product.price) }}
      </span>
      <span 
        class="text-sm font-bold px-2 py-1 rounded"
        :class="getStockClass(product.stockFrigo || 0)"
      >
        Stock: {{ product.stockFrigo || 0 }}
      </span>
    </div>

    <!-- BOUTON CONSOMMER -->
    <button 
      @click="showConfirm = true" 
      :disabled="isOutOfStock || loading"
      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {{ loading ? 'Traitement...' : 'Consommer' }}
    </button>

    <!-- CONFIRMATION -->
    <ConfirmModal
      :show="showConfirm"
      :title="`Confirmer la consommation`"
      :message="'Vous êtes sur le point de consommer ' + product.name + ' pour ' + formatCurrency(product.price)"
      @cancel="showConfirm = false"
      @confirm="handleConfirm"
    />

    <!-- MESSAGE DE SUCCÈS (remplace alert) -->
    <div v-if="showSuccess" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm mx-4 text-center">
        <div class="text-5xl mb-4">✅</div>
        <p class="text-lg font-bold mb-2">{{ product.name }}</p>
        <p class="text-gray-400">consommé(e) avec succès !</p>
      </div>
    </div>

    <!-- MESSAGE D'ERREUR (remplace alert) -->
    <div v-if="showError" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm mx-4 text-center">
        <div class="text-5xl mb-4">❌</div>
        <p class="text-lg font-bold mb-2">Erreur</p>
        <p class="text-gray-400">{{ errorMessage }}</p>
        <button @click="showError = false" class="mt-4 btn-primary">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'

import { 
  doc,
  updateDoc,
  addDoc,
  collection,
  increment,
  arrayUnion,
  arrayRemove,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore'

import ConfirmModal from '@/components/ConfirmModal.vue'

/* --------------------- STATE --------------------- */

const showConfirm = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const props = defineProps({
  product: { type: Object, required: true },
  favorites: { type: Array, default: () => [] }
})

const emit = defineEmits(['consumed', 'favorite-changed'])
const authStore = useAuthStore()

/* --------------------- COMPUTED --------------------- */

const isOutOfStock = computed(() => props.product.stockFrigo === 0)
const isFavorite = computed(() => props.favorites.includes(props.product.id))

/* --------------------- UTILS --------------------- */

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)

const getStockClass = (stock) => {
  if (stock === 0) return 'bg-red-900/40 text-red-400'
  if (stock <= 5) return 'bg-orange-900/40 text-orange-400'
  return 'bg-green-900/40 text-green-400'
}

const handleImageError = (event) => {
  console.error('Erreur chargement image:', props.product.name)
  event.target.style.display = 'none'
}

/* --------------------- FAVORIS --------------------- */

const toggleFavorite = async () => {
  if (!authStore.user) {
    errorMessage.value = 'Vous devez être connecté'
    showError.value = true
    return
  }

  try {
    const userRef = doc(db, 'users', authStore.user.uid)

    await updateDoc(userRef, {
      favorites: isFavorite.value
        ? arrayRemove(props.product.id)
        : arrayUnion(props.product.id)
    })

    emit('favorite-changed')
  } catch (error) {
    console.error('Erreur favoris:', error)
    errorMessage.value = 'Erreur lors de la mise à jour des favoris'
    showError.value = true
  }
}

/* --------------------- NETTOYAGE TRANSACTIONS --------------------- */

const cleanOldTransactions = async () => {
  try {
    if (!authStore.user?.uid) return

    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', authStore.user.uid),
      orderBy('date', 'desc')
    )

    const snapshot = await getDocs(q)
    const allTransactions = snapshot.docs

    if (allTransactions.length > 10) {
      const transactionsToDelete = allTransactions.slice(10)

      await Promise.all(
        transactionsToDelete.map((docSnap) =>
          deleteDoc(doc(db, 'transactions', docSnap.id))
        )
      )
    }
  } catch (error) {
    console.error('Erreur nettoyage transactions:', error)
  }
}

/* --------------------- CONFIRMATION + CONSOMMATION --------------------- */

const handleConfirm = () => {
  showConfirm.value = false
  handleConsume()
}

const handleConsume = async () => {
  // Vérifications (SANS alert)
  if (props.product.stockFrigo === 0) {
    errorMessage.value = 'Produit en rupture de stock'
    showError.value = true
    return
  }
  
  if (!authStore.user) {
    errorMessage.value = 'Vous devez être connecté'
    showError.value = true
    return
  }

  try {
    loading.value = true

    const userRef = doc(db, 'users', authStore.user.uid)
    const productRef = doc(db, 'products', props.product.id)
    const frigoRef = doc(db, 'cashRegisters', 'frigo')

    // Mise à jour du solde utilisateur
    await updateDoc(userRef, {
      balance: increment(-props.product.price)
    })

    // Mise à jour stock produit
    await updateDoc(productRef, {
      stockFrigo: increment(-1)
    })

    // Mise à jour caisse frigo
    await updateDoc(frigoRef, {
      balance: increment(props.product.price),
      lastUpdate: Timestamp.now()
    })

    // Création transaction
    await addDoc(collection(db, 'transactions'), {
      userId: authStore.user.uid,
      userName: authStore.user.displayName || authStore.user.email,
      productId: props.product.id,
      productName: props.product.name,
      amount: props.product.price,
      type: 'consumption',
      date: Timestamp.now()
    })

    // Nettoyage (non bloquant)
    cleanOldTransactions().catch(() => {})

    // SUCCÈS : afficher le message personnalisé (pas alert)
    showSuccess.value = true
    setTimeout(() => {
      showSuccess.value = false
    }, 2000)

    emit('consumed')

  } catch (error) {
    console.error('Erreur lors de la consommation:', error)
    errorMessage.value = 'Erreur lors de la consommation. Veuillez réessayer.'
    showError.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Styles inchangés */
</style>