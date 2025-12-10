<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">👥 Gestion des Utilisateurs</h1>
        <button @click="$router.push('/admin')" class="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg">
          ← Retour Admin
        </button>
      </div>

      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="card bg-blue-900/30">
          <p class="text-sm text-gray-400 mb-2">Total Utilisateurs</p>
          <p class="text-3xl font-bold text-blue-400">{{ users.length }}</p>
        </div>

        <div class="card bg-green-900/30">
          <p class="text-sm text-gray-400 mb-2">Total Soldes Positifs</p>
          <p class="text-3xl font-bold text-green-400">{{ formatCurrency(totalPositiveBalance) }}</p>
        </div>

        <div class="card bg-red-900/30">
          <p class="text-sm text-gray-400 mb-2">Total Soldes Négatifs</p>
          <p class="text-3xl font-bold text-red-400">{{ formatCurrency(totalNegativeBalance) }}</p>
        </div>

        <div class="card bg-purple-900/30">
          <p class="text-sm text-gray-400 mb-2">Total Cumulé</p>
          <p class="text-3xl font-bold" :class="totalBalance >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ formatCurrency(totalBalance) }}
          </p>
        </div>
      </div>

      <!-- Barre de recherche et filtres -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input 
            v-model="searchQuery" 
            type="text"
            placeholder="🔍 Rechercher par nom ou email..."
            class="input-field"
          >
          <select v-model="roleFilter" class="input-field">
            <option value="">Tous les rôles</option>
            <option value="admin">👑 Admins uniquement</option>
            <option value="user">👤 Users uniquement</option>
          </select>
          <select v-model="balanceFilter" class="input-field">
            <option value="">Tous les soldes</option>
            <option value="positive">✅ Soldes positifs</option>
            <option value="negative">❌ Soldes négatifs</option>
            <option value="zero">⚖️ Soldes à zéro</option>
          </select>
        </div>
        
        <!-- Compteur de résultats -->
        <div v-if="searchQuery || roleFilter || balanceFilter" class="mt-3 text-sm text-gray-400">
          {{ filteredUsers.length }} résultat(s) trouvé(s) sur {{ users.length }} utilisateur(s)
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="card">
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p class="text-gray-400 mt-4">Chargement...</p>
        </div>

        <div v-else-if="filteredUsers.length === 0" class="text-center py-12">
          <p class="text-gray-400 text-lg">😕 Aucun utilisateur trouvé</p>
          <button 
            v-if="searchQuery || roleFilter || balanceFilter"
            @click="resetFilters"
            class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            Réinitialiser les filtres
          </button>
        </div>

        <div v-else>
          <!-- Tableau Desktop -->
          <div class="hidden md:block overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-gray-700">
                  <th class="text-left py-4 px-4">Utilisateur</th>
                  <th class="text-left py-4 px-4">Email</th>
                  <th class="text-center py-4 px-4">Rôle</th>
                  <th class="text-right py-4 px-4">Solde</th>
                  <th class="text-center py-4 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="user in filteredUsers" 
                  :key="user.id"
                  class="border-b border-gray-800 hover:bg-dark-300 transition-colors"
                >
                  <td class="py-4 px-4">
                    <div class="font-semibold">{{ user.displayName || 'Non défini' }}</div>
                  </td>
                  <td class="py-4 px-4 text-sm text-gray-400">
                    {{ user.email }}
                  </td>
                  <td class="py-4 px-4 text-center">
                    <span 
                      class="px-3 py-1 rounded-full text-sm font-semibold"
                      :class="user.role === 'admin' ? 'bg-orange-600' : 'bg-gray-700'"
                    >
                      {{ user.role === 'admin' ? '👑 Admin' : '👤 User' }}
                    </span>
                  </td>
                  <td class="py-4 px-4 text-right">
                    <span 
                      class="text-xl font-bold"
                      :class="user.balance >= 0 ? 'text-green-400' : 'text-red-400'"
                    >
                      {{ formatCurrency(user.balance || 0) }}
                    </span>
                  </td>
                  <td class="py-4 px-4">
                    <div class="flex items-center justify-center gap-2">
                      <button 
                        @click="openEditModal(user)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
                        title="Modifier l'utilisateur"
                        aria-label="Modifier l'utilisateur"
                      >
                        ✏️
                      </button>
                      <button 
                        @click="confirmDelete(user)"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Supprimer l'utilisateur"
                        aria-label="Supprimer l'utilisateur"
                        :disabled="user.id === authStore.user.uid"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Cards Mobile -->
          <div class="md:hidden space-y-4">
            <div 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="card bg-dark-200"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <p class="font-bold text-lg">{{ user.displayName || 'Non défini' }}</p>
                  <p class="text-sm text-gray-400 break-all">{{ user.email }}</p>
                </div>
                <span 
                  class="px-3 py-1 rounded-full text-xs font-semibold ml-2"
                  :class="user.role === 'admin' ? 'bg-orange-600' : 'bg-gray-700'"
                >
                  {{ user.role === 'admin' ? '👑' : '👤' }}
                </span>
              </div>

              <div class="mb-3">
                <p class="text-2xl font-bold" :class="user.balance >= 0 ? 'text-green-400' : 'text-red-400'">
                  {{ formatCurrency(user.balance || 0) }}
                </p>
              </div>

              <div class="flex gap-2">
                <button 
                  @click="openEditModal(user)"
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-colors"
                >
                  ✏️ Modifier
                </button>
                <button 
                  @click="confirmDelete(user)"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold transition-colors disabled:opacity-50"
                  :disabled="user.id === authStore.user.uid"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Édition -->
    <div 
      v-if="showEditModal" 
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="card max-w-md w-full">
        <h2 class="text-2xl font-bold mb-6">Modifier l'utilisateur</h2>

        <div class="space-y-4">
          <!-- Nom -->
          <div>
            <label class="block text-sm font-medium mb-2">Nom *</label>
            <input 
              v-model="editForm.displayName" 
              type="text"
              class="input-field"
              :class="{ 'border-red-500': validationErrors.displayName }"
              placeholder="Nom de l'utilisateur"
            >
            <p v-if="validationErrors.displayName" class="text-red-400 text-sm mt-1">
              {{ validationErrors.displayName }}
            </p>
          </div>

          <!-- Email (lecture seule) -->
          <div>
            <label class="block text-sm font-medium mb-2">Email</label>
            <input 
              :value="editForm.email" 
              type="email"
              class="input-field bg-dark-400 cursor-not-allowed"
              disabled
            >
            <p class="text-gray-500 text-xs mt-1">L'email ne peut pas être modifié</p>
          </div>

          <!-- Solde -->
          <div>
            <label class="block text-sm font-medium mb-2">Solde (€) *</label>
            <div class="flex gap-2">
              <input 
                v-model.number="editForm.balance" 
                type="number"
                step="0.01"
                class="input-field flex-1"
                :class="{ 'border-red-500': validationErrors.balance }"
              >
              <button 
                @click="editForm.balance = 0"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                type="button"
              >
                Réinitialiser
              </button>
            </div>
            <p v-if="validationErrors.balance" class="text-red-400 text-sm mt-1">
              {{ validationErrors.balance }}
            </p>
          </div>

          <!-- Rôle -->
          <div>
            <label class="block text-sm font-medium mb-2">Rôle *</label>
            <select v-model="editForm.role" class="input-field">
              <option value="user">👤 Utilisateur</option>
              <option value="admin">👑 Administrateur</option>
            </select>
            <p v-if="editForm.id === authStore.user.uid && editForm.role !== 'admin'" class="text-orange-400 text-xs mt-1">
              ⚠️ Attention : vous ne pourrez plus accéder à cette page si vous changez votre propre rôle
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <button 
              @click="closeEditModal"
              class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
              type="button"
              :disabled="saving"
            >
              Annuler
            </button>
            <button 
              @click="saveUser"
              :disabled="saving"
              class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {{ saving ? '⏳ Sauvegarde...' : '💾 Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notification -->
    <Transition name="slide-up">
      <div 
        v-if="notification.show" 
        class="fixed bottom-4 right-4 z-50 max-w-md"
      >
        <div 
          class="card shadow-lg"
          :class="{
            'bg-green-900/90 border-green-500': notification.type === 'success',
            'bg-red-900/90 border-red-500': notification.type === 'error',
            'bg-blue-900/90 border-blue-500': notification.type === 'info'
          }"
        >
          <div class="flex items-start gap-3">
            <span class="text-2xl">
              {{ notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️' }}
            </span>
            <div class="flex-1">
              <p class="font-semibold">{{ notification.title }}</p>
              <p class="text-sm text-gray-300">{{ notification.message }}</p>
            </div>
            <button 
              @click="notification.show = false"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const authStore = useAuthStore()
const router = useRouter()

// États
const loading = ref(false)
const saving = ref(false)
const users = ref([])
const showEditModal = ref(false)

// Filtres
const searchQuery = ref('')
const roleFilter = ref('')
const balanceFilter = ref('')

// Notification
const notification = ref({
  show: false,
  type: 'success',
  title: '',
  message: ''
})

// Validation
const validationErrors = ref({
  displayName: '',
  balance: ''
})

const editForm = ref({
  id: '',
  displayName: '',
  email: '',
  balance: 0,
  role: 'user'
})

// Notification helper
const showNotification = (type, title, message) => {
  notification.value = { show: true, type, title, message }
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// Montage
onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    showNotification('error', 'Accès refusé', 'Cette page est réservée aux administrateurs')
    router.push('/')
    return
  }

  await loadUsers()
})

// Chargement des utilisateurs
const loadUsers = async () => {
  try {
    loading.value = true
    const snapshot = await getDocs(collection(db, 'users'))
    users.value = snapshot.docs.map(userDoc => ({
      id: userDoc.id,
      ...userDoc.data()
    }))
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error)
    showNotification('error', 'Erreur', 'Impossible de charger les utilisateurs')
  } finally {
    loading.value = false
  }
}

