<script setup>
import ChevronIcon from './ChevronIcon.vue'

const open = defineModel({ type: Boolean })

const props = defineProps({
  title: { type: String, required: true },
  disabled: { type: Boolean, default: false }
})

const toggle = () => {
  if (!props.disabled) open.value = !open.value
}
</script>

<template>
  <div
    class="flex flex-col gap-4"
    :class="{ 'opacity-50 pointer-events-none grayscale transition-all': disabled }"
  >
    <h3
      @click="toggle"
      class="font-bold flex items-center gap-2 cursor-pointer select-none hover:text-slate-700 transition-colors"
    >
      <ChevronIcon :open="open" />
      {{ title }}
    </h3>
    <div
      v-show="open"
      class="bg-slate-500/70 p-5 rounded-2xl flex flex-col gap-5 text-slate-100 text-sm font-medium shadow-sm"
    >
      <slot />
    </div>
  </div>
</template>