<template>
  <transition name="fade-zoom">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
    >
      <div class="bg-dark-200 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 class="text-lg font-bold mb-3">
          {{ title }}
        </h2>
        <p class="text-sm text-gray-300 mb-6">
          {{ message }}
        </p>
        <div class="flex justify-end gap-3">
          <button
            class="px-3 py-1 rounded bg-gray-600 hover:bg-gray-500 text-sm"
            @click="$emit('cancel')"
          >
            Annuler
          </button>
          <button
            class="px-3 py-1 rounded bg-primary hover:bg-primary/80 text-sm"
            @click="$emit('confirm')"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmation' },
  message: { type: String, default: '' }
})
</script>

<style scoped>
.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition: all 0.15s ease-out;
}
</style>