// Tri des utilisateurs
const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    // Admins en premier
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    // Puis par solde décroissant
    return (b.balance || 0) - (a.balance || 0)
  })
})

// Filtrage des utilisateurs
const filteredUsers = computed(() => {
  let result = sortedUsers.value
  
  // Recherche par nom ou email
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase().trim()
    result = result.filter(u => 
      (u.displayName?.toLowerCase() || '').includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  }
  
  // Filtre par rôle
  if (roleFilter.value) {
    result = result.filter(u => u.role === roleFilter.value)
  }
  
  // Filtre par solde
  if (balanceFilter.value === 'positive') {
    result = result.filter(u => (u.balance || 0) > 0)
  } else if (balanceFilter.value === 'negative') {
    result = result.filter(u => (u.balance || 0) < 0)
  } else if (balanceFilter.value === 'zero') {
    result = result.filter(u => (u.balance || 0) === 0)
  }
  
  return result
})

// Réinitialiser les filtres
const resetFilters = () => {
  searchQuery.value = ''
  roleFilter.value = ''
  balanceFilter.value = ''
}

// Statistiques
const totalPositiveBalance = computed(() => {
  return users.value
    .filter(u => (u.balance || 0) > 0)
    .reduce((sum, u) => sum + (u.balance || 0), 0)
})

