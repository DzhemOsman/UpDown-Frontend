<script setup>
defineProps({
  open: { type: Boolean, default: false },
  size: { type: String, default: 'w-4 h-4' }
})
</script>

<template>
  <svg
    :class="[size, { 'rotate-180': open }]"
    class="transition-transform duration-300"
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
  </svg>
</template>