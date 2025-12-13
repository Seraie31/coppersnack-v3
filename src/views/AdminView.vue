<template>
  <div>
    <Navbar />
    
    <div class="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6 sm:mb-8">
        <h1 class="text-2xl sm:text-3xl font-bold">👑 Dashboard Admin</h1>
        <button @click="$router.push('/')" class="px-3 sm:px-4 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors text-sm sm:text-base">
          ← Retour
        </button>
      </div>

      <!-- Statistiques Rapides -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div class="card bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Total Produits</p>
              <p class="text-2xl sm:text-3xl font-bold text-blue-400">{{ products.length }}</p>
            </div>
            <div class="text-3xl sm:text-5xl">📦</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Stock Total</p>
              <p class="text-2xl sm:text-3xl font-bold text-green-400">{{ totalStock }}</p>
            </div>
            <div class="text-3xl sm:text-5xl">📊</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Caisse Frigo</p>
              <p class="text-xl sm:text-3xl font-bold text-purple-400">{{ formatCurrency(frigoBalance) }}</p>
            </div>
            <div class="text-3xl sm:text-5xl">🧊</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-orange-900/50 to-orange-800/30 border border-orange-700/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Caisse CSE</p>
              <p class="text-xl sm:text-3xl font-bold text-orange-400">{{ formatCurrency(cseBalance) }}</p>
            </div>
            <div class="text-3xl sm:text-5xl">💼</div>
          </div>
        </div>

        <div class="card bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border border-yellow-700/50 p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm text-gray-400 mb-1">Promos actives</p>
              <p class="text-2xl sm:text-3xl font-bold text-yellow-400">{{ activePromotionsCount }}</p>
            </div>
            <div class="text-3xl sm:text-5xl">🏷️</div>
          </div>
        </div>
      </div>

      <!-- Alerte PRIORITAIRE : Réserve vide (À COMMANDER) -->
<div v-if="emptyReserveProducts.length > 0" class="card bg-purple-900/20 border border-purple-700/50 mb-6">
  <div class="flex items-center gap-3 mb-4">
    <span class="text-3xl">🛒</span>
    <div class="flex-1">
      <h3 class="text-lg sm:text-xl font-bold text-purple-400">À commander ! ({{ emptyReserveProducts.length }} produits)</h3>
      <p class="text-xs sm:text-sm text-gray-400">Stock réserve vide - Déclencher un achat</p>
    </div>
    <button 
      @click="generateShoppingList"
      class="px-3 sm:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs sm:text-sm font-bold transition-colors"
    >
      📋 Liste
    </button>
  </div>
  <div class="flex flex-wrap gap-2">
    <span 
      v-for="product in emptyReserveProducts" 
      :key="product.id"
      class="px-2 sm:px-3 py-1 bg-purple-900/40 rounded-full text-xs sm:text-sm font-bold"
    >
      {{ product.name }}: R{{ product.stockReserve || 0 }} | F{{ product.stockFrigo || 0 }}
    </span>
  </div>
</div>

<!-- Alerte Rupture Frigo -->
<div v-if="outOfStockProducts.length > 0" class="card bg-orange-900/20 border border-orange-700/50 mb-6">
  <div class="flex items-center gap-3 mb-3">
    <span class="text-2xl">🚫</span>
    <h3 class="text-lg font-bold text-orange-400">Rupture frigo ({{ outOfStockProducts.length }} produits)</h3>
  </div>
  <div class="flex flex-wrap gap-2">
    <span 
      v-for="product in outOfStockProducts" 
      :key="product.id"
      class="px-2 sm:px-3 py-1 bg-orange-900/40 rounded-full text-xs sm:text-sm"
    >
      {{ product.name }}
    </span>
  </div>
