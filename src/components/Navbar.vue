<template>
  <nav class="bg-dark-200 border-b border-gray-800">
    <div class="container mx-auto px-2 sm:px-4">
      <div class="flex items-center justify-between h-14 sm:h-16">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-1 sm:space-x-2">
          <span class="text-xl sm:text-2xl">🍫</span>
          <span class="text-sm sm:text-xl font-bold text-primary">CopperSnack 3.0</span>
        </router-link>

        <!-- Navigation Desktop -->
        <div v-if="authStore.user" class="hidden md:flex items-center gap-4">
          <!-- Solde -->
          <router-link 
            to="/profile" 
            class="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-dark-300 transition-colors"
            :class="balance < 0 ? 'bg-red-900/30' : 'bg-dark-300'"
          >
            <span class="text-2xl">💰</span>
            <span 
              class="font-bold text-lg"
              :class="balance < 0 ? 'text-red-400' : 'text-green-400'"
            >
              {{ formatCurrency(balance) }}
            </span>
          </router-link>

          <router-link to="/profile" class="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors">
            Profil
          </router-link>

          <router-link 
            v-if="authStore.user?.role === 'admin'"
            to="/admin"
            class="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors font-semibold"
          >
            👑 Admin
          </router-link>

          <button 
            @click="handleLogout"
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>

        <!-- Navigation Mobile -->
        <div v-if="authStore.user" class="flex md:hidden items-center gap-2">
          <!-- Solde Mobile -->
          <router-link 
            to="/profile" 
            class="flex items-center gap-1 px-2 py-1 rounded-lg"
            :class="balance < 0 ? 'bg-red-900/30' : 'bg-dark-300'"
          >
            <span class="text-lg">💰</span>
            <span 
              class="font-bold text-sm"
              :class="balance < 0 ? 'text-red-400' : 'text-green-400'"
            >
              {{ formatCurrency(balance) }}
            </span>
          </router-link>

          <!-- Menu Burger -->
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 bg-dark-300 rounded-lg">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Menu Mobile Dropdown -->
      <div v-if="mobileMenuOpen && authStore.user" class="md:hidden py-3 border-t border-gray-700 space-y-2">
        <router-link 
          @click="mobileMenuOpen = false"
          to="/profile" 
          class="block px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors text-center"
        >
          👤 Mon Profil
        </router-link>

        <router-link 
          v-if="authStore.user?.role === 'admin'"
          @click="mobileMenuOpen = false"
          to="/admin"
          class="block px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors text-center font-semibold"
        >
          👑 Administration
        </router-link>

        <button 
          @click="handleLogout"
          class="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          🚪 Déconnexion
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase/config'

const authStore = useAuthStore()
const router = useRouter()
const mobileMenuOpen = ref(false)

const balance = computed(() => authStore.user?.balance ?? 0)

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const handleLogout = async () => {
  mobileMenuOpen.value = false
  await authStore.logout()
  router.push('/login')
}

onMounted(() => {
  if (authStore.user?.uid) {
    const userRef = doc(db, 'users', authStore.user.uid)
    
    const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data()
        if (authStore.user) {
          authStore.user.balance = userData.balance || 0
          authStore.user.role = userData.role || 'user'
        }
      }
    })

    return () => unsubscribe()
  }
})

watch(() => authStore.user?.uid, (newUid) => {
  if (newUid) {
    const userRef = doc(db, 'users', newUid)
    onSnapshot(userRef, (docSnapshot) => {
      if (docSnapshot.exists() && authStore.user) {
        const userData = docSnapshot.data()
        authStore.user.balance = userData.balance || 0
        authStore.user.role = userData.role || 'user'
      }
    })
  }
})
</script>
