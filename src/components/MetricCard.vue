<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  signed: { type: Boolean, default: false } // true -> grün/rot nach Vorzeichen
})
</script>

<template>
  <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
    <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ label }}</div>
    <div
      class="text-2xl font-black mt-1"
      :class="signed ? (Number(value) >= 0 ? 'text-emerald-400' : 'text-red-400') : 'text-slate-100'"
    >{{ prefix }}{{ value }}{{ suffix }}</div>
  </div>
</template>