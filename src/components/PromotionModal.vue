<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">
          {{ editMode ? '✏️ Modifier' : '🏷️ Créer' }} la promotion
        </h2>
        <button @click="close" class="close-btn">✕</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- Produit sélectionné -->
        <div class="product-preview">
          <div class="preview-image">{{ product?.emoji || '📦' }}</div>
          <div class="preview-info">
            <h3>{{ product?.name }}</h3>
            <p class="preview-price">Prix normal : {{ formatPrice(product?.price) }}</p>
            <p class="preview-stock">Stock actuel : {{ product?.stockFrigo }} unités</p>
          </div>
        </div>

        <!-- Réduction -->
        <div class="form-group">
          <label class="form-label">
            Réduction (%)
            <span class="required">*</span>
          </label>
          <div class="discount-control">
            <input 
              type="range" 
              v-model.number="formData.discount" 
              min="1" 
              max="100"
              class="discount-slider"
            />
            <div class="discount-display">
              <input 
                type="number" 
                v-model.number="formData.discount" 
                min="1" 
                max="100"
                class="discount-input"
              />
              <span class="discount-percent">%</span>
            </div>
          </div>
          <div class="price-preview">
            <span class="old-price">{{ formatPrice(product?.price) }}</span>
            <span class="arrow">→</span>
            <span class="new-price">{{ formatPrice(discountedPrice) }}</span>
            <span class="saved">(Économie : {{ formatPrice(savedAmount) }})</span>
          </div>
        </div>

        <!-- Date de fin -->
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" v-model="useEndDate" class="checkbox" />
            Définir une date de fin
          </label>
          <input 
            v-if="useEndDate"
            type="datetime-local" 
            v-model="formData.endDate"
            :min="minDate"
            class="form-input"
          />
        </div>

        <!-- Limite de stock -->
        <div class="form-group">
          <label class="form-label">
            <input type="checkbox" v-model="useMaxStock" class="checkbox" />
            Limiter le stock en promotion
          </label>
          <input 
            v-if="useMaxStock"
            type="number" 
            v-model.number="formData.maxStock"
            :max="product?.stockFrigo"
            min="1"
            class="form-input"
            placeholder="Nombre d'unités"
          />
          <p v-if="useMaxStock" class="form-hint">
            La promo s'arrêtera quand le stock descendra sous {{ formData.maxStock || 0 }} unités
          </p>
        </div>

        <!-- Raison (optionnel, juste pour l'admin) -->
        <div class="form-group">
          <label class="form-label">Raison (interne)</label>
          <select v-model="formData.reason" class="form-select">
            <option value="">-- Sélectionner --</option>
            <option value="Péremption proche">🍫 Péremption proche</option>
            <option value="Déstockage">📦 Déstockage</option>
            <option value="Happy Hour">🎉 Happy Hour</option>
            <option value="Offre spéciale">🎁 Offre spéciale</option>
            <option value="Fin de saison">❄️ Fin de saison</option>
            <option value="Gratuit">🆓 Gratuit</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <!-- Résumé -->
        <div class="promotion-summary">
          <h4>📋 Résumé de la promotion</h4>
          <ul>
            <li>Réduction : <strong>{{ formData.discount }}%</strong></li>
            <li>Nouveau prix : <strong class="highlight">{{ formatPrice(discountedPrice) }}</strong></li>
            <li v-if="useEndDate && formData.endDate">
              Fin : <strong>{{ formatDateTime(formData.endDate) }}</strong>
            </li>
            <li v-if="useMaxStock && formData.maxStock">
              Stock limité : <strong>{{ formData.maxStock }} unités</strong>
            </li>
            <li v-if="!useEndDate && !useMaxStock">
              Durée : <strong>Jusqu'à désactivation manuelle</strong>
            </li>
          </ul>
        </div>

        <!-- Message d'erreur -->
        <div v-if="error" class="error-message">
          ❌ {{ error }}
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button @click="close" class="btn-secondary">
          Annuler
        </button>
        <button 
          @click="savePromotion" 
          :disabled="!isValid || loading"
          class="btn-primary"
        >
          {{ loading ? '⏳ Enregistrement...' : editMode ? 'Modifier' : 'Créer la promo 🏷️' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  product: {
    type: Object,
    default: null
  },
  editMode: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save'])

const loading = ref(false)
const error = ref('')
const useEndDate = ref(false)
const useMaxStock = ref(false)

const formData = ref({
  discount: 20,
  endDate: '',
  maxStock: null,
  reason: ''
})

// Date minimum (maintenant)
const minDate = computed(() => {
  const now = new Date()
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
  return now.toISOString().slice(0, 16)
})

// Prix après réduction
const discountedPrice = computed(() => {
  if (!props.product) return 0
  const discount = formData.value.discount / 100
  return props.product.price * (1 - discount)
})

// Montant économisé
const savedAmount = computed(() => {
  if (!props.product) return 0
  return props.product.price - discountedPrice.value
})

// Validation
const isValid = computed(() => {
  if (!formData.value.discount || formData.value.discount < 1 || formData.value.discount > 100) {
    return false
  }
  if (useEndDate.value && !formData.value.endDate) {
    return false
  }
  if (useMaxStock.value && (!formData.value.maxStock || formData.value.maxStock < 1)) {
    return false
  }
  return true
})

// Formater le prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price || 0)
}

// Formater date et heure
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Initialiser le formulaire en mode édition
watch(() => props.product, (newProduct) => {
  if (newProduct && props.editMode && newProduct.promotion) {
    const promo = newProduct.promotion
    formData.value.discount = promo.discount || 20
    formData.value.reason = promo.reason || ''
    
    if (promo.endDate) {
      useEndDate.value = true
      const date = promo.endDate.toDate ? promo.endDate.toDate() : new Date(promo.endDate)
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
      formData.value.endDate = date.toISOString().slice(0, 16)
    }
    
    if (promo.maxStock) {
      useMaxStock.value = true
      formData.value.maxStock = promo.maxStock
    }
  }
}, { immediate: true })

// Sauvegarder la promotion
const savePromotion = () => {
  if (!isValid.value) return

  error.value = ''
  loading.value = true

  const promotionData = {
    active: true,
    discount: formData.value.discount,
    reason: formData.value.reason || 'Promotion'
  }

  // Ajouter la date de fin si définie
  if (useEndDate.value && formData.value.endDate) {
    promotionData.endDate = new Date(formData.value.endDate)
  }

  // Ajouter la limite de stock si définie
  if (useMaxStock.value && formData.value.maxStock) {
    promotionData.maxStock = formData.value.maxStock
  }

  emit('save', {
    productId: props.product.id,
    promotion: promotionData
  })

  loading.value = false
}

// Fermer la modale
const close = () => {
  formData.value = {
    discount: 20,
    endDate: '',
    maxStock: null,
    reason: ''
  }
  useEndDate.value = false
  useMaxStock.value = false
  error.value = ''
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #1a1f2e;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  position: relative;
  z-index: 1001;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #2d3748;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.3s;
  padding: 0.5rem;
}

.close-btn:hover {
  color: white;
}

.modal-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Aperçu produit */
.product-preview {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #2d3748;
  border-radius: 12px;
}

.preview-image {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #374151;
  border-radius: 12px;
}

.preview-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.preview-price,
.preview-stock {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0.2rem 0;
}

/* Formulaire */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.required {
  color: #ef4444;
}

.checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-input,
.form-select {
  padding: 0.75rem;
  background: #2d3748;
  border: 2px solid #374151;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #f59e0b;
}

.form-hint {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
}

/* Contrôle de réduction */
.discount-control {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.discount-slider {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #374151;
  outline: none;
  cursor: pointer;
}

.discount-slider::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #f59e0b;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
}

.discount-display {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #2d3748;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 2px solid #f59e0b;
}

.discount-input {
  width: 60px;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  font-weight: 800;
  text-align: right;
}

.discount-input:focus {
  outline: none;
}

.discount-percent {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f59e0b;
}

.price-preview {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.old-price {
  font-size: 1.1rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.arrow {
  font-size: 1.2rem;
  color: #f59e0b;
}

.new-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #f59e0b;
}

.saved {
  font-size: 0.9rem;
  color: #10b981;
  margin-left: auto;
}

/* Résumé */
.promotion-summary {
  background: #2d3748;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid #f59e0b;
}

.promotion-summary h4 {
  margin: 0 0 0.8rem 0;
  color: #f59e0b;
}

.promotion-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.promotion-summary li {
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--dark-300);
}

.promotion-summary li:last-child {
  border-bottom: none;
}

.highlight {
  color: #f59e0b;
}

/* Messages */
.error-message {
  padding: 1rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  border-radius: 8px;
  color: #fca5a5;
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #2d3748;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary {
  background: #374151;
  color: white;
}

.btn-secondary:hover {
  background: #4b5563;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
