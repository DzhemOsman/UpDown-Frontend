<script setup>
defineProps({
  text: { type: String, required: true },
  size: {
    type: String,
    default: 'md', // 'md' = w-5 (Standard), 'sm' = w-4 (z.B. inline in Labels)
    validator: (v) => ['md', 'sm'].includes(v)
  }
})

const SIZES = {
  md: 'w-5 h-5 text-xs',
  sm: 'w-4 h-4 text-[10px]'
}
</script>

<template>
  <span
    class="rounded-full border border-slate-700 text-slate-700
           flex items-center justify-center cursor-help"
    :class="SIZES[size]"
    v-tooltip.top="text"
  >?</span>
</template>