<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">💰 Gestion des Caisses</h1>
        <button @click="$router.push('/admin')" class="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg">
          ← Retour Admin
        </button>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-400">Chargement...</p>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Caisse Frigo -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold flex items-center gap-2">
              🧊 Caisse Frigo
            </h2>
          </div>

          <div class="text-center mb-6">
            <p class="text-5xl font-bold text-green-400 mb-2">
              {{ formatCurrency(frigoBalance) }}
            </p>
            <p class="text-sm text-gray-400">
              Dernière mise à jour : {{ formatDate(frigoLastUpdate) }}
            </p>
          </div>

          <!-- Transfert vers CSE -->
          <div class="space-y-4">
            <h3 class="font-bold text-lg">💸 Transférer vers Caisse CSE</h3>
            
            <div>
              <label class="block text-sm font-medium mb-2">Montant (€)</label>
              <input 
                v-model.number="transferAmount" 
                type="number" 
                min="0.01" 
                step="0.01"
                :max="frigoBalance"
                class="input-field"
                placeholder="10.00"
              >
            </div>

            <div class="flex gap-2">
              <button 
                @click="quickTransfer(10)"
                class="btn-secondary flex-1"
                :disabled="frigoBalance < 10"
              >
                10 €
              </button>
              <button 
                @click="quickTransfer(50)"
                class="btn-secondary flex-1"
                :disabled="frigoBalance < 50"
              >
                50 €
              </button>
              <button 
                @click="transferAll"
                class="btn-secondary flex-1"
                :disabled="frigoBalance <= 0"
              >
                Tout
              </button>
            </div>

            <button 
              @click="transferToCse"
              :disabled="!transferAmount || transferAmount <= 0 || transferAmount > frigoBalance || transferring"
              class="btn-primary w-full disabled:opacity-50"
            >
              {{ transferring ? 'Transfert...' : `Transférer ${formatCurrency(transferAmount || 0)}` }}
            </button>
          </div>
        </div>

        <!-- Caisse CSE -->
        <div class="card">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold flex items-center gap-2">
              💼 Caisse CSE
            </h2>
          </div>

          <div class="text-center mb-6">
            <p class="text-5xl font-bold text-blue-400 mb-2">
              {{ formatCurrency(cseBalance) }}
            </p>
            <p class="text-sm text-gray-400">
              Dernière mise à jour : {{ formatDate(cseLastUpdate) }}
            </p>
          </div>

          <!-- Dépôt / Retrait -->
          <div class="space-y-4">
            <h3 class="font-bold text-lg">💳 Opérations</h3>
            
            <div>
              <label class="block text-sm font-medium mb-2">Montant (€)</label>
              <input 
                v-model.number="cseOperationAmount" 
                type="number" 
                min="0.01" 
                step="0.01"
                class="input-field"
                placeholder="20.00"
              >
            </div>

            <div class="grid grid-cols-2 gap-3">
              <button 
                @click="depositCse"
                :disabled="!cseOperationAmount || cseOperationAmount <= 0 || operating"
                class="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                {{ operating ? '...' : '💵 Dépôt' }}
              </button>

              <button 
                @click="withdrawCse"
                :disabled="!cseOperationAmount || cseOperationAmount <= 0 || cseOperationAmount > cseBalance || operating"
                class="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
              >
                {{ operating ? '...' : '💸 Retrait' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique des Opérations -->
      <div class="card mt-6">
        <h2 class="text-2xl font-bold mb-6">📊 Historique des Opérations</h2>

        <div v-if="loadingHistory" class="text-center py-8 text-gray-400">
          Chargement...
        </div>

        <div v-else-if="history.length === 0" class="text-center py-8 text-gray-400">
          Aucune opération
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="operation in history" 
            :key="operation.id"
            class="flex items-center justify-between p-4 bg-dark-200 rounded-lg"
          >
            <div class="flex items-center gap-4">
              <div 
                class="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                :class="getOperationBgClass(operation.type)"
              >
                {{ getOperationIcon(operation.type) }}
              </div>
              
              <div>
                <p class="font-semibold">{{ getOperationLabel(operation) }}</p>
                <p class="text-sm text-gray-400">{{ formatDate(operation.date) }}</p>
              </div>
            </div>

            <div class="text-xl font-bold" :class="getOperationColorClass(operation.type)">
              {{ getOperationSign(operation.type) }}{{ formatCurrency(operation.amount) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, orderBy, limit, getDocs, doc, getDoc, updateDoc, addDoc, increment } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const authStore = useAuthStore()
const router = useRouter()

// États
const loading = ref(false)
const transferring = ref(false)
const operating = ref(false)
const loadingHistory = ref(false)

// Caisses
const frigoBalance = ref(0)
const frigoLastUpdate = ref(null)
const cseBalance = ref(0)
const cseLastUpdate = ref(null)

// Formulaires
const transferAmount = ref(0)
const cseOperationAmount = ref(0)

// Historique
const history = ref([])

// Vérifier admin
onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    alert('❌ Accès réservé aux administrateurs')
    router.push('/')
    return
  }

  await loadCashRegisters()
  await loadHistory()
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'Jamais'
  const d = date.toDate ? date.toDate() : new Date(date)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

const loadCashRegisters = async () => {
  try {
    loading.value = true

    const frigoDoc = await getDoc(doc(db, 'cashRegisters', 'frigo'))
    if (frigoDoc.exists()) {
      const data = frigoDoc.data()
      frigoBalance.value = data.balance || 0
      frigoLastUpdate.value = data.lastUpdate
    }

    const cseDoc = await getDoc(doc(db, 'cashRegisters', 'cse'))
    if (cseDoc.exists()) {
      const data = cseDoc.data()
      cseBalance.value = data.balance || 0
      cseLastUpdate.value = data.lastUpdate
    }
  } catch (error) {
    console.error('Erreur chargement caisses:', error)
  } finally {
    loading.value = false
  }
}

const loadHistory = async () => {
  try {
    loadingHistory.value = true
    const q = query(
      collection(db, 'cashOperations'),
      orderBy('date', 'desc'),
      limit(20)
    )
    
    const snapshot = await getDocs(q)
    history.value = snapshot.docs.map(historyDoc => ({
      id: historyDoc.id,
      ...historyDoc.data()
    }))
  } catch (error) {
    console.error('Erreur chargement historique:', error)
  } finally {
    loadingHistory.value = false
  }
}

const quickTransfer = (amount) => {
  transferAmount.value = Math.min(amount, frigoBalance.value)
}

const transferAll = () => {
  transferAmount.value = frigoBalance.value
}

const transferToCse = async () => {
  if (!transferAmount.value || transferAmount.value <= 0 || transferAmount.value > frigoBalance.value) {
    alert('❌ Montant invalide')
    return
  }

  if (!confirm(`Transférer ${formatCurrency(transferAmount.value)} de Caisse Frigo vers Caisse CSE ?`)) {
    return
  }

  try {
    transferring.value = true

    // Retirer de Frigo
    await updateDoc(doc(db, 'cashRegisters', 'frigo'), {
      balance: increment(-transferAmount.value),
      lastUpdate: new Date()
    })

    // Ajouter à CSE
    await updateDoc(doc(db, 'cashRegisters', 'cse'), {
      balance: increment(transferAmount.value),
      lastUpdate: new Date()
    })

    // Enregistrer l'opération
    await addDoc(collection(db, 'cashOperations'), {
      type: 'transfer',
      from: 'frigo',
      to: 'cse',
      amount: transferAmount.value,
      adminId: authStore.user.uid,
      adminName: authStore.user.displayName || authStore.user.email,
      date: new Date()
    })

    alert(`✅ Transfert de ${formatCurrency(transferAmount.value)} effectué !`)
    transferAmount.value = 0
    
    await loadCashRegisters()
    await loadHistory()
  } catch (error) {
    console.error('Erreur transfert:', error)
    alert('❌ Erreur lors du transfert')
  } finally {
    transferring.value = false
  }
}

const depositCse = async () => {
  if (!cseOperationAmount.value || cseOperationAmount.value <= 0) {
    alert('❌ Montant invalide')
    return
  }

  if (!confirm(`Déposer ${formatCurrency(cseOperationAmount.value)} dans la Caisse CSE ?`)) {
    return
  }

  try {
    operating.value = true

    await updateDoc(doc(db, 'cashRegisters', 'cse'), {
      balance: increment(cseOperationAmount.value),
      lastUpdate: new Date()
    })

    await addDoc(collection(db, 'cashOperations'), {
      type: 'deposit',
      cashRegister: 'cse',
      amount: cseOperationAmount.value,
      adminId: authStore.user.uid,
      adminName: authStore.user.displayName || authStore.user.email,
      date: new Date()
    })

    alert(`✅ Dépôt de ${formatCurrency(cseOperationAmount.value)} effectué !`)
    cseOperationAmount.value = 0
    
    await loadCashRegisters()
    await loadHistory()
  } catch (error) {
    console.error('Erreur dépôt:', error)
    alert('❌ Erreur lors du dépôt')
  } finally {
    operating.value = false
  }
}

const withdrawCse = async () => {
  if (!cseOperationAmount.value || cseOperationAmount.value <= 0 || cseOperationAmount.value > cseBalance.value) {
    alert('❌ Montant invalide')
    return
  }

  if (!confirm(`Retirer ${formatCurrency(cseOperationAmount.value)} de la Caisse CSE ?`)) {
    return
  }

  try {
    operating.value = true

    await updateDoc(doc(db, 'cashRegisters', 'cse'), {
      balance: increment(-cseOperationAmount.value),
      lastUpdate: new Date()
    })

    await addDoc(collection(db, 'cashOperations'), {
      type: 'withdrawal',
      cashRegister: 'cse',
      amount: cseOperationAmount.value,
      adminId: authStore.user.uid,
      adminName: authStore.user.displayName || authStore.user.email,
      date: new Date()
    })

    alert(`✅ Retrait de ${formatCurrency(cseOperationAmount.value)} effectué !`)
    cseOperationAmount.value = 0
    
    await loadCashRegisters()
    await loadHistory()
  } catch (error) {
    console.error('Erreur retrait:', error)
    alert('❌ Erreur lors du retrait')
  } finally {
    operating.value = false
  }
}

const getOperationIcon = (type) => {
  const icons = {
    transfer: '🔄',
    deposit: '💵',
    withdrawal: '💸'
  }
  return icons[type] || '💰'
}

const getOperationBgClass = (type) => {
  const classes = {
    transfer: 'bg-blue-900/30',
    deposit: 'bg-green-900/30',
    withdrawal: 'bg-red-900/30'
  }
  return classes[type] || 'bg-gray-900/30'
}

const getOperationColorClass = (type) => {
  const classes = {
    transfer: 'text-blue-400',
    deposit: 'text-green-400',
    withdrawal: 'text-red-400'
  }
  return classes[type] || 'text-gray-400'
}

const getOperationSign = (type) => {
  return type === 'withdrawal' ? '-' : '+'
}

const getOperationLabel = (operation) => {
  if (operation.type === 'transfer') {
    return 'Transfert Frigo → CSE'
  } else if (operation.type === 'deposit') {
    return 'Dépôt Caisse CSE'
  } else if (operation.type === 'withdrawal') {
    return 'Retrait Caisse CSE'
  }
  return 'Opération'
}
</script>
