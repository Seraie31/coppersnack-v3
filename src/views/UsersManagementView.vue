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
          <p class="text-sm text-gray-400 mb-2">Soldes Positifs</p>
          <p class="text-3xl font-bold text-green-400">{{ positiveBalanceCount }}</p>
        </div>

        <div class="card bg-red-900/30">
          <p class="text-sm text-gray-400 mb-2">Soldes Négatifs</p>
          <p class="text-3xl font-bold text-red-400">{{ negativeBalanceCount }}</p>
        </div>

        <div class="card bg-purple-900/30">
          <p class="text-sm text-gray-400 mb-2">Total Cumulé</p>
          <p class="text-3xl font-bold" :class="totalBalance >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ formatCurrency(totalBalance) }}
          </p>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="card">
        <div v-if="loading" class="text-center py-12">
          <p class="text-gray-400">Chargement...</p>
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
                  v-for="user in sortedUsers" 
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
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        title="Modifier"
                      >
                        ✏️
                      </button>
                      <button 
                        @click="confirmDelete(user)"
                        class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                        title="Supprimer"
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
              v-for="user in sortedUsers" 
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
                  class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
                >
                  ✏️ Modifier
                </button>
                <button 
                  @click="confirmDelete(user)"
                  class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold"
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
            <label class="block text-sm font-medium mb-2">Nom</label>
            <input 
              v-model="editForm.displayName" 
              type="text"
              class="input-field"
              placeholder="Nom de l'utilisateur"
            >
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
          </div>

          <!-- Solde -->
          <div>
            <label class="block text-sm font-medium mb-2">Solde (€)</label>
            <div class="flex gap-2">
              <input 
                v-model.number="editForm.balance" 
                type="number"
                step="0.01"
                class="input-field flex-1"
              >
              <button 
                @click="editForm.balance = 0"
                class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <!-- Rôle -->
          <div>
            <label class="block text-sm font-medium mb-2">Rôle</label>
            <select v-model="editForm.role" class="input-field">
              <option value="user">👤 Utilisateur</option>
              <option value="admin">👑 Administrateur</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <button 
              @click="closeEditModal"
              class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold"
            >
              Annuler
            </button>
            <button 
              @click="saveUser"
              :disabled="saving"
              class="flex-1 btn-primary disabled:opacity-50"
            >
              {{ saving ? 'Sauvegarde...' : 'Enregistrer' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Navbar from '@/components/Navbar.vue'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const users = ref([])
const showEditModal = ref(false)
const editForm = ref({
  id: '',
  displayName: '',
  email: '',
  balance: 0,
  role: 'user'
})

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    alert('❌ Accès réservé aux administrateurs')
    router.push('/')
    return
  }

  await loadUsers()
})

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
    alert('❌ Erreur lors du chargement des utilisateurs')
  } finally {
    loading.value = false
  }
}

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    // Admins en premier
    if (a.role === 'admin' && b.role !== 'admin') return -1
    if (a.role !== 'admin' && b.role === 'admin') return 1
    // Puis par solde décroissant
    return (b.balance || 0) - (a.balance || 0)
  })
})

const positiveBalanceCount = computed(() => {
  return users.value.filter(u => (u.balance || 0) >= 0).length
})

const negativeBalanceCount = computed(() => {
  return users.value.filter(u => (u.balance || 0) < 0).length
})

const totalBalance = computed(() => {
  return users.value.reduce((sum, u) => sum + (u.balance || 0), 0)
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const openEditModal = (user) => {
  editForm.value = {
    id: user.id,
    displayName: user.displayName || '',
    email: user.email,
    balance: user.balance || 0,
    role: user.role || 'user'
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editForm.value = {
    id: '',
    displayName: '',
    email: '',
    balance: 0,
    role: 'user'
  }
}

const saveUser = async () => {
  try {
    saving.value = true

    const userRef = doc(db, 'users', editForm.value.id)
    await updateDoc(userRef, {
      displayName: editForm.value.displayName,
      balance: editForm.value.balance,
      role: editForm.value.role
    })

    alert('✅ Utilisateur mis à jour avec succès !')
    closeEditModal()
    await loadUsers()
  } catch (error) {
    console.error('Erreur sauvegarde utilisateur:', error)
    alert('❌ Erreur lors de la sauvegarde')
  } finally {
    saving.value = false
  }
}

const confirmDelete = async (user) => {
  if (user.id === authStore.user.uid) {
    alert('❌ Vous ne pouvez pas supprimer votre propre compte')
    return
  }

  const confirmation = confirm(
    `⚠️ Supprimer définitivement l'utilisateur "${user.displayName || user.email}" ?\n\n` +
    `Cette action est irréversible !`
  )

  if (!confirmation) return

  try {
    await deleteDoc(doc(db, 'users', user.id))
    alert('✅ Utilisateur supprimé avec succès')
    await loadUsers()
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error)
    alert('❌ Erreur lors de la suppression')
  }
}
</script>
