<script setup>
import { watch } from 'vue'
import HelpIcon from './HelpIcon.vue'

const value = defineModel({ type: [Number, String] })
const maxValue = defineModel('max', { type: [Number, String] })

defineProps({
  label: { type: String, required: true },
  tooltip: { type: String, default: '' },
  range: { type: Boolean, default: false }, // true => Min-Max statt Einzelwert
  step: { type: String, default: null }
})

// Negative Eingaben sofort auf 0 klemmen. min="0" allein blockt nur die
// Spinner-Pfeile im Browser - getippte Werte wie "-5" kämen ohne
// <form>-Validierung trotzdem durch. Der Watcher greift bei jeder Änderung,
// egal ob getippt, gepastet oder programmatisch gesetzt.
function clampNonNegative(modelRef) {
  return (newVal) => {
    const num = Number(newVal)
    if (!Number.isNaN(num) && num < 0) {
      modelRef.value = 0
    }
  }
}

watch(value, clampNonNegative(value))
watch(maxValue, clampNonNegative(maxValue))
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
      v-model="value" type="number" :step="step" min="0"
      class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none"
    />
    <div v-else class="flex items-center gap-2">
      <input
        v-model="value" type="number" :step="step" min="0"
        class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"
      />
      <span>-</span>
      <input
        v-model="maxValue" type="number" :step="step" min="0"
        class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"
      />
    </div>
  </div>
</template>