<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <!-- Header avec bouton retour -->
      <div class="flex items-center mb-4 sm:mb-8">
        <button @click="$router.push('/')" class="mr-3 sm:mr-4 text-gray-400 hover:text-white transition-colors">
          <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-2xl sm:text-3xl font-bold">Mon Profil</h1>
      </div>

      <!-- ✨ NOUVELLE CARTE MEMBRE VIRTUELLE ✨ -->
      <MemberCard
        :user-name="userProfile?.displayName || authStore.user?.displayName || 'Utilisateur'"
        :user-email="authStore.user?.email"
        :user-id="authStore.user?.uid"
        :balance="balance"
        :total-transactions="stats.totalConsumptions"
        :total-spent="stats.totalSpent"
        :streak="stats.streak"
        :created-at="userProfile?.createdAt"
      />



      <!-- Rechargement -->
      <div class="card mb-6">
        <h2 class="text-xl sm:text-2xl font-bold mb-4">💳 Recharger mon compte</h2>
        
        <!-- Montants rapides -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <button
            v-for="amount in quickAmounts"
            :key="amount"
            @click="rechargeAmount = amount"
            :class="rechargeAmount === amount ? 'border-primary bg-primary/10' : 'border-dark-300'"
            class="border-2 rounded-lg p-3 sm:p-4 cursor-pointer hover:border-primary transition-all"
          >
            <p class="text-lg sm:text-xl font-bold">{{ formatCurrency(amount) }}</p>
          </button>
        </div>

        <!-- Montant personnalisé -->
        <div class="flex gap-3">
          <input 
            v-model.number="rechargeAmount" 
            type="number" 
            min="1" 
            step="1"
            placeholder="Montant personnalisé (€)"
            class="input-field flex-1"
          >
          <button 
            @click="rechargeBalance" 
            :disabled="loading || !rechargeAmount || rechargeAmount <= 0"
            class="btn-primary px-6 disabled:opacity-50"
          >
            {{ loading ? 'Traitement...' : 'Confirmer' }}
          </button>
        </div>
      </div>

      <!-- Historique des Transactions -->
      <div class="card">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold">📜 Historique</h2>
          <span class="text-xs sm:text-sm text-gray-400">(10 dernières)</span>
        </div>

        <div v-if="loadingTransactions" class="text-center py-8 text-gray-400">
          Chargement...
        </div>

        <div v-else-if="transactions.length === 0" class="text-center py-8">
          <div class="text-5xl mb-4">📭</div>
          <p class="text-gray-400">Aucune transaction pour le moment</p>
        </div>

        <div v-else class="space-y-2 sm:space-y-3">
          <transition-group name="hist" tag="div">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="flex items-center justify-between p-3 sm:p-4 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
              :class="[
                transaction.canceled ? 'opacity-60' : '',
                transaction._anim ? 'hist-flash' : ''
              ]"
            >
              <div class="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div
                  class="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                  :class="transaction.type === 'consumption' ? 'bg-red-900/30' : 'bg-green-900/30'"
                >
                  {{ transaction.type === 'consumption' ? '🛒' : '💰' }}
                </div>

                <div class="min-w-0 flex-1">
                  <p class="font-semibold text-sm sm:text-base truncate" :class="transaction.canceled ? 'line-through' : ''">
                    {{ transaction.type === 'consumption' ? transaction.productName : 'Rechargement' }}
                  </p>
                  <p class="text-xs sm:text-sm text-gray-400">
                    {{ formatDate(transaction.date) }}
                  </p>
                </div>
              </div>

              <!-- Montant + Actions -->
              <div class="flex items-center gap-2 sm:gap-3 flex-shrink-0 ml-2">
                <div
                  class="text-base sm:text-xl font-bold"
                  :class="transaction.type === 'consumption' ? 'text-red-400' : 'text-green-400'"
                >
                  {{ transaction.type === 'consumption' ? '-' : '+' }}{{ transaction.amount.toFixed(2) }} €
                </div>

                <button
                  v-if="transaction.type === 'consumption' && isToday(transaction.date) && !transaction.canceled"
                  @click.stop="handleCancelTransaction(transaction)"
                  class="text-xs px-2 py-1 rounded bg-red-900/40 hover:bg-red-700 text-red-200 transition-colors"
                  title="Annuler cette consommation"
                >
                  ✕
                </button>

                <span
                  v-else-if="transaction.canceled"
                  class="text-xs text-gray-500 italic"
                >
                  Annulée
                </span>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

      <!-- Bouton Déconnexion -->
      <div class="mt-6">
        <button @click="handleLogout" class="w-full btn-secondary bg-red-900/40 hover:bg-red-900/60 text-red-400">
          🚪 Se déconnecter
        </button>
      </div>
    </div>

    <!-- Message de succès -->
    <div v-if="showSuccess" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm mx-4 text-center animate-bounce-in">
        <div class="text-5xl mb-4">✅</div>
        <p class="text-lg font-bold mb-2">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="showError" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm mx-4 text-center">
        <div class="text-5xl mb-4">❌</div>
        <p class="text-lg font-bold mb-2">Erreur</p>
        <p class="text-gray-400 mb-4">{{ errorMessage }}</p>
        <button @click="showError = false" class="btn-primary">OK</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, addDoc, doc, updateDoc, increment, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Navbar from '@/components/Navbar.vue'
