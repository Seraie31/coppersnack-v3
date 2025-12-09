<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold">👑 Dashboard Administrateur</h1>
        <button @click="$router.push('/')" class="px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors">
          ← Retour
        </button>
      </div>

      <!-- Statistiques Rapides -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Produits -->
        <div class="card bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Total Produits</p>
              <p class="text-3xl font-bold text-blue-400">{{ products.length }}</p>
            </div>
            <div class="text-5xl">📦</div>
          </div>
        </div>

        <!-- Stock Total -->
        <div class="card bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Stock Total</p>
              <p class="text-3xl font-bold text-green-400">{{ totalStock }}</p>
            </div>
            <div class="text-5xl">📊</div>
          </div>
        </div>

        <!-- Caisse Frigo -->
        <div class="card bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Caisse Frigo</p>
              <p class="text-3xl font-bold text-purple-400">{{ formatCurrency(frigoBalance) }}</p>
            </div>
            <div class="text-5xl">🧊</div>
          </div>
        </div>

        <!-- Caisse CSE -->
        <div class="card bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-700/50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-400 mb-1">Caisse CSE</p>
              <p class="text-3xl font-bold text-orange-400">{{ formatCurrency(cseBalance) }}</p>
            </div>
            <div class="text-5xl">💼</div>
          </div>
        </div>
      </div>

      <!-- Actions Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Gestion Produits -->
        <div class="card hover:scale-105 transition-transform cursor-pointer group" @click="toggleProductsSection">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold flex items-center gap-3">
              <span class="text-4xl">🍫</span>
              Gestion Produits
            </h2>
            <svg 
              class="w-6 h-6 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-4">Ajouter, modifier ou supprimer des produits du catalogue</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="px-3 py-1 bg-blue-900/50 rounded-full">{{ products.length }} produits</span>
            <span class="px-3 py-1 bg-green-900/50 rounded-full">{{ totalStock }} en stock</span>
          </div>
        </div>

        <!-- Gestion Utilisateurs -->
        <router-link to="/users-management" class="card hover:scale-105 transition-transform cursor-pointer group">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold flex items-center gap-3">
              <span class="text-4xl">👥</span>
              Utilisateurs
            </h2>
            <svg 
              class="w-6 h-6 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-4">Gérer les comptes, soldes et permissions des utilisateurs</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="px-3 py-1 bg-purple-900/50 rounded-full">Voir les soldes</span>
            <span class="px-3 py-1 bg-orange-900/50 rounded-full">Modifier</span>
          </div>
        </router-link>

        <!-- Gestion Caisses -->
        <router-link to="/cash-registers" class="card hover:scale-105 transition-transform cursor-pointer group">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-2xl font-bold flex items-center gap-3">
              <span class="text-4xl">💰</span>
              Caisses
            </h2>
            <svg 
              class="w-6 h-6 transition-transform group-hover:translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-4">Gérer la caisse Frigo et CSE, effectuer des transferts</p>
          <div class="flex items-center gap-4 text-sm">
            <span class="px-3 py-1 bg-green-900/50 rounded-full">Frigo: {{ formatCurrency(frigoBalance) }}</span>
            <span class="px-3 py-1 bg-blue-900/50 rounded-full">CSE: {{ formatCurrency(cseBalance) }}</span>
          </div>
        </router-link>
      </div>

      <!-- Section Gestion Produits (Extensible) -->
      <transition name="slide-fade">
        <div v-if="showProductsSection" class="mt-8">
          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-2xl font-bold">🛒 Gestion des Produits</h2>
              <button 
                @click="toggleProductsSection"
                class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                ✕ Fermer
              </button>
            </div>

            <!-- Formulaire Ajout Produit -->
            <div class="mb-8 p-6 bg-dark-200 rounded-xl">
              <h3 class="text-xl font-bold mb-4">Ajouter un nouveau produit</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-2">Nom du produit</label>
                  <input 
                    v-model="newProduct.name" 
                    type="text"
                    class="input-field"
                    placeholder="Ex: Coca-Cola"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Prix (€)</label>
                  <input 
                    v-model.number="newProduct.price" 
                    type="number"
                    step="0.01"
                    class="input-field"
                    placeholder="1.00"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">Catégorie</label>
                  <select v-model="newProduct.category" class="input-field">
                    <option value="">Sélectionner...</option>
                    <option value="boissons">🥤 Boissons</option>
                    <option value="snacks">🍫 Snacks</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium mb-2">🏪 Stock Réserve (initial)</label>
                  <input 
                    v-model.number="newProduct.stockReserve" 
                    type="number"
                    class="input-field"
                    placeholder="20"
                  >
                  <p class="text-xs text-gray-400 mt-1">Produits achetés/stockés dans le local</p>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium mb-2">URL de l'image (optionnel)</label>
                  <input 
                    v-model="newProduct.image" 
                    type="text"
                    class="input-field"
                    placeholder="https://example.com/image.jpg"
                  >
                </div>
              </div>

              <button 
                @click="addProduct"
                :disabled="!canAddProduct"
                class="mt-4 w-full btn-primary disabled:opacity-50"
              >
                ➕ Ajouter le produit (Stock Réserve)
              </button>
            </div>

            <!-- Liste Produits avec Double Stock -->
            <div>
              <h3 class="text-xl font-bold mb-4">Produits existants ({{ products.length }})</h3>
              
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-700">
                      <th class="text-left py-3 px-4">Produit</th>
                      <th class="text-left py-3 px-4">Catégorie</th>
                      <th class="text-right py-3 px-4">Prix</th>
                      <th class="text-center py-3 px-4">🏪 Réserve</th>
                      <th class="text-center py-3 px-4">🧊 Frigo</th>
                      <th class="text-center py-3 px-4">Transfert</th>
                      <th class="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="product in products" 
                      :key="product.id"
                      class="border-b border-gray-800 hover:bg-dark-300 transition-colors"
                    >
                      <td class="py-3 px-4">
                        <div class="flex items-center gap-3">
                          <img 
                            v-if="product.image" 
                            :src="product.image" 
                            :alt="product.name"
                            class="w-12 h-12 rounded object-cover"
                          >
                          <span class="text-4xl" v-else>📦</span>
                          <span class="font-semibold">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-3 py-1 bg-dark-400 rounded-full text-sm">
                          {{ product.category === 'boissons' ? '🥤' : '🍫' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right font-bold text-green-400">
                        {{ formatCurrency(product.price) }}
                      </td>
                      
                      <!-- Stock Réserve -->
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <button 
                            @click="updateStockReserve(product.id, -1)"
                            class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            -1
                          </button>
                          <span 
                            class="px-3 py-1 rounded font-bold bg-purple-900/40 text-purple-400"
                          >
                            {{ product.stockReserve || 0 }}
                          </span>
                          <button 
                            @click="updateStockReserve(product.id, 1)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            +1
                          </button>
                          <button 
                            @click="updateStockReserve(product.id, 10)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <!-- Stock Frigo -->
                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <button 
                            @click="updateStockFrigo(product.id, -1)"
                            class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            -1
                          </button>
                          <span 
                            class="px-3 py-1 rounded font-bold"
                            :class="getStockClass(product.stockFrigo || 0)"
                          >
                            {{ product.stockFrigo || 0 }}
                          </span>
                          <button 
                            @click="updateStockFrigo(product.id, 1)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                          >
                            +1
                          </button>
                        </div>
                      </td>

                      <!-- Transfert Réserve → Frigo -->
                      <td class="py-3 px-4 text-center">
                        <div class="flex flex-col gap-2">
                          <button 
                            @click="transferToFrigo(product, 1)"
                            :disabled="(product.stockReserve || 0) < 1"
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 rounded text-sm"
                          >
                            → 1
                          </button>
                          <button 
                            @click="transferToFrigo(product, 5)"
                            :disabled="(product.stockReserve || 0) < 5"
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 rounded text-sm"
                          >
                            → 5
                          </button>
                          <button 
                            v-if="authStore.user?.role === 'admin'"
                            @click="openReassort(product)"
                            class="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                          >
                            Réassort
                          </button>
                        </div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-2">
                          <button 
                            @click="openEditModal(product)"
                            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          >
                            ✏️
                          </button>
                          <button 
                            @click="confirmDelete(product)"
                            class="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Modal Réassort -->
    <div
      v-if="showReassort && selectedProduct"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click.self="showReassort = false"
    >
      <div class="card max-w-md w-full">
        <h2 class="text-2xl font-bold mb-4">
          Réassort – {{ selectedProduct.name }}
        </h2>

        <p class="text-xs text-gray-400 mb-4">
          Réserve actuelle : {{ selectedProduct.stockReserve || 0 }} •
          Frigo actuel : {{ selectedProduct.stockFrigo || 0 }}
        </p>

        <div class="space-y-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">Quantité achetée</label>
            <input
              v-model.number="qtyBought"
              type="number"
              min="0"
              class="input-field"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Quantité vers frigo</label>
            <input
              v-model.number="qtyToFridge"
              type="number"
              min="0"
              :max="qtyBought"
              class="input-field"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            @click="showReassort = false"
          >
            Annuler
          </button>
          <button
            class="px-4 py-2 btn-primary"
            @click="applyReassort"
          >
            Valider
          </button>
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
        <h2 class="text-2xl font-bold mb-6">Modifier le produit</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nom</label>
            <input v-model="editForm.name" type="text" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Prix (€)</label>
            <input v-model.number="editForm.price" type="number" step="0.01" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Catégorie</label>
            <select v-model="editForm.category" class="input-field">
              <option value="boissons">🥤 Boissons</option>
              <option value="snacks">🍫 Snacks</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Stock</label>
            <input v-model.number="editForm.stock" type="number" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">URL Image</label>
            <input v-model="editForm.image" type="text" class="input-field">
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeEditModal" class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
              Annuler
            </button>
            <button @click="saveProduct" class="flex-1 btn-primary">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { doc, updateDoc, increment, deleteDoc, addDoc, collection, getDoc } from 'firebase/firestore'
import { db } from '@/firebase/config'
import Navbar from '@/components/Navbar.vue'

const productsStore = useProductsStore()
const authStore = useAuthStore()
const router = useRouter()

const showProductsSection = ref(false)
const showEditModal = ref(false)
const showReassort = ref(false)
const frigoBalance = ref(0)
const cseBalance = ref(0)

const selectedProduct = ref(null)
const qtyBought = ref(0)
const qtyToFridge = ref(0)

const newProduct = ref({
  name: '',
  price: 0,
  category: '',
  stockReserve: 0,
  image: ''
})

const editForm = ref({
  id: '',
  name: '',
  price: 0,
  category: '',
  stockReserve: 0,
  stockFrigo: 0,
  image: ''
})

const products = computed(() => productsStore.products)
const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.stockFrigo || 0) + (p.stockReserve || 0), 0)
})

