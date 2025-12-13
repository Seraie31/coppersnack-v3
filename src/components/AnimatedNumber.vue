<template>
  <span>{{ displayValue }}</span>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    default: 1000
  },
  decimals: {
    type: Number,
    default: 2
  }
})

const displayValue = ref(0)

const animate = (start, end, duration) => {
  const startTime = performance.now()
  const diff = end - start

  const step = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    // Easing function (ease-out)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    
    displayValue.value = (start + diff * easeOut).toFixed(props.decimals)

    if (progress < 1) {
      requestAnimationFrame(step)
    }
  }

  requestAnimationFrame(step)
}

watch(() => props.value, (newValue, oldValue) => {
  animate(oldValue || 0, newValue, props.duration)
})

onMounted(() => {
  animate(0, props.value, props.duration)
})
</script>