import MemberCard from '@/components/MemberCard.vue' // ✨ NOUVEAU IMPORT

const authStore = useAuthStore()
const router = useRouter()
const userProfile = ref(null)
const transactions = ref([])
const rechargeAmount = ref(null)
const loading = ref(false)
const loadingTransactions = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const quickAmounts = [1, 5, 10, 20]

let unsubscribeTransactions = null
let unsubscribeUserProfile = null

const balance = computed(() => userProfile.value?.balance ?? 0)
const favoriteCount = computed(() => userProfile.value?.favorites?.length || 0)

const balanceColor = computed(() => {
  const bal = balance.value
  if (bal >= 20) return 'text-green-400'
  if (bal >= 10) return 'text-orange-400'
  return 'text-red-400'
})

const stats = computed(() => {
  const consumptions = transactions.value.filter(t => t.type === 'consumption' && !t.canceled)
  const totalSpent = consumptions.reduce((sum, t) => sum + (t.amount || 0), 0)
  const averageSpent = consumptions.length > 0 ? totalSpent / consumptions.length : 0
  
  const uniqueDays = new Set(
    consumptions.map(t => {
      const d = t.date?.toDate ? t.date.toDate() : new Date(t.date)
      return d.toDateString()
    })
  )
  
  return {
    totalConsumptions: consumptions.length,
    totalSpent,
    averageSpent,
    streak: uniqueDays.size
  }
})

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return ''
  const d = date.toDate ? date.toDate() : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const isToday = (firestoreDate) => {
  const d = firestoreDate?.toDate ? firestoreDate.toDate() : new Date(firestoreDate)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccess.value = true
  setTimeout(() => {
    showSuccess.value = false
  }, 2000)
}

const showErrorMessage = (message) => {
  errorMessage.value = message
  showError.value = true
}

const handleCancelTransaction = async (transaction) => {
  if (!isToday(transaction.date)) {
    showErrorMessage('Vous ne pouvez annuler que les consommations du jour')
    return
  }

  if (!confirm(`Annuler la consommation de "${transaction.productName}" ?`)) {
    return
  }

  try {
    const userRef = doc(db, 'users', transaction.userId)
    await updateDoc(userRef, {
      balance: increment(transaction.amount)
    })

    const productRef = doc(db, 'products', transaction.productId)
    await updateDoc(productRef, {
      stockFrigo: increment(1)
    })

    const transactionRef = doc(db, 'transactions', transaction.id)
    await updateDoc(transactionRef, {
      canceled: true,
      canceledAt: Timestamp.now()
    })

    const t = transactions.value.find(t => t.id === transaction.id)
    if (t) {
      t.canceled = true
      t._anim = true
      setTimeout(() => {
        t._anim = false
      }, 400)
    }

    showSuccessMessage('Consommation annulée !')
  } catch (error) {
    console.error('Erreur annulation transaction:', error)
    showErrorMessage('Erreur lors de l\'annulation')
  }
}