const canAddProduct = computed(() => {
  return newProduct.value.name && 
         newProduct.value.price > 0 && 
         newProduct.value.category && 
         newProduct.value.stockReserve >= 0
})

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    alert('❌ Accès réservé aux administrateurs')
    router.push('/')
    return
  }

  await productsStore.fetchProducts()
  await loadCashBalances()
})

const loadCashBalances = async () => {
  try {
    const frigoDoc = await getDoc(doc(db, 'cashRegisters', 'frigo'))
    if (frigoDoc.exists()) {
      frigoBalance.value = frigoDoc.data().balance || 0
    }

    const cseDoc = await getDoc(doc(db, 'cashRegisters', 'cse'))
    if (cseDoc.exists()) {
      cseBalance.value = cseDoc.data().balance || 0
    }
  } catch (error) {
    console.error('Erreur chargement caisses:', error)
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount || 0)
}

const getStockClass = (stock) => {
  if (stock === 0) return 'bg-red-900/40 text-red-400'
  if (stock <= 5) return 'bg-orange-900/40 text-orange-400'
  return 'bg-green-900/40 text-green-400'
}

const toggleProductsSection = () => {
  showProductsSection.value = !showProductsSection.value
}

const addProduct = async () => {
  try {
    await addDoc(collection(db, 'products'), {
      name: newProduct.value.name,
      price: newProduct.value.price,
      category: newProduct.value.category,
      stockReserve: newProduct.value.stockReserve,
      stockFrigo: 0,
      image: newProduct.value.image || ''
    })

    alert('✅ Produit ajouté au Stock Réserve !')
    newProduct.value = { name: '', price: 0, category: '', stockReserve: 0, image: '' }
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur ajout produit:', error)
    alert('❌ Erreur lors de l\'ajout')
  }
}