</div>

      <!-- Alertes Stock Bas -->
      <div v-if="lowStockProducts.length > 0" class="card bg-red-900/20 border border-red-700/50 mb-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="text-2xl">⚠️</span>
          <h3 class="text-lg font-bold text-red-400">Stock bas ({{ lowStockProducts.length }} produits)</h3>
        </div>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="product in lowStockProducts" 
            :key="product.id"
            class="px-3 py-1 bg-red-900/40 rounded-full text-sm"
          >
            {{ product.name }}: {{ product.stockFrigo }}
          </span>
        </div>
      </div>

      <!-- Actions Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div class="card hover:scale-105 transition-transform cursor-pointer group" @click="toggleProductsSection">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <span class="text-3xl sm:text-4xl">🍫</span>
              <span class="hidden sm:inline">Gestion Produits</span>
              <span class="sm:hidden">Produits</span>
            </h2>
            <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-3 sm:mb-4 text-sm">Ajouter, modifier ou supprimer des produits</p>
          <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span class="px-2 sm:px-3 py-1 bg-blue-900/50 rounded-full">{{ products.length }} produits</span>
            <span class="px-2 sm:px-3 py-1 bg-green-900/50 rounded-full">{{ totalStock }} en stock</span>
          </div>
        </div>

        <router-link to="/users-management" class="card hover:scale-105 transition-transform cursor-pointer group">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <span class="text-3xl sm:text-4xl">👥</span>
              Utilisateurs
            </h2>
            <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-3 sm:mb-4 text-sm">Gérer les comptes et soldes</p>
          <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <span class="px-2 sm:px-3 py-1 bg-purple-900/50 rounded-full">Soldes</span>
            <span class="px-2 sm:px-3 py-1 bg-orange-900/50 rounded-full">Modifier</span>
          </div>
        </router-link>

        <router-link to="/cash-registers" class="card hover:scale-105 transition-transform cursor-pointer group">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2 sm:gap-3">
              <span class="text-3xl sm:text-4xl">💰</span>
              Caisses
            </h2>
            <svg class="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-gray-400 mb-3 sm:mb-4 text-sm">Gérer Frigo et CSE</p>
          <div class="flex flex-col gap-1 text-xs sm:text-sm">
            <span class="px-2 sm:px-3 py-1 bg-green-900/50 rounded-full">Frigo: {{ formatCurrency(frigoBalance) }}</span>
            <span class="px-2 sm:px-3 py-1 bg-blue-900/50 rounded-full">CSE: {{ formatCurrency(cseBalance) }}</span>
          </div>
        </router-link>
      </div>

      <!-- Section Gestion Produits -->
      <transition name="slide-fade">
        <div v-if="showProductsSection" class="mt-6 sm:mt-8">
          <div class="card">
            <div class="flex items-center justify-between mb-4 sm:mb-6">
              <h2 class="text-xl sm:text-2xl font-bold">🛒 Gestion des Produits</h2>
              <button 
                @click="toggleProductsSection"
                class="px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
              >
                ✕ Fermer
              </button>
            </div>

            <!-- Barre de recherche et filtres -->
            <div class="mb-6 space-y-3">
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Rechercher un produit..."
                  class="w-full bg-dark-200 text-white rounded-lg px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                />
                <svg class="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <button
                  v-if="searchQuery"
                  @click="searchQuery = ''"
                  class="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div class="flex gap-2">
                <button
                  @click="filterCategory = 'all'"
                  :class="filterCategory === 'all' ? 'btn-primary' : 'btn-secondary'"
                  class="px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  Tous
                </button>
                <button
                  @click="filterCategory = 'boissons'"
                  :class="filterCategory === 'boissons' ? 'btn-primary' : 'btn-secondary'"
                  class="px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  🥤 Boissons
                </button>
                <button
                  @click="filterCategory = 'snacks'"
                  :class="filterCategory === 'snacks' ? 'btn-primary' : 'btn-secondary'"
                  class="px-3 sm:px-4 py-2 text-xs sm:text-sm"
                >
                  🍫 Snacks
                </button>
              </div>
            </div>

            <!-- Formulaire Ajout Produit -->
            <div class="mb-6 sm:mb-8 p-4 sm:p-6 bg-dark-200 rounded-xl">
              <h3 class="text-lg sm:text-xl font-bold mb-4">Ajouter un nouveau produit</h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label class="block text-xs sm:text-sm font-medium mb-2">Nom du produit</label>
                  <input 
                    v-model="newProduct.name" 
                    type="text"
                    class="input-field text-sm sm:text-base"
                    placeholder="Ex: Coca-Cola"
                  >
                </div>

                <div>
                  <label class="block text-xs sm:text-sm font-medium mb-2">Prix (€)</label>
                  <input 
                    v-model.number="newProduct.price" 
                    type="number"
                    step="0.01"
                    class="input-field text-sm sm:text-base"
                    placeholder="1.00"
                  >
                </div>

                <div>
                  <label class="block text-xs sm:text-sm font-medium mb-2">Catégorie</label>
                  <select v-model="newProduct.category" class="input-field text-sm sm:text-base">
                    <option value="">Sélectionner...</option>
                    <option value="boissons">🥤 Boissons</option>
                    <option value="snacks">🍫 Snacks</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs sm:text-sm font-medium mb-2">🏪 Stock Réserve</label>
                  <input 
                    v-model.number="newProduct.stockReserve" 
                    type="number"
                    class="input-field text-sm sm:text-base"
                    placeholder="20"
                  >
                  <p class="text-xs text-gray-400 mt-1">Stock initial dans le local</p>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs sm:text-sm font-medium mb-2">URL de l'image (optionnel)</label>
                  <input 
                    v-model="newProduct.image" 
                    type="text"
                    class="input-field text-sm sm:text-base"
                    placeholder="https://example.com/image.jpg"
                  >
                </div>
              </div>

              <button 
                @click="addProduct"
                :disabled="!canAddProduct"
                class="mt-4 w-full btn-primary disabled:opacity-50 text-sm sm:text-base"
              >
                ➕ Ajouter le produit
              </button>
            </div>

            <!-- Liste Produits -->
            <div>
              <h3 class="text-lg sm:text-xl font-bold mb-4">Produits ({{ filteredProducts.length }})</h3>
              
              <!-- Version Desktop (Tableau) -->
              <div class="hidden lg:block overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-700">
                      <th class="text-left py-3 px-4 text-sm">Produit</th>
                      <th class="text-left py-3 px-4 text-sm">Catégorie</th>
                      <th class="text-right py-3 px-4 text-sm">Prix</th>
                      <th class="text-center py-3 px-4 text-sm">🏷️ Promo</th>
                      <th class="text-center py-3 px-4 text-sm">🏪 Réserve</th>
                      <th class="text-center py-3 px-4 text-sm">🧊 Frigo</th>
                      <th class="text-center py-3 px-4 text-sm">Transfert</th>
                      <th class="text-center py-3 px-4 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr 
                      v-for="product in filteredProducts" 
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
                          <span class="font-semibold text-sm">{{ product.name }}</span>
                        </div>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-3 py-1 bg-dark-400 rounded-full text-xs">
                          {{ product.category === 'boissons' ? '🥤' : '🍫' }}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right font-bold text-green-400 text-sm">
                        {{ formatCurrency(product.price) }}
                      </td>
                      
                      <!-- ✨ NOUVELLE CELLULE PROMO -->
                      <td class="py-3 px-4 text-center">
                        <!-- Si pas de promo active -->
                        <button 
                          v-if="!product.promotion?.active"
                          @click="createPromotion(product)"
                          class="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-xs whitespace-nowrap"
                        >
                          🏷️ Créer
                        </button>
                        
                        <!-- Si promo active -->
                        <div v-else class="flex flex-col gap-1">
                          <span class="px-2 py-1 bg-yellow-900/40 text-yellow-400 rounded text-xs font-bold">
                            -{{ product.promotion.discount }}%
                          </span>
                          <div class="flex gap-1 justify-center">
                            <button 
                              @click="editPromotion(product)"
                              class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                              title="Modifier"
                            >
                              ✏️
                            </button>
                            <button 
                              @click="disablePromotion(product)"
                              class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                              title="Désactiver"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </td>

                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button 
                            @click="updateStockReserve(product.id, -1)"
                            class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          >
                            -1
                          </button>
                          <span class="px-2 py-1 rounded font-bold bg-purple-900/40 text-purple-400 text-sm">
                            {{ product.stockReserve || 0 }}
                          </span>
                          <button 
                            @click="updateStockReserve(product.id, 1)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                          >
                            +1
                          </button>
                          <button 
                            @click="updateStockReserve(product.id, 10)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                          >
                            +10
                          </button>
                        </div>
                      </td>

                      <td class="py-3 px-4 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <button 
                            @click="updateStockFrigo(product.id, -1)"
                            class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          >
                            -1
                          </button>
                          <span 
                            class="px-2 py-1 rounded font-bold text-sm"
                            :class="getStockClass(product.stockFrigo || 0)"
                          >
                            {{ product.stockFrigo || 0 }}
                          </span>
                          <button 
                            @click="updateStockFrigo(product.id, 1)"
                            class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                          >
                            +1
                          </button>
                          <button
                            @click="openAdjustFridge(product)"
                            class="px-2 py-1 bg-dark-400 hover:bg-dark-300 rounded text-xs"
                            title="Ajuster"
                          >
                            ⚙️
                          </button>
                        </div>
                      </td>

                      <td class="py-3 px-4 text-center">
                        <div class="flex flex-col gap-1">
                          <button 
                            @click="confirmTransfer(product, 1)"
                            :disabled="(product.stockReserve || 0) < 1"
                            class="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 rounded text-xs whitespace-nowrap"
                          >
                            → 1
                          </button>
                          <button 
                            @click="confirmTransfer(product, 5)"
                            :disabled="(product.stockReserve || 0) < 5"
                            class="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-30 rounded text-xs whitespace-nowrap"
                          >
                            → 5
                          </button>
                          <button 
                            @click="openReassort(product)"
                            class="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs"
                          >
                            Réassort
                          </button>
                        </div>
                      </td>

                      <td class="py-3 px-4">
                        <div class="flex items-center justify-center gap-1">
                          <button 
                            @click="openEditModal(product)"
                            class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                          >
                            ✏️
                          </button>
                          <button 
                            @click="confirmDelete(product)"
                            class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Version Mobile (Cartes) -->
              <div class="lg:hidden space-y-3">
                <div
                  v-for="product in filteredProducts"
                  :key="product.id"
                  class="bg-dark-200 rounded-lg p-4"
                >
                  <div class="flex items-center gap-3 mb-3">
                    <img 
                      v-if="product.image" 
                      :src="product.image" 
                      :alt="product.name"
                      class="w-16 h-16 rounded object-cover"
                    >
                    <span class="text-4xl" v-else>📦</span>
                    <div class="flex-1">
                      <h4 class="font-bold">{{ product.name }}</h4>
                      <div class="flex items-center gap-2">
                        <p class="text-primary font-bold">{{ formatCurrency(product.price) }}</p>
                        <span 
                          v-if="product.promotion?.active" 
                          class="px-2 py-1 bg-yellow-900/40 text-yellow-400 rounded text-xs font-bold"
                        >
                          🏷️ -{{ product.promotion.discount }}%
                        </span>
                      </div>
                      <span class="text-xs px-2 py-1 bg-dark-400 rounded-full">
                        {{ product.category === 'boissons' ? '🥤 Boisson' : '🍫 Snack' }}
                      </span>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-3 mb-3">
                    <div class="bg-dark-300 rounded p-2 text-center">
                      <p class="text-xs text-gray-400 mb-1">🏪 Réserve</p>
                      <p class="font-bold text-purple-400">{{ product.stockReserve || 0 }}</p>
                    </div>
                    <div class="bg-dark-300 rounded p-2 text-center">
                      <p class="text-xs text-gray-400 mb-1">🧊 Frigo</p>
                      <p class="font-bold" :class="getStockClass(product.stockFrigo || 0)">
                        {{ product.stockFrigo || 0 }}
                      </p>
                    </div>
                  </div>

                  <div class="flex gap-2">
                    <!-- ✨ BOUTON PROMO -->
                    <button 
                      v-if="!product.promotion?.active"
                      @click="createPromotion(product)"
                      class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs py-2"
                    >
                      🏷️ Promo
                    </button>
                    <button 
                      v-else
                      @click="editPromotion(product)"
                      class="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-xs py-2"
                    >
                      ✏️ Promo
                    </button>
                    
                    <button 
                      @click="openEditModal(product)"
                      class="flex-1 btn-secondary text-xs py-2"
                    >
                      ✏️ Modifier
                    </button>
                    <button 
                      @click="confirmDelete(product)"
                      class="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs py-2"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
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
        <h2 class="text-xl sm:text-2xl font-bold mb-4">
          Réassort – {{ selectedProduct.name }}
        </h2>

        <p class="text-xs text-gray-400 mb-4">
          Réserve: {{ selectedProduct.stockReserve || 0 }} • Frigo: {{ selectedProduct.stockFrigo || 0 }}
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

    <!-- Modal Ajustement Frigo -->
    <div
      v-if="showAdjustFridge && fridgeProduct"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      @click.self="showAdjustFridge = false"
    >
      <div class="card max-w-md w-full">
        <h2 class="text-xl sm:text-2xl font-bold mb-4">
          Ajuster le stock frigo – {{ fridgeProduct.name }}
        </h2>

        <p class="text-xs text-gray-400 mb-4">
          Stock frigo actuel: {{ fridgeProduct.stockFrigo || 0 }}
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium mb-1">Nouveau stock frigo</label>
          <input
            v-model.number="newFridgeValue"
            type="number"
            min="0"
            class="input-field"
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            @click="showAdjustFridge = false"
          >
            Annuler
          </button>
          <button
            class="px-4 py-2 btn-primary"
            @click="applyAdjustFridge"
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
        <h2 class="text-xl sm:text-2xl font-bold mb-6">Modifier le produit</h2>

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
            <label class="block text-sm font-medium mb-2">Stock Réserve</label>
            <input v-model.number="editForm.stockReserve" type="number" class="input-field">
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">Stock Frigo</label>
            <input v-model.number="editForm.stockFrigo" type="number" class="input-field">
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

    <!-- Modal Confirmation Transfert -->
    <div 
      v-if="showTransferConfirm"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full">
        <div class="text-center mb-4">
          <div class="text-5xl mb-3">🔄</div>
          <h2 class="text-xl font-bold mb-2">Confirmer le transfert</h2>
          <p class="text-gray-400">
            Transférer <span class="text-primary font-bold">{{ transferData.quantity }}</span> 
            {{ transferData.product?.name }} de la Réserve vers le Frigo ?
          </p>
        </div>

        <div class="flex gap-3">
          <button @click="showTransferConfirm = false" class="flex-1 btn-secondary">
            Annuler
          </button>
          <button @click="executeTransfer" class="flex-1 btn-primary">
            Confirmer
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmation Suppression -->
    <div 
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    >
      <div class="card max-w-md w-full border-2 border-red-500/50">
        <div class="text-center mb-4">
          <div class="text-5xl mb-3">⚠️</div>
          <h2 class="text-xl font-bold text-red-400 mb-2">Attention</h2>
          <p class="text-gray-400">
            Supprimer définitivement 
            <span class="text-white font-bold">{{ deleteData.product?.name }}</span> ?
          </p>
          <p class="text-xs text-gray-500 mt-2">Cette action est irréversible</p>
        </div>

        <div class="flex gap-3">
          <button @click="showDeleteConfirm = false" class="flex-1 btn-secondary">
            Annuler
          </button>
          <button @click="executeDelete" class="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2">
            Supprimer
          </button>
        </div>
      </div>
    </div>

    <!-- Message de succès -->
    <div v-if="showSuccess" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm w-full text-center animate-bounce-in">
        <div class="text-5xl mb-4">✅</div>
        <p class="text-lg font-bold">{{ successMessage }}</p>
      </div>
    </div>

    <!-- Message d'erreur -->
    <div v-if="showError" class="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4">
      <div class="bg-dark-100 rounded-xl p-6 max-w-sm w-full text-center">
        <div class="text-5xl mb-4">❌</div>
        <p class="text-lg font-bold mb-2">Erreur</p>
        <p class="text-gray-400 mb-4">{{ errorMessage }}</p>
        <button @click="showError = false" class="btn-primary w-full">OK</button>
      </div>
    </div>
    <!-- Modal Promotion -->
    <PromotionModal
      :show="showPromotionModal"
      :product="selectedProductForPromo"
      :edit-mode="editPromotionMode"
      @close="showPromotionModal = false"
      @save="savePromotion"
    />
  </div>