const loadUserProfile = () => {
  const userDocRef = doc(db, 'users', authStore.user.uid)
  
  unsubscribeUserProfile = onSnapshot(userDocRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      userProfile.value = docSnapshot.data()
    }
  }, (error) => {
    console.error('Erreur écoute profil:', error)
  })
}

const loadTransactions = () => {
  loadingTransactions.value = true
  
  const q = query(
    collection(db, 'transactions'),
    where('userId', '==', authStore.user.uid),
    orderBy('date', 'desc'),
    limit(10)
  )
  
  unsubscribeTransactions = onSnapshot(q, (snapshot) => {
    transactions.value = snapshot.docs.map(transactionDoc => ({
      id: transactionDoc.id,
      ...transactionDoc.data()
    }))
    loadingTransactions.value = false
  }, (error) => {
    console.error('Erreur écoute transactions:', error)
    loadingTransactions.value = false
  })
}

const cleanOldTransactions = async () => {
  try {
    const countQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', authStore.user.uid)
    )
    const countSnapshot = await getDocs(countQuery)
    const totalTransactions = countSnapshot.size

    if (totalTransactions > 10) {
      const oldTransactionsQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', authStore.user.uid),
        orderBy('date', 'asc'),
        limit(totalTransactions - 10)
      )

      const oldSnapshot = await getDocs(oldTransactionsQuery)
      
      const deletePromises = oldSnapshot.docs.map(transactionDoc => 
        deleteDoc(doc(db, 'transactions', transactionDoc.id))
      )
      
      await Promise.all(deletePromises)
    }
  } catch (error) {
    console.error('Erreur nettoyage transactions:', error)
  }
}

const rechargeBalance = async () => {
  if (!rechargeAmount.value || rechargeAmount.value <= 0) {
    showErrorMessage('Montant invalide')
    return
  }

  try {
    loading.value = true

    const userRef = doc(db, 'users', authStore.user.uid)
    await updateDoc(userRef, {
      balance: increment(rechargeAmount.value)
    })

    await addDoc(collection(db, 'transactions'), {
      userId: authStore.user.uid,
      userName: authStore.user.displayName || authStore.user.email,
      amount: rechargeAmount.value,
      type: 'recharge',
      date: Timestamp.now()
    })

    await cleanOldTransactions()

    showSuccessMessage(`+${formatCurrency(rechargeAmount.value)} ajoutés !`)
    rechargeAmount.value = null
  } catch (error) {
    console.error('Erreur rechargement:', error)
    showErrorMessage('Erreur lors du rechargement')
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
    await authStore.logout()
    router.push('/login')
  }
}

onMounted(async () => {
  loadUserProfile()
  loadTransactions()
})

onUnmounted(() => {
  if (unsubscribeTransactions) {
    unsubscribeTransactions()
  }
  if (unsubscribeUserProfile) {
    unsubscribeUserProfile()
  }
})
</script>

<style scoped>
.badge {
  @apply inline-flex items-center px-3 py-1 rounded-full text-xs font-bold;
}

.hist-enter-from,
.hist-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.hist-enter-active,
.hist-leave-active {
  transition: all 0.15s ease-out;
}

@keyframes histFlash {
  0% {
    box-shadow: 0 0 0 0 rgba(248, 113, 113, 0.8);
  }
  100% {
    box-shadow: 0 0 0 14px rgba(248, 113, 113, 0);
  }
}
.hist-flash {
  animation: histFlash 0.4s ease-out;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
.animate-bounce-in {
  animation: bounce-in 0.3s ease-out;
}
</style>