const updateStockReserve = async (productId, change) => {
  try {
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, {
      stockReserve: increment(change)
    })
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur mise à jour stock réserve:', error)
    alert('❌ Erreur lors de la mise à jour')
  }
}

const updateStockFrigo = async (productId, change) => {
  try {
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, {
      stockFrigo: increment(change)
    })
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur mise à jour stock frigo:', error)
    alert('❌ Erreur lors de la mise à jour')
  }
}

const transferToFrigo = async (product, quantity) => {
  const currentReserve = product.stockReserve || 0
  
  if (currentReserve < quantity) {
    alert(`❌ Stock réserve insuffisant (${currentReserve} disponible)`)
    return
  }

  if (!confirm(`Transférer ${quantity} ${product.name} de la Réserve vers le Frigo ?`)) {
    return
  }

  try {
    const productRef = doc(db, 'products', product.id)
    await updateDoc(productRef, {
      stockReserve: increment(-quantity),
      stockFrigo: increment(quantity)
    })

    alert(`✅ ${quantity} ${product.name} transféré(s) vers le Frigo !`)
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur transfert:', error)
    alert('❌ Erreur lors du transfert')
  }
}

const openEditModal = (product) => {
  editForm.value = {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    stockReserve: product.stockReserve || 0,
    stockFrigo: product.stockFrigo || 0,
    image: product.image || ''
  }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
}