</template>

<script setup>
import PromotionModal from '@/components/PromotionModal.vue'
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
const showAdjustFridge = ref(false)
const showTransferConfirm = ref(false)
const showDeleteConfirm = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
// ✨ PROMO - Ajouter ces 3 lignes
const showPromotionModal = ref(false)
const selectedProductForPromo = ref(null)
const editPromotionMode = ref(false)
const searchQuery = ref('')
const filterCategory = ref('all')

const frigoBalance = ref(0)
const cseBalance = ref(0)

const selectedProduct = ref(null)
const fridgeProduct = ref(null)
const deleteData = ref({ product: null })
const transferData = ref({ product: null, quantity: 0 })

const qtyBought = ref(0)
const qtyToFridge = ref(0)
const newFridgeValue = ref(0)

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

const filteredProducts = computed(() => {
  let filtered = products.value

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query)
    )
  }

  if (filterCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category === filterCategory.value)
  }

  return filtered
})

const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.stockFrigo || 0) + (p.stockReserve || 0), 0)
})

const lowStockProducts = computed(() => {
  return products.value.filter(p => (p.stockFrigo || 0) > 0 && (p.stockFrigo || 0) <= 5)
})

const canAddProduct = computed(() => {
  return newProduct.value.name && 
         newProduct.value.price > 0 && 
         newProduct.value.category && 
         newProduct.value.stockReserve >= 0
})

