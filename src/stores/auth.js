import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/firebase/config'
import { useFirebase } from '@/composables/useFirebase'

export const useAuthStore = defineStore('auth', () => {
  const { createUserProfile, getUserProfile } = useFirebase()
  
  const user = ref(null)
  const userProfile = ref(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => userProfile.value?.role === 'admin')

  const initAuth = () => {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          user.value = firebaseUser
          userProfile.value = await getUserProfile(firebaseUser.uid)
        } else {
          user.value = null
          userProfile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  const register = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await createUserProfile(userCredential.user.uid, {
      email,
      displayName
    })
    userProfile.value = await getUserProfile(userCredential.user.uid)
  }

  const login = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password)
    userProfile.value = await getUserProfile(auth.currentUser.uid)
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
    userProfile.value = null
  }

  const refreshProfile = async () => {
    if (user.value) {
      userProfile.value = await getUserProfile(user.value.uid)
    }
  }

  return {
    user,
    userProfile,
    loading,
    isAuthenticated,
    isAdmin,
    initAuth,
    register,
    login,
    logout,
    refreshProfile
  }
})