const saveProduct = async () => {
  try {
    const productRef = doc(db, 'products', editForm.value.id)
    await updateDoc(productRef, {
      name: editForm.value.name,
      price: editForm.value.price,
      category: editForm.value.category,
      stockReserve: editForm.value.stockReserve,
      stockFrigo: editForm.value.stockFrigo,
      image: editForm.value.image
    })

    alert('✅ Produit modifié avec succès !')
    closeEditModal()
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur modification:', error)
    alert('❌ Erreur lors de la modification')
  }
}

const confirmDelete = async (product) => {
  if (!confirm(`Supprimer "${product.name}" ?`)) return

  try {
    await deleteDoc(doc(db, 'products', product.id))
    alert('✅ Produit supprimé !')
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur suppression:', error)
    alert('❌ Erreur lors de la suppression')
  }
}

const openReassort = (product) => {
  selectedProduct.value = product
  qtyBought.value = 0
  qtyToFridge.value = 0
  showReassort.value = true
}

const applyReassort = async () => {
  if (!selectedProduct.value) return

  const bought = Number(qtyBought.value) || 0
  const toFridge = Number(qtyToFridge.value) || 0

  if (bought < 0 || toFridge < 0 || toFridge > bought) {
    alert('Valeurs invalides. Le frigo doit être ≤ acheté, et pas de négatif.')
    return
  }

  const currentReserve = selectedProduct.value.stockReserve || 0
  const currentFridge = selectedProduct.value.stockFrigo || 0

  const newReserve = currentReserve + bought - toFridge
  const newFridge = currentFridge + toFridge

  try {
    const productRef = doc(db, 'products', selectedProduct.value.id)
    await updateDoc(productRef, {
      stockReserve: newReserve,
      stockFrigo: newFridge
    })

    // Mise à jour locale du tableau
    selectedProduct.value.stockReserve = newReserve
    selectedProduct.value.stockFrigo = newFridge

    showReassort.value = false
    alert('✅ Réassort appliqué')
  } catch (e) {
    console.error('Erreur réassort :', e)
    alert('❌ Erreur lors du réassort')
  }
}
</script>