// Produits avec stock réserve vide (À COMMANDER)
const emptyReserveProducts = computed(() => {
  return products.value.filter(p => (p.stockReserve || 0) === 0)
})

// Produits en rupture frigo
const outOfStockProducts = computed(() => {
  return products.value.filter(p => (p.stockFrigo || 0) === 0)
})

// ✨ Compter les promos actives
const activePromotionsCount = computed(() => {
  return products.value.filter(p => p.promotion?.active).length
})

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

onMounted(async () => {
  if (!authStore.user || authStore.user.role !== 'admin') {
    showErrorMessage('Accès réservé aux administrateurs')
    setTimeout(() => {
      router.push('/')
    }, 2000)
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

    showSuccessMessage('Produit ajouté !')
    newProduct.value = { name: '', price: 0, category: '', stockReserve: 0, image: '' }
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur ajout produit:', error)
    showErrorMessage('Erreur lors de l\'ajout')
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
    showErrorMessage('Erreur mise à jour')
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
    showErrorMessage('Erreur mise à jour')
  }
}

const confirmTransfer = (product, quantity) => {
  const currentReserve = product.stockReserve || 0
  
  if (currentReserve < quantity) {
    showErrorMessage(`Stock réserve insuffisant (${currentReserve} disponible)`)
    return
  }

  transferData.value = { product, quantity }
  showTransferConfirm.value = true
}

const executeTransfer = async () => {
  const { product, quantity } = transferData.value

  try {
    const productRef = doc(db, 'products', product.id)
    await updateDoc(productRef, {
      stockReserve: increment(-quantity),
      stockFrigo: increment(quantity)
    })

    showSuccessMessage(`${quantity} ${product.name} transféré(s) !`)
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur transfert:', error)
    showErrorMessage('Erreur lors du transfert')
  } finally {
    showTransferConfirm.value = false
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

    showSuccessMessage('Produit modifié !')
    closeEditModal()
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur modification:', error)
    showErrorMessage('Erreur lors de la modification')
  }
}

const confirmDelete = (product) => {
  deleteData.value = { product }
  showDeleteConfirm.value = true
}

const executeDelete = async () => {
  const { product } = deleteData.value

  try {
    await deleteDoc(doc(db, 'products', product.id))
    showSuccessMessage('Produit supprimé !')
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur suppression:', error)
    showErrorMessage('Erreur lors de la suppression')
  } finally {
    showDeleteConfirm.value = false
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
    showErrorMessage('Valeurs invalides')
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

    selectedProduct.value.stockReserve = newReserve
    selectedProduct.value.stockFrigo = newFridge

    showReassort.value = false
    showSuccessMessage('Réassort appliqué !')
    await productsStore.fetchProducts()
  } catch (e) {
    console.error('Erreur réassort:', e)
    showErrorMessage('Erreur lors du réassort')
  }
}

const openAdjustFridge = (product) => {
  fridgeProduct.value = product
  newFridgeValue.value = product.stockFrigo || 0
  showAdjustFridge.value = true
}

const applyAdjustFridge = async () => {
  if (!fridgeProduct.value) return

  const value = Number(newFridgeValue.value) || 0
  if (value < 0) {
    showErrorMessage('Le stock ne peut pas être négatif')
    return
  }

  try {
    const refDoc = doc(db, 'products', fridgeProduct.value.id)
    await updateDoc(refDoc, { stockFrigo: value })

    fridgeProduct.value.stockFrigo = value

    showAdjustFridge.value = false
    showSuccessMessage('Stock frigo ajusté !')
    await productsStore.fetchProducts()
  } catch (e) {
    console.error('Erreur ajustement frigo:', e)
    showErrorMessage('Erreur lors de l\'ajustement')
  }
}

// Générer liste de courses
const generateShoppingList = () => {
  if (emptyReserveProducts.value.length === 0) {
    showErrorMessage('Aucun produit à commander')
    return
  }

  let shoppingList = '📋 LISTE DE COURSES - CopperSnack\n'
  shoppingList += '================================\n\n'
  
  emptyReserveProducts.value.forEach((product, index) => {
    shoppingList += `${index + 1}. ${product.name}\n`
    shoppingList += `   Catégorie: ${product.category === 'boissons' ? '🥤 Boisson' : '🍫 Snack'}\n`
    shoppingList += `   Stock: Réserve ${product.stockReserve || 0} | Frigo ${product.stockFrigo || 0}\n`
    shoppingList += `   Quantité suggérée: 20 unités\n\n`
  })
  
  shoppingList += `\n📊 Total: ${emptyReserveProducts.value.length} produits`

  navigator.clipboard.writeText(shoppingList).then(() => {
    showSuccessMessage('Liste de courses copiée dans le presse-papier !')
  }).catch(() => {
    alert(shoppingList)
  })
}
// ✨ GESTION PROMOTIONS

const createPromotion = (product) => {
  selectedProductForPromo.value = product
  editPromotionMode.value = false
  showPromotionModal.value = true
}

const editPromotion = (product) => {
  selectedProductForPromo.value = product
  editPromotionMode.value = true
  showPromotionModal.value = true
}

const savePromotion = async ({ productId, promotion }) => {
  try {
    const productRef = doc(db, 'products', productId)
    await updateDoc(productRef, {
      promotion: promotion
    })
    
    // 🆕 Détecter le type d'action
    if (promotion.active === false) {
      showSuccessMessage('✅ Promotion supprimée avec succès')
    } else if (editPromotionMode.value) {
      showSuccessMessage('✅ Promotion modifiée avec succès')
    } else {
      showSuccessMessage('✅ Promotion créée avec succès')
    }
    
    showPromotionModal.value = false
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur promotion:', error)
    showErrorMessage('Erreur lors de la sauvegarde')
  }
}

const disablePromotion = async (product) => {
  if (!confirm(`Désactiver la promotion sur ${product.name} ?`)) return
  
  try {
    const productRef = doc(db, 'products', product.id)
    await updateDoc(productRef, {
      'promotion.active': false
    })
    
    showSuccessMessage('✅ Promotion désactivée')
    await productsStore.fetchProducts()
  } catch (error) {
    console.error('Erreur:', error)
    showErrorMessage('Erreur')
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
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