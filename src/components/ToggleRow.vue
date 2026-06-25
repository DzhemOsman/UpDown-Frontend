<script setup>
import ToggleSwitch from './ToggleSwitch.vue'
import HelpIcon from './HelpIcon.vue'

const model = defineModel({ type: Boolean })

defineProps({
  label: { type: String, required: true },
  tooltip: { type: String, default: '' },
  size: { type: String, default: 'sm' }
})
</script>

<template>
  <div class="flex justify-between items-center">
    <span>{{ label }}</span>
    <div class="flex items-center gap-2">
      <ToggleSwitch :size="size" v-model="model" />
      <HelpIcon v-if="tooltip" :text="tooltip" />
    </div>
  </div>
</template>