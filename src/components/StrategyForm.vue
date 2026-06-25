<script setup>
import {computed, reactive, ref, watch} from 'vue'

import ToggleSwitch from './ToggleSwitch.vue'
import HelpIcon from './HelpIcon.vue'
import ToggleRow from './ToggleRow.vue'
import CollapsibleSection from './CollapsibleSection.vue'
import ParameterInput from './ParameterInput.vue'

const emit = defineEmits(['submit-strategy'])

const STRATEGY_PRIORITY = ['kadane', 'sma', 'reversion']

const STRATEGY_DESCRIPTORS = {
  reversion: {name: 'Old Reversion', isOld: true, is_kadane: false, is_trend: false},
  kadane: {name: 'Kadane', isOld: false, is_kadane: true, is_trend: false},
  sma: {name: 'SMA', isOld: false, is_kadane: false, is_trend: true}
}

const STANDARD_MM = {name: 'Standard MM', isOld: false, is_kadane: false, is_trend: false}

const resolveStrategies = () => {
  const chosen = Object.keys(STRATEGY_DESCRIPTORS)
      .filter((key) => selectedStrategies.value.includes(key))
      .map((key) => STRATEGY_DESCRIPTORS[key])
  return chosen.length ? chosen : [STANDARD_MM]
}

const formState = reactive({
  tickers: '',
  optimizerMode: false,
  comparisonMode: true,
  startYear: 2021,
  endYear: 2025,
  initialCapital: 10000,
  feePct: 0.1,

  fullGridSearch: false,

  dropThreshold: 5, dropThresholdMax: 10,
  holdDays: 5, holdDaysMax: 10,
  takeProfit: 3, takeProfitMax: 6,
  stopLoss: 10, stopLossMax: 20,
  maxPositions: 2, maxPositionsMax: 5,
  allocation: 100, allocationMax: 100,

  lightGbm: false,
  tft: false
})

const selectedStrategies = ref([])

const isSelected = (name) => selectedStrategies.value.includes(name)

const toggleStrategy = (name) => {
  const current = selectedStrategies.value
  const isOn = current.includes(name)

  if (formState.comparisonMode) {
    selectedStrategies.value = isOn
        ? current.filter((s) => s !== name)
        : [...current, name]
  } else {
    selectedStrategies.value = isOn ? [] : [name]
  }
}

const isAdvancedOpen = ref(false)
const isMLOpen = ref(false)

const isAdvancedDisabled = computed(
    () => isSelected('reversion') && !isSelected('kadane') && !isSelected('sma')
)

watch(isAdvancedDisabled, (disabled) => {
  if (disabled) {
    isAdvancedOpen.value = false
    isMLOpen.value = false
  }
})

watch(() => formState.comparisonMode, (isComparison) => {
  if (!isComparison && selectedStrategies.value.length > 1) {
    const survivor = STRATEGY_PRIORITY.find((s) => selectedStrategies.value.includes(s))
    selectedStrategies.value = survivor ? [survivor] : []
  }
})

const generateRange = (min, max, step = 1) => {
  const result = []
  for (let i = Number(min); i <= Number(max); i += step) {
    result.push(Number(i.toFixed(2)))
  }
  return result
}

const onSubmit = () => {
  const payload = {
    ...formState,
    strategies: resolveStrategies()   // ersetzt useOldReversion / kadane / sma
  }

  if (formState.optimizerMode) {
    payload.dropOptions = generateRange(formState.dropThreshold, formState.dropThresholdMax, 1)
    payload.holdOptions = generateRange(formState.holdDays, formState.holdDaysMax, 1)
    payload.takeProfitOptions = generateRange(formState.takeProfit, formState.takeProfitMax, 0.5)
    payload.stopLossOptions = generateRange(formState.stopLoss, formState.stopLossMax, 1)
    payload.maxPositionsOptions = generateRange(formState.maxPositions, formState.maxPositionsMax, 1)
    payload.allocationOptions = generateRange(formState.allocation, formState.allocationMax, 10)
  }

  emit('submit-strategy', payload)
}
</script>

