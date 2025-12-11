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

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <!-- Informations -->
        <div class="card">
          <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Informations</h2>
          
          <div class="space-y-3 sm:space-y-4">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Nom :</p>
              <p class="text-base sm:text-lg font-semibold">{{ userProfile?.displayName || authStore.user?.displayName || 'Non défini' }}</p>
            </div>

            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Email :</p>
              <p class="text-sm sm:text-lg break-all">{{ authStore.user?.email }}</p>
            </div>

            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Rôle :</p>
              <p class="text-base sm:text-lg capitalize">
                <span v-if="userProfile?.role === 'admin'" class="px-3 py-1 bg-orange-600 rounded-full text-sm">
                  👑 Admin
                </span>
                <span v-else class="px-3 py-1 bg-gray-700 rounded-full text-sm">
                  👤 Utilisateur
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Mon Solde -->
        <div class="card">
          <h2 class="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Mon Solde</h2>
          
          <div class="text-center mb-4 sm:mb-6">
            <p class="text-4xl sm:text-5xl font-bold mb-2" :class="balance >= 0 ? 'text-green-400' : 'text-red-400'">
              {{ formatCurrency(balance) }}
            </p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="block text-xs sm:text-sm font-medium mb-2">Montant à ajouter (€)</label>
              <input 
                v-model.number="rechargeAmount" 
                type="number" 
                min="1" 
                step="1"
                class="input-field text-base"
              >
            </div>

            <button 
              @click="rechargeBalance" 
              :disabled="loading || !rechargeAmount || rechargeAmount <= 0"
              class="btn-primary w-full disabled:opacity-50 text-sm sm:text-base"
            >
              {{ loading ? 'Traitement...' : 'Ajouter au solde' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Historique des Transactions -->
      <div class="card">
        <div class="flex items-center justify-between mb-4 sm:mb-6">
          <h2 class="text-xl sm:text-2xl font-bold">Historique</h2>
          <span class="text-xs sm:text-sm text-gray-400">(10 dernières)</span>
        </div>

        <div v-if="loadingTransactions" class="text-center py-8 text-gray-400">
          Chargement...
        </div>

        <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-400">
          Aucune transaction
        </div>

        <div v-else class="space-y-2 sm:space-y-3">
          <transition-group name="hist" tag="div">
            <div
              v-for="transaction in transactions"
              :key="transaction.id"
              class="flex items-center justify-between p-3 sm:p-4 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
              :class="[
                transaction.canceled ? 'opacity-60 line-through' : '',
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
                  <p class="font-semibold text-sm sm:text-base truncate">
                    {{ transaction.type === 'consumption' ? transaction.productName : 'Rechargement' }}
                  </p>
                  <p class="text-xs sm:text-sm text-gray-400">
                    {{ formatDate(transaction.date) }}
                  </p>
                </div>
              </div>

              <!-- Montant + Annulation -->
              <div class="flex items-center gap-3 flex-shrink-0 ml-2">
                <div
                  class="text-base sm:text-xl font-bold"
                  :class="transaction.type === 'consumption' ? 'text-red-400' : 'text-green-400'"
                >
                  {{ transaction.type === 'consumption' ? '-' : '+' }}{{ transaction.amount.toFixed(2) }} €
                </div>

                <button
                  v-if="transaction.type === 'consumption' && isToday(transaction.date) && !transaction.canceled"
                  @click.stop="handleCancelTransaction(transaction)"
                  class="text-xs sm:text-sm px-2 py-1 rounded bg-red-900/40 hover:bg-red-700 text-red-200"
                >
                  Annuler
                </button>

                <span
                  v-else-if="transaction.canceled"
                  class="text-xs text-gray-400 italic"
                >
                  Annulée
                </span>
              </div>
            </div>
          </transition-group>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { collection, query, where, orderBy, limit, getDocs, onSnapshot, addDoc, doc, updateDoc, increment, getDoc, deleteDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Navbar from '@/components/Navbar.vue'

const authStore = useAuthStore()
const userProfile = ref(null)
const transactions = ref([])
const rechargeAmount = ref(null)
const loading = ref(false)
const loadingTransactions = ref(false)

let unsubscribeTransactions = null
let unsubscribeUserProfile = null

const balance = computed(() => {
  return userProfile.value?.balance ?? authStore.user?.balance ?? 0
})

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

const handleCancelTransaction = async (transaction) => {
  if (!isToday(transaction.date)) {
    alert('Vous ne pouvez annuler que les consommations du jour.')
    return
  }

  const ok = confirm(
    `Annuler la consommation de "${transaction.productName}" du ${formatDate(transaction.date)} ?`
  )
  if (!ok) return

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
      t.canceledAt = new Date()
      t._anim = true
      setTimeout(() => {
        t._anim = false
      }, 400)
    }

    if (userProfile.value) {
      userProfile.value.balance += transaction.amount
    }

    alert('✅ Consommation annulée avec succès')
  } catch (error) {
    console.error('Erreur annulation transaction :', error)
    alert('❌ Erreur lors de l\'annulation. Veuillez réessayer.')
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
    alert('Montant invalide')
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
      amount: rechargeAmount.value,
      type: 'recharge',
      date: Timestamp.now()
    })

    await cleanOldTransactions()

    await loadUserProfile()
    await loadTransactions()
    
    alert(`✅ Rechargement de ${rechargeAmount.value} € effectué !`)
    rechargeAmount.value = null
  } catch (error) {
    console.error('Erreur rechargement:', error)
    alert('❌ Erreur lors du rechargement')
  } finally {
    loading.value = false
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
</style>