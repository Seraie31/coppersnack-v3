<template>
  <div v-if="product" class="card relative" :class="{ 'opacity-50': isOutOfStock }">
    <!-- Badge favori -->
    <button 
      @click.stop="toggleFavorite"
      class="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-dark-300 hover:bg-dark-400 flex items-center justify-center transition-all"
      :class="isFavorite ? 'text-yellow-400' : 'text-gray-500'"
      :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    >
      <svg class="w-6 h-6" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>

    <!-- Overlay rupture de stock -->
    <div v-if="isOutOfStock" 
         class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 rounded-xl z-10">
      <span class="text-2xl font-bold text-red-500">Rupture de stock</span>
    </div>

    <!-- Image du produit -->
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

    <!-- Nom du produit -->
    <h3 class="font-bold text-lg mb-2 truncate" :title="product.name">
      {{ product.name }}
    </h3>
    
    <!-- Prix et stock avec couleurs -->
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

    <!-- Bouton consommer -->
    <button 
      @click="handleConsume" 
      :disabled="isOutOfStock || loading"
      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    >
      {{ loading ? 'Traitement...' : 'Consommer' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/firebase/config'
import { doc, updateDoc, addDoc, collection, increment, arrayUnion, arrayRemove, deleteDoc, query, where, orderBy, getDocs } from 'firebase/firestore'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  favorites: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['consumed', 'favorite-changed'])

const authStore = useAuthStore()
const loading = ref(false)

const isOutOfStock = computed(() => !props.product?.stockFrigo || props.product.stockFrigo === 0)
const isFavorite = computed(() => props.favorites.includes(props.product.id))

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const getStockClass = (stock) => {
  if (stock === 0) {
    return 'bg-red-900/40 text-red-400'
  } else if (stock <= 5) {
    return 'bg-orange-900/40 text-orange-400'
  } else {
    return 'bg-green-900/40 text-green-400'
  }
}

const handleImageError = (event) => {
  console.error('Erreur chargement image:', props.product.name)
  event.target.style.display = 'none'
}

const toggleFavorite = async () => {
  if (!authStore.user) {
    alert('Vous devez être connecté')
    return
  }

  try {
    const userRef = doc(db, 'users', authStore.user.uid)
    
    if (isFavorite.value) {
      // Retirer des favoris
      await updateDoc(userRef, {
        favorites: arrayRemove(props.product.id)
      })
    } else {
      // Ajouter aux favoris
      await updateDoc(userRef, {
        favorites: arrayUnion(props.product.id)
      })
    }
    
    emit('favorite-changed')
  } catch (error) {
    console.error('Erreur favoris:', error)
    alert('❌ Erreur lors de la mise à jour des favoris')
  }
}
// Fonction pour nettoyer les anciennes transactions
const cleanOldTransactions = async () => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', authStore.user.uid),
      orderBy('date', 'desc')
    )
    
    const snapshot = await getDocs(q)
    const allTransactions = snapshot.docs
    
    if (allTransactions.length > 10) {
      const transactionsToDelete = allTransactions.slice(10)
      
      for (const transactionDoc of transactionsToDelete) {
        await deleteDoc(doc(db, 'transactions', transactionDoc.id))
      }
    }
  } catch (error) {
    console.error('Erreur nettoyage transactions:', error)
  }
}
const handleConsume = async () => {
  if (!props.product.stockFrigo || props.product.stockFrigo === 0) {
  alert('❌ Produit en rupture de stock')
  return
}

  if (!authStore.user) {
    alert('Vous devez être connecté')
    return
  }

  if (!props.product.stockFrigo || props.product.stockFrigo === 0) {
    alert('❌ Produit en rupture de stock')
    return
  }

  try {
    loading.value = true

    // Déduire du solde utilisateur
    const userRef = doc(db, 'users', authStore.user.uid)
    await updateDoc(userRef, {
      balance: increment(-props.product.price)
    })

    // Déduire du stock produit
    const productRef = doc(db, 'products', props.product.id)
await updateDoc(productRef, {
  stockFrigo: increment(-1)  // ← Modifier ici
})

    // 💰 Ajouter l'argent à la Caisse Frigo
    const frigoRef = doc(db, 'cashRegisters', 'frigo')
    await updateDoc(frigoRef, {
      balance: increment(props.product.price),
      lastUpdate: new Date()
    })

    // Enregistrer la transaction
    await addDoc(collection(db, 'transactions'), {
      userId: authStore.user.uid,
      userName: authStore.user.displayName || authStore.user.email,
      productId: props.product.id,
      productName: props.product.name,
      amount: props.product.price,
      type: 'consumption',
      date: new Date()
    })

    // 🗑️ Nettoyer les anciennes transactions
    await cleanOldTransactions()

  
    alert(`✅ ${props.product.name} consommé(e) avec succès !`)
    emit('consumed')
  } catch (error) {
    console.error('Erreur lors de la consommation:', error)
    alert('❌ Erreur lors de la consommation. Veuillez réessayer.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Optimisation Mobile */
@media (max-width: 640px) {
  .card {
    padding: 0.75rem;
  }

  h3 {
    font-size: 0.875rem;
    line-height: 1.2;
  }

  .aspect-square {
    margin-bottom: 0.5rem;
  }

  button {
    font-size: 0.875rem;
    padding: 0.5rem;
  }

  /* Badge favori plus petit */
  .absolute.top-3.right-3 {
    top: 0.5rem;
    right: 0.5rem;
    width: 2rem;
    height: 2rem;
  }

  .absolute.top-3.right-3 svg {
    width: 1rem;
    height: 1rem;
  }

  /* Stock plus compact */
  .flex.items-center.justify-between.mb-4 {
    margin-bottom: 0.5rem;
  }

  .flex.items-center.justify-between.mb-4 span {
    font-size: 0.75rem;
  }

  .text-2xl.font-bold {
    font-size: 1.25rem;
  }

  /* Overlay rupture plus lisible */
  .absolute.inset-0 span {
    font-size: 1rem;
    padding: 0.5rem;
    background-color: rgba(0, 0, 0, 0.8);
    border-radius: 0.5rem;
  }
}
</style>