<template>
  <div class="bg-slate-400 p-8 rounded-[2rem] shadow-xl w-full text-slate-900 font-sans">

    <div class="flex items-center gap-6 mb-6">
      <input
          v-model="formState.tickers"
          type="text"
          placeholder="MSFT, AAPL"
          class="flex-1 bg-slate-500/20 px-6 py-4 rounded-full border-none focus:outline-none focus:ring-2 focus:ring-slate-600 text-lg placeholder-slate-600 font-medium"
      />
      <button
          @click="onSubmit"
          class="bg-white text-black font-extrabold text-lg px-10 py-4 rounded-full hover:bg-slate-100 transition-colors shadow-md tracking-wide"
      >
        START
      </button>
    </div>

    <div class="flex items-center gap-10 mb-8 font-bold text-sm">
      <div class="flex items-center gap-3">
        <span>Optimizer</span>
        <ToggleSwitch v-model="formState.optimizerMode"/>
        <HelpIcon
            text="Aktiviert die Range-Eingabe damit man seine Strategie optimieren kann, um die besten Parameter zu finden."
        />
      </div>

      <div class="flex items-center gap-3">
        <span>Comparison mode</span>
        <ToggleSwitch v-model="formState.comparisonMode"/>
        <HelpIcon
            text="Erlaubt den parallelen Test mehrerer Strategien gleichzeitig."
        />
      </div>
    </div>

    <h2 class="text-2xl font-black mb-6">Configuration</h2>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-500/50">

      <div class="flex flex-col gap-5 pr-4">
        <h3 class="font-bold">General</h3>

        <div>
          <label class="flex items-center gap-2 text-sm mb-2">
            Time period
            <HelpIcon
                text="Geben Sie Start- und Endjahr an."
            />
          </label>
          <div class="flex items-center gap-2">
            <input v-model="formState.startYear" type="number"
                   class="w-20 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"/>
            <span class="text-slate-600">-</span>
            <input v-model="formState.endYear" type="number"
                   class="w-20 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center"/>
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="flex items-center gap-2 text-sm mb-2">Kapital ($)</label>
            <input v-model="formState.initialCapital" type="number"
                   class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none"/>
          </div>
          <div class="w-24">
            <label class="flex items-center gap-2 text-sm mb-2">Fee (%)</label>
            <input v-model="formState.feePct" type="number" step="0.01"
                   class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none"/>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm mb-2">
            Use Old Reversion
            <HelpIcon
                text="Nutzt den alten Mean-Reversion Algorithmus aus PM II ohne Money Management."
            />
          </label>
          <ToggleSwitch :model-value="isSelected('reversion')" @update:model-value="toggleStrategy('reversion')"/>
        </div>

        <div
            class="bg-slate-500/70 p-4 rounded-2xl flex flex-col gap-4 mt-2 text-sm font-medium text-slate-100 shadow-sm">
          <ToggleRow label="Kadane?"
                     tooltip="Soll die minimale Abschnittssuche verwendet werden um den besten Einstiegs- und Ausstiegspunkt zu finden"
                     :model-value="isSelected('kadane')" @update:model-value="toggleStrategy('kadane')"/>
          <ToggleRow label="SMA?"
                     tooltip="Soll ein gleitender Durchschnitt verwendet werden um Trends zu erkennen und danach zu handeln"
                     :model-value="isSelected('sma')" @update:model-value="toggleStrategy('sma')"/>
          <ToggleRow
              label="Full Grid Search?"
              tooltip="Wenn diese Option deaktiviert ist, werden bis zu 100 Parameterkombinationen zufällig ausgewählt und getestet. Bei Aktivierung werden alle Kombinationen ausprobiert."
              v-model="formState.fullGridSearch"
          />
        </div>
      </div>

      <div class="flex flex-col gap-6 px-4">
        <h3 class="font-bold">Standard</h3>

        <ParameterInput
            label="Drop Threshold" :range="formState.optimizerMode"
            v-model="formState.dropThreshold" v-model:max="formState.dropThresholdMax"
            tooltip="Der prozentuale Kursrückgang, ab dem die Strategie eine Aktie als überverkauft einstuft und ein Kaufsignal auslöst. Bei einem Drop Threshold von 5 % wird gekauft, sobald der Kurs über die Lookback-Periode (letzte 3 Tage) um mindestens 5 % gefallen ist."
        />
        <ParameterInput
            label="Holding Period (Days)" :range="formState.optimizerMode"
            v-model="formState.holdDays" v-model:max="formState.holdDaysMax"
            tooltip="Maximale Anzahl an Tagen, die eine Aktie gehalten wird, bevor sie verkauft wird."
        />
        <ParameterInput
            label="Take Profit Target (%)" :range="formState.optimizerMode" step="0.1"
            v-model="formState.takeProfit" v-model:max="formState.takeProfitMax"
            tooltip="Der prozentuale Gewinn, bei dem eine Aktie verkauft wird, um Gewinne zu realisieren."
        />
      </div>

      <div class="px-4">
        <CollapsibleSection title="Advanced" :disabled="isAdvancedDisabled" v-model="isAdvancedOpen">
          <ParameterInput
              label="Stop-Loss Threshold" :range="formState.optimizerMode"
              v-model="formState.stopLoss" v-model:max="formState.stopLossMax"
              tooltip="Der prozentuale Verlust, bei dem eine Aktie verkauft wird, um Verluste zu begrenzen."
          />
          <ParameterInput
              label="Max. positions" :range="formState.optimizerMode"
              v-model="formState.maxPositions" v-model:max="formState.maxPositionsMax"
              tooltip="Die maximale Anzahl an Positionen, die gleichzeitig gehalten werden können."
          />
          <ParameterInput
              label="Allocation options" :range="formState.optimizerMode"
              v-model="formState.allocation" v-model:max="formState.allocationMax"
              tooltip="Die maximale Anteil einer Position am Portfolio"
          />
        </CollapsibleSection>
      </div>
      <div class="pl-4">
        <CollapsibleSection title="Machine Learning" :disabled="isAdvancedDisabled" v-model="isMLOpen">
          <ToggleRow label="LightGBM (Binary Tree)" tooltip="Ein Gradient-Boosting-Verfahren..."
                     v-model="formState.lightGbm"/>
          <ToggleRow label="Temporal Fusion Transformer" tooltip="Ein neuronales Netz speziell für Zeitreihen..."
                     v-model="formState.tft"/>
        </CollapsibleSection>
      </div>
    </div>
  </div>
</template>