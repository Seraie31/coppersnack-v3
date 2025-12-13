<template>
  <div
    v-if="product"
    class="card relative flex flex-col h-full p-3 rounded-xl bg-dark-200"
    :class="{ 'opacity-50': isOutOfStock, 'on-promotion': hasActivePromotion }"
  >
    <!-- BADGE PROMOTION -->
    <div v-if="hasActivePromotion" class="promo-badge">
      🏷️ -{{ product.promotion.discount }}%
    </div>

    <!-- FAVORIS -->
    <button
      @click.stop="toggleFavorite"
      class="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-dark-300 hover:bg-dark-400 flex items-center justify-center transition-all"
      :class="isFavorite ? 'text-yellow-400' : 'text-gray-500'"
      :title="isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'"
    >
      <svg class="w-5 h-5" :fill="isFavorite ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>

    <!-- CONTENU PRINCIPAL : tout en colonne, bouton collé en bas -->
    <div class="flex flex-col flex-1">
      <!-- IMAGE -->
      <div class="aspect-square bg-dark-300 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="w-full h-full object-contain"
          @error="handleImageError"
        />
        <span v-else class="text-4xl">📦</span>
      </div>

      <!-- TITRE (multi-lignes sur mobile) -->
      <h3
        class="font-bold text-base mb-1 line-clamp-2 leading-snug"
        :title="product.name"
      >
        {{ product.name }}
      </h3>

      <!-- PRIX + STOCK -->
      <div class="flex items-end justify-between gap-2 mb-2">
        <div class="flex flex-col">
          <span
            v-if="hasActivePromotion"
            class="text-sm font-semibold text-gray-500 line-through leading-tight"
          >
            {{ formatCurrency(product.price) }}
          </span>
          <span
            class="text-xl font-extrabold leading-tight"
            :class="hasActivePromotion ? 'text-orange-400' : 'text-primary'"
          >
            {{ formatCurrency(finalPrice) }}
          </span>
        </div>
        <span
          class="text-xs font-bold px-2 py-1 rounded whitespace-nowrap"
          :class="getStockClass(product.stockFrigo || 0)"
        >
          Stock: {{ product.stockFrigo || 0 }}
        </span>
      </div>

      <!-- INFO PROMO -->
      <div
        v-if="hasActivePromotion && (promotionInfo.endDate || promotionInfo.maxStock)"
        class="promo-info mb-3 text-xs space-y-1"
      >
        <div v-if="promotionInfo.endDate" class="promo-detail">
          ⏰ Jusqu'au {{ formatDate(promotionInfo.endDate) }}
        </div>
        <div v-if="promotionInfo.maxStock" class="promo-detail">
          🎯 Limité à {{ promotionInfo.maxStock }} unités
        </div>
      </div>

      <!-- pousse le bouton en bas de la card -->
      <div class="mt-auto">
        <!-- BOUTON CONSOMMER -->
        <button
          @click="showConfirm = true"
          :disabled="isOutOfStock || loading"
          class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm py-2.5"
          :class="{ 'promo-btn': hasActivePromotion }"
        >
          {{ loading ? 'Traitement...' : 'Consommer ' + formatCurrency(finalPrice) }}
        </button>
      </div>
    </div>

    <!-- CONFIRMATION / MODALES SUCCÈS / ERREUR : inchangés -->
    <ConfirmModal
      :show="showConfirm"
      :title="`Confirmer la consommation`"
      :message="confirmMessage"
      @cancel="showConfirm = false"
      @confirm="handleConfirm"
    />

    <div v-if="showSuccess" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm mx-4 text-center">
        <div class="text-5xl mb-4">✅</div>
        <p class="text-lg font-bold mb-2">{{ product.name }}</p>
        <p class="text-gray-400">consommé(e) avec succès !</p>
        <p v-if="hasActivePromotion" class="text-green-400 mt-2">
          Économie : {{ formatCurrency(product.price - finalPrice) }}
        </p>
      </div>
    </div>

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

// ✨ NOUVEAU : Vérifier si une promotion est active
const hasActivePromotion = computed(() => {
  const promo = props.product.promotion
  if (!promo || !promo.active) return false

  // Vérifier la date de fin
  if (promo.endDate) {
    const now = new Date()
    const endDate = promo.endDate.toDate ? promo.endDate.toDate() : new Date(promo.endDate)
    if (now > endDate) return false
  }

  // Vérifier le stock limité
  if (promo.maxStock && props.product.stockFrigo > promo.maxStock) {
    return false
  }

  return true
})

// ✨ NOUVEAU : Infos de la promotion
const promotionInfo = computed(() => {
  if (!hasActivePromotion.value) return null
  return props.product.promotion
})

// ✨ NOUVEAU : Prix final après réduction
const finalPrice = computed(() => {
  if (!hasActivePromotion.value) {
    return props.product.price
  }
  
  const discount = props.product.promotion.discount / 100
  return props.product.price * (1 - discount)
})

// ✨ NOUVEAU : Message de confirmation avec promo
const confirmMessage = computed(() => {
  let msg = `Vous êtes sur le point de consommer ${props.product.name}`
  
  if (hasActivePromotion.value) {
    msg += ` en promotion pour ${formatCurrency(finalPrice.value)}`
    msg += ` (au lieu de ${formatCurrency(props.product.price)})`
  } else {
    msg += ` pour ${formatCurrency(finalPrice.value)}`
  }
  
  return msg
})

/* --------------------- UTILS --------------------- */

const formatCurrency = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount || 0)

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d)
}

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
  // Vérifications
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

    // ✨ MODIFIÉ : Utiliser le prix final (avec promo si applicable)
    const amountToCharge = finalPrice.value

    // Mise à jour du solde utilisateur
    await updateDoc(userRef, {
      balance: increment(-amountToCharge)
    })

    // Mise à jour stock produit
    await updateDoc(productRef, {
      stockFrigo: increment(-1)
    })

    // Mise à jour caisse frigo
    await updateDoc(frigoRef, {
      balance: increment(amountToCharge),
      lastUpdate: Timestamp.now()
    })

    // ✨ MODIFIÉ : Création transaction avec infos promo
    await addDoc(collection(db, 'transactions'), {
      userId: authStore.user.uid,
      userName: authStore.user.displayName || authStore.user.email,
      productId: props.product.id,
      productName: props.product.name,
      amount: amountToCharge,
      type: 'consumption',
      date: Timestamp.now(),
      // ✨ NOUVEAU : Infos promo
      isPromotion: hasActivePromotion.value,
      originalPrice: hasActivePromotion.value ? props.product.price : null,
      discountPercent: hasActivePromotion.value ? props.product.promotion.discount : null
    })

    // Nettoyage (non bloquant)
    cleanOldTransactions().catch(() => {})

    // SUCCÈS
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
/* ✨ STYLES PROMO */

.card.on-promotion {
  border: 2px solid #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, var(--dark-200) 100%);
}

.promo-badge {
  position: absolute;
  top: 0.25rem;
  left: 0.5rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  font-weight: 700;
  font-size: 0.7rem;
  max-width: 70%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  z-index: 25;
  animation: pulse-promo 2s ease-in-out infinite;
}

@keyframes pulse-promo {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6);
  }
}

.promo-info {
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid #f59e0b;
  padding: 0.4rem 0.5rem;
  border-radius: 6px;
}

.promo-detail {
  font-size: 0.7rem;
  color: #fbbf24;
  line-height: 1.3;
}

.promo-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.promo-btn:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
  transform: scale(1.02);
}

/* Utilitaire pour limiter le texte à 2 lignes */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