const totalNegativeBalance = computed(() => {
  return users.value
    .filter(u => (u.balance || 0) < 0)
    .reduce((sum, u) => sum + (u.balance || 0), 0)
})

const totalBalance = computed(() => {
  return users.value.reduce((sum, u) => sum + (u.balance || 0), 0)
})

// Formatage de la monnaie
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

// Validation du formulaire
const validateForm = () => {
  validationErrors.value = {
    displayName: '',
    balance: ''
  }

  let isValid = true

  // Validation du nom
  if (!editForm.value.displayName || !editForm.value.displayName.trim()) {
    validationErrors.value.displayName = 'Le nom est requis'
    isValid = false
  } else if (editForm.value.displayName.trim().length < 2) {
    validationErrors.value.displayName = 'Le nom doit contenir au moins 2 caractères'
    isValid = false
  } else if (editForm.value.displayName.trim().length > 50) {
    validationErrors.value.displayName = 'Le nom ne peut pas dépasser 50 caractères'
    isValid = false
  }

  // Validation du solde
  if (typeof editForm.value.balance !== 'number' || isNaN(editForm.value.balance)) {
    validationErrors.value.balance = 'Le solde doit être un nombre valide'
    isValid = false
  } else if (editForm.value.balance < -99999 || editForm.value.balance > 99999) {
    validationErrors.value.balance = 'Le solde doit être entre -99 999€ et 99 999€'
    isValid = false
  }

  return isValid
}

