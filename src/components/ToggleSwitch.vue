<script setup>
const model = defineModel({ type: Boolean })

defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['md', 'sm'].includes(v)
  }
})

const SIZES = {
  md: { track: 'w-11 h-6', knob: 'after:h-5 after:w-5' },
  sm: { track: 'w-10 h-5', knob: 'after:h-4 after:w-4' }
}
</script>

<template>
  <label class="relative inline-flex items-center cursor-pointer">
    <input type="checkbox" v-model="model" class="sr-only peer" />
    <div
      class="bg-slate-600 rounded-full peer peer-focus:outline-none
             after:content-[''] after:absolute after:top-[2px] after:left-[2px]
             after:bg-slate-300 after:rounded-full after:transition-all
             peer-checked:bg-emerald-400 peer-checked:after:translate-x-full"
      :class="[SIZES[size].track, SIZES[size].knob]"
    ></div>
  </label>
</template>