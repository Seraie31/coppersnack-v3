<template>
  <div class="member-card" :class="`level-${userLevel}`">
    <!-- Fond holographique animé -->
    <div class="card-background"></div>
    
    <!-- Contenu de la carte -->
    <div class="card-content">
      <!-- Header -->
      <div class="card-header">
        <div class="brand">
          <span class="brand-icon">🔶</span>
          <span class="brand-name">COPPERSNACK</span>
        </div>
        <div class="level-badge">
          <span class="level-icon">{{ levelIcon }}</span>
          <span class="level-text">{{ levelName }}</span>
        </div>
      </div>
      
      <!-- Section principale : Avatar + Info -->
      <div class="card-main">
        <!-- Avatar avec glow pulsant -->
        <div class="avatar-container">
          <div class="avatar-glow">
            <div class="avatar-initials">
              {{ getInitials(userName) }}
            </div>
          </div>
          <div class="level-ring" :class="`ring-${userLevel}`"></div>
          <div class="status-indicator"></div>
        </div>
        
        <!-- Informations utilisateur -->
        <div class="user-info">
          <h2 class="user-name">{{ userName }}</h2>
          <p class="member-id">Membre #{{ formattedMemberId }}</p>
          <p class="member-since">
            <span class="since-icon">📅</span>
            Depuis {{ daysSinceJoined }} jours
          </p>
        </div>
      </div>
      
      <!-- Statistiques principales -->
      <div class="card-stats">
        <div class="stat-item">
          <div class="stat-icon">💰</div>
          <div class="stat-content" :class="balanceColor">
            <div class="stat-value">
              <AnimatedNumber :value="balance" :duration="1000" />
              <span class="stat-currency">€</span>
            </div>
            <div class="stat-label">Solde</div>
          </div>
        </div>
        
        <div class="stat-divider"></div>
        
        <div class="stat-item">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <div class="stat-value">
              <AnimatedNumber :value="totalTransactions" :duration="1200" />
            </div>
            <div class="stat-label">Achats</div>
          </div>
        </div>
        
        <div class="stat-divider"></div>
        
        <div class="stat-item">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-value">
              <AnimatedNumber :value="streak" :duration="1000" />
            </div>
            <div class="stat-label">Jours actifs</div>
          </div>
        </div>
      </div>
      
      <!-- Barre de progression vers niveau suivant -->
      <div class="progress-section">
        <div class="progress-info">
          <span class="progress-label">Progression vers {{ nextLevelName }}</span>
          <span class="progress-percentage">{{ progressPercentage }}%</span>
        </div>
        <div class="progress-bar-container">
          <div 
            class="progress-bar-fill" 
            :style="{ width: `${progressPercentage}%` }"
            :class="`fill-${userLevel}`"
          >
            <div class="progress-shimmer"></div>
            <div class="progress-particles" v-if="progressPercentage > 0">
              <span class="particle" v-for="i in 3" :key="i"></span>
            </div>
          </div>
        </div>
        <div class="progress-details">
          <span class="progress-current">{{ formatCurrency(totalSpent) }}</span>
          <span class="progress-target">{{ formatCurrency(nextLevelThreshold) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AnimatedNumber from '@/components/AnimatedNumber.vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'Utilisateur'
  },
  userEmail: {
    type: String,
    default: ''
  },
  userId: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Object, // Timestamp Firestore
    default: null
  }
})

// Calcul du niveau basé sur les dépenses totales
const LEVEL_THRESHOLDS = {
  bronze: { min: 0, max: 25, name: 'Bronze', icon: '🥉', next: 'Argent' },
  silver: { min: 25, max: 75, name: 'Argent', icon: '🥈', next: 'Or' },
  gold: { min: 75, max: 150, name: 'Or', icon: '🥇', next: 'Copper' },
  copper: { min: 150, max: Infinity, name: 'Copper', icon: '🔶', next: 'Légende' }
}

const userLevel = computed(() => {
  const total = props.totalSpent
  if (total >= 150) return 'copper'
  if (total >= 75) return 'gold'
  if (total >= 25) return 'silver'
  return 'bronze'
})

const levelData = computed(() => LEVEL_THRESHOLDS[userLevel.value])
const levelName = computed(() => levelData.value.name)
const levelIcon = computed(() => levelData.value.icon)
const nextLevelName = computed(() => levelData.value.next)

// Calcul de la progression vers le niveau suivant
const nextLevelThreshold = computed(() => {
  if (userLevel.value === 'bronze') return 25
  if (userLevel.value === 'silver') return 75
  if (userLevel.value === 'gold') return 150
  return 300 // Copper (fictif pour affichage)
})

const progressPercentage = computed(() => {
  const total = props.totalSpent
  const current = userLevel.value
  
  if (current === 'bronze') {
    return Math.min(Math.round((total / 25) * 100), 100)
  } else if (current === 'silver') {
    return Math.min(Math.round(((total - 25) / 50) * 100), 100)
  } else if (current === 'gold') {
    return Math.min(Math.round(((total - 75) / 75) * 100), 100)
  } else {
    return 100 // Copper = max
  }
})

// ID membre formaté
const formattedMemberId = computed(() => {
  // Utilise les 4 derniers caractères de l'UID
  return props.userId.slice(-4).toUpperCase()
})

// Jours depuis inscription
const daysSinceJoined = computed(() => {
  if (!props.createdAt) return 0
  const joinDate = props.createdAt.toDate ? props.createdAt.toDate() : new Date(props.createdAt)
  const now = new Date()
  const diffTime = Math.abs(now - joinDate)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
})

// Utilitaires
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
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount || 0)
}

// Couleur du solde selon le montant
const balanceColor = computed(() => {
  const bal = props.balance
  if (bal >= 10) return 'text-green-400'    // 🟢 Vert : ≥ 10€
  if (bal >= 5) return 'text-yellow-400'    // 🟡 Jaune : 5€ - 9,99€
  if (bal > 0) return 'text-orange-400'     // 🟠 Orange : 0,01€ - 4,99€
  return 'text-red-400'                     // 🔴 Rouge + PULSE : ≤ 0€
})
</script>

<style scoped>
.member-card {
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem;
  border-radius: 20px;
  padding: 2rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.member-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5);
}

/* Couleurs selon niveau */
.member-card.level-bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #8b4513 100%);
}

.member-card.level-silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
}

.member-card.level-gold {
  background: linear-gradient(135deg, #ffd700 0%, #ff8c00 100%);
}

.member-card.level-copper {
  background: linear-gradient(135deg, #ff6b35 0%, #b7410e 100%);
}

/* Effet holographique en arrière-plan */
.card-background {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 70%
  );
  animation: holographic 8s linear infinite;
  pointer-events: none;
}

@keyframes holographic {
  0% { transform: rotate(0deg) translateX(0); }
  100% { transform: rotate(360deg) translateX(0); }
}

.card-content {
  position: relative;
  z-index: 1;
  color: white;
}

/* Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  font-size: 1.1rem;
}

.brand-icon {
  font-size: 1.5rem;
}

.level-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.level-icon {
  font-size: 1.2rem;
}

/* Section principale */
.card-main {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

/* Avatar avec effet pulsant */
.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.avatar-glow {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
  animation: pulse-glow 2.5s ease-in-out infinite;
  position: relative;
  z-index: 2;
}

.avatar-initials {
  font-size: 2rem;
  font-weight: 800;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 40px rgba(255, 255, 255, 0.7);
    transform: scale(1.02);
  }
}

/* Anneau tournant autour de l'avatar */
.level-ring {
  position: absolute;
  top: -6px;
  left: -6px;
  right: -6px;
  bottom: -6px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: rgba(255, 255, 255, 0.6);
  border-right-color: rgba(255, 255, 255, 0.3);
  animation: rotate-ring 3s linear infinite;
  z-index: 1;
}

.level-ring.ring-bronze {
  border-top-color: rgba(205, 127, 50, 0.8);
}

.level-ring.ring-silver {
  border-top-color: rgba(192, 192, 192, 0.9);
}

.level-ring.ring-gold {
  border-top-color: rgba(255, 215, 0, 1);
}

.level-ring.ring-copper {
  border-top-color: rgba(255, 107, 53, 1);
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.6);
}

@keyframes rotate-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Indicateur de statut en ligne */
.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  background: #22c55e;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
  z-index: 3;
}

/* Informations utilisateur */
.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1.6rem;
  font-weight: 800;
  margin: 0 0 0.3rem 0;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
  line-height: 1.2;
}

.member-id {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0.2rem 0;
  font-weight: 600;
  letter-spacing: 1px;
}

.member-since {
  font-size: 0.85rem;
  opacity: 0.85;
  margin: 0.3rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.since-icon {
  font-size: 1rem;
}

/* Statistiques */
.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 16px;
}

.stat-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.stat-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  transition: color 0.3s ease;
}

/* Animation pour solde faible */
.stat-content.text-red-400 .stat-value {
  animation: pulse-warning 1.5s ease-in-out infinite;
  text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
}

@keyframes pulse-warning {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    text-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
    text-shadow: 0 0 20px rgba(248, 113, 113, 0.8);
  }
}

.stat-currency {
  font-size: 1rem;
  font-weight: 600;
  opacity: 0.9;
  color: inherit; /* Hérite la couleur du parent */
}

.stat-label {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 0.2rem;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
}

/* Section progression */
.progress-section {
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.9;
}

.progress-percentage {
  font-size: 0.9rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
}

.progress-bar-container {
  width: 100%;
  height: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.5rem;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.progress-bar-fill {
  height: 100%;
  border-radius: 10px;
  position: relative;
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.progress-bar-fill.fill-bronze {
  background: linear-gradient(90deg, #cd7f32, #d4af37);
}

.progress-bar-fill.fill-silver {
  background: linear-gradient(90deg, #c0c0c0, #e8e8e8);
}

.progress-bar-fill.fill-gold {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
}

.progress-bar-fill.fill-copper {
  background: linear-gradient(90deg, #ff6b35, #ff9068);
  box-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
}

/* Effet shimmer sur la barre */
.progress-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.5),
    transparent
  );
  animation: shimmer 2.5s infinite;
}

@keyframes shimmer {
  to { left: 100%; }
}

/* Particules animées sur la barre */
.progress-particles {
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 100%;
  overflow: visible;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  opacity: 0;
  animation: particle-float 1.5s ease-out infinite;
}

.particle:nth-child(1) {
  animation-delay: 0s;
}

.particle:nth-child(2) {
  animation-delay: 0.5s;
}

.particle:nth-child(3) {
  animation-delay: 1s;
}

@keyframes particle-float {
  0% {
    transform: translate(0, 0);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translate(20px, -20px);
    opacity: 0;
  }
}

.progress-details {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  opacity: 0.8;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 640px) {
  .member-card {
    padding: 1.5rem;
  }

  .card-main {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .user-name {
    font-size: 1.3rem;
  }

  .avatar-glow {
    width: 80px;
    height: 80px;
  }

  .avatar-initials {
    font-size: 1.8rem;
  }

  .card-stats {
    flex-direction: column;
    gap: 0.8rem;
  }

  .stat-divider {
    display: none;
  }

  .stat-item {
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem;
    border-radius: 10px;
  }

  .member-since {
    justify-content: center;
  }
}
</style>