// Ouvrir le modal d'édition
const openEditModal = (user) => {
  editForm.value = {
    id: user.id,
    displayName: user.displayName || '',
    email: user.email,
    balance: user.balance || 0,
    role: user.role || 'user'
  }
  validationErrors.value = { displayName: '', balance: '' }
  showEditModal.value = true
}

// Fermer le modal
const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    id: '',
    displayName: '',
    email: '',
    balance: 0,
    role: 'user'
  }
  validationErrors.value = { displayName: '', balance: '' }
}

// Sauvegarder l'utilisateur
const saveUser = async () => {
  // Validation
  if (!validateForm()) {
    showNotification('error', 'Erreur de validation', 'Veuillez corriger les erreurs dans le formulaire')
    return
  }

  // Avertissement si on change son propre rôle
  if (editForm.value.id === authStore.user.uid && editForm.value.role !== 'admin') {
    const confirm = window.confirm(
      '⚠️ ATTENTION !\n\n' +
      'Vous êtes sur le point de retirer vos droits administrateur.\n' +
      'Vous ne pourrez plus accéder à cette page.\n\n' +
      'Êtes-vous sûr de vouloir continuer ?'
    )
    if (!confirm) return
  }

  try {
    saving.value = true

    const userRef = doc(db, 'users', editForm.value.id)
    
    // Préparation des données
    const updateData = {
      displayName: editForm.value.displayName.trim(),
      balance: parseFloat(editForm.value.balance.toFixed(2)),
      role: editForm.value.role,
      updatedAt: new Date().toISOString()
    }

    await updateDoc(userRef, updateData)

    // Mise à jour locale pour éviter de recharger
    const userIndex = users.value.findIndex(u => u.id === editForm.value.id)
    if (userIndex !== -1) {
      users.value[userIndex] = {
        ...users.value[userIndex],
        ...updateData
      }
    }

    showNotification('success', 'Succès', 'Utilisateur mis à jour avec succès')
    closeEditModal()

    // Si on a changé son propre rôle, rediriger
    if (editForm.value.id === authStore.user.uid && editForm.value.role !== 'admin') {
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  } catch (error) {
    console.error('Erreur sauvegarde utilisateur:', error)
    showNotification('error', 'Erreur', `Impossible de sauvegarder : ${error.message}`)
  } finally {
    saving.value = false
  }
}

// Supprimer un utilisateur
const confirmDelete = async (user) => {
  if (user.id === authStore.user.uid) {
    showNotification('error', 'Action impossible', 'Vous ne pouvez pas supprimer votre propre compte')
    return
  }

  const confirmation = window.confirm(
    `⚠️ SUPPRESSION DÉFINITIVE\n\n` +
    `Utilisateur : ${user.displayName || user.email}\n` +
    `Solde : ${formatCurrency(user.balance || 0)}\n\n` +
    `Cette action est IRRÉVERSIBLE !\n` +
    `Toutes les données de cet utilisateur seront perdues.\n\n` +
    `Êtes-vous absolument sûr ?`
  )

  if (!confirmation) return

  // Double confirmation pour les admins
  if (user.role === 'admin') {
    const doubleConfirm = window.confirm(
      `⚠️ ATTENTION : Vous supprimez un ADMINISTRATEUR !\n\n` +
      `Confirmez-vous la suppression de ${user.displayName || user.email} ?`
    )
    if (!doubleConfirm) return
  }

  try {
    loading.value = true

    // 1. Supprimer les transactions liées
    const transactionsRef = collection(db, 'transactions')
    const userTransactionsQuery = query(transactionsRef, where('userId', '==', user.id))
    const transactionsSnapshot = await getDocs(userTransactionsQuery)
    
    const deletePromises = transactionsSnapshot.docs.map(transDoc => 
      deleteDoc(doc(db, 'transactions', transDoc.id))
    )
    await Promise.all(deletePromises)

    // 2. Supprimer l'utilisateur
    await deleteDoc(doc(db, 'users', user.id))

    // 3. Mise à jour locale
    users.value = users.value.filter(u => u.id !== user.id)

    showNotification(
      'success', 
      'Utilisateur supprimé', 
      `${user.displayName || user.email} et ${transactionsSnapshot.size} transaction(s) ont été supprimés`
    )
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    showNotification('error', 'Erreur', `Impossible de supprimer : ${error.message}`)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>