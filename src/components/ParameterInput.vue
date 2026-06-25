<script setup>
import HelpIcon from './HelpIcon.vue'

const value = defineModel({ type: [Number, String] })
const maxValue = defineModel('max', { type: [Number, String] })

defineProps({
  label: { type: String, required: true },
  tooltip: { type: String, default: '' },
  range: { type: Boolean, default: false }, // true => Min-Max statt Einzelwert
  step: { type: String, default: null }
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <label class="flex items-center gap-2 text-sm">
      {{ label }}
      <HelpIcon v-if="tooltip" :text="tooltip" size="sm" />
    </label>

    <!-- Keine text-Farbe: erbt vom Container (hell auf Karte, dunkel in Advanced-Box) -->
    <input
      v-if="!range"
      v-model="value" type="number" :step="step"
      class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none"
    />
    <div v-else class="flex items-center gap-2">
      <input
        v-model="value" type="number" :step="step"
        class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"
      />
      <span>-</span>
      <input
        v-model="maxValue" type="number" :step="step"
        class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"
      />
    </div>
  </div>
</template>