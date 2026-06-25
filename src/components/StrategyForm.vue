<script setup>
import { reactive, ref, watch, computed } from 'vue'

const emit = defineEmits(['submit-strategy'])

const formState = reactive({
  tickers: '',
  optimizerMode: false,
  comparisonMode: true,
  startYear: 2021,
  endYear: 2025,
  initialCapital: 10000,
  feePct: 0.1,

  useOldReversion: false,
  kadane: false,
  sma: false,
  fullGridSearch: false,

  dropThreshold: 5,
  dropThresholdMax: 10,
  holdDays: 5,
  holdDaysMax: 10,
  takeProfit: 3,
  takeProfitMax: 6,
  stopLoss: 10,
  stopLossMax: 20,
  maxPositions: 2,
  maxPositionsMax: 5,
  allocation: 100,
  allocationMax: 100,

  lightGbm: false,
  tft: false
})

const isAdvancedOpen = ref(false)
const isMLOpen = ref(false)

const isAdvancedDisabled = computed(() => {
  if (formState.comparisonMode) {
    return formState.useOldReversion && !formState.kadane && !formState.sma
  }
  return formState.useOldReversion
})

watch(isAdvancedDisabled, (disabled) => {
  if (disabled) {
    isAdvancedOpen.value = false
    isMLOpen.value = false
  }
})

watch(() => formState.comparisonMode, (isComp) => {
  if (!isComp) {
    if (formState.kadane) {
      formState.sma = false
      formState.useOldReversion = false
    } else if (formState.sma) {
      formState.useOldReversion = false
    }
  }
})

watch(() => formState.useOldReversion, (val) => {
  if (val && !formState.comparisonMode) {
    formState.kadane = false
    formState.sma = false
  }
})
watch(() => formState.kadane, (val) => {
  if (val && !formState.comparisonMode) {
    formState.sma = false
    formState.useOldReversion = false
  }
})
watch(() => formState.sma, (val) => {
  if (val && !formState.comparisonMode) {
    formState.kadane = false
    formState.useOldReversion = false
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
  const payload = { ...formState }

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
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="formState.optimizerMode" class="sr-only peer" />
          <div class="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
        </label>
        <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Aktiviert die Range-Eingabe damit man seine Strategie optimieren kann, um die besten Parameter zu finden.'">?</span>
      </div>

      <div class="flex items-center gap-3">
        <span>Comparison mode</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" v-model="formState.comparisonMode" class="sr-only peer" />
          <div class="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
        </label>
        <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Erlaubt den parallelen Test mehrerer Strategien gleichzeitig.'">?</span>
      </div>
    </div>

    <h2 class="text-2xl font-black mb-6">Configuration</h2>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-500/50">

      <div class="flex flex-col gap-5 pr-4">
        <h3 class="font-bold">General</h3>

        <div>
          <label class="flex items-center gap-2 text-sm mb-2">
            Time period
            <span class="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] cursor-help" v-tooltip.top="'Geben Sie Start- und Endjahr an.'">?</span>
          </label>
          <div class="flex items-center gap-2">
            <input v-model="formState.startYear" type="number" class="w-20 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            <span class="text-slate-600">-</span>
            <input v-model="formState.endYear" type="number" class="w-20 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
          </div>
        </div>

        <div class="flex gap-3">
          <div class="flex-1">
            <label class="flex items-center gap-2 text-sm mb-2">Kapital ($)</label>
            <input v-model="formState.initialCapital" type="number" class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none" />
          </div>
          <div class="w-24">
            <label class="flex items-center gap-2 text-sm mb-2">Fee (%)</label>
            <input v-model="formState.feePct" type="number" step="0.01" class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none" />
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2 text-sm mb-2">
            Use Old Reversion
            <span class="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] cursor-help" v-tooltip.top="'Nutzt den alten Mean-Reversion Algorithmus aus PM II ohne Money Management.'">?</span>
          </label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="formState.useOldReversion" class="sr-only peer" />
            <div class="w-11 h-6 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-400"></div>
          </label>
        </div>

        <div class="bg-slate-500/70 p-4 rounded-2xl flex flex-col gap-4 mt-2 text-sm font-medium text-slate-100 shadow-sm">
          <div class="flex justify-between items-center">
            <span>Kadane?</span>
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formState.kadane" class="sr-only peer" />
                <div class="w-10 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Soll die minimale Abschnittssuche verwendet werden um den besten Einstiegs- und Ausstiegspunkt zu finden'">?</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span>SMA?</span>
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formState.sma" class="sr-only peer" />
                <div class="w-10 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Soll ein gleitender Durchschnitt verwendet werden um Trends zu erkennen und danach zu handeln'">?</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span>Full Grid Search?</span>
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formState.fullGridSearch" class="sr-only peer" />
                <div class="w-10 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Wenn diese Option deaktiviert ist, werden bis zu 100 Parameterkombinationen zufällig ausgewählt und getestet. Bei Aktivierung werden alle Kombinationen ausprobiert.'">?</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-6 px-4">
        <h3 class="font-bold">Standard</h3>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm">
            Drop Threshold
            <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Der prozentuale Kursrückgang, ab dem die Strategie eine Aktie als überverkauft einstuft und ein Kaufsignal auslöst. Bei einem Drop Threshold von 5 % wird gekauft, sobald der Kurs über die Lookback-Periode (letzte 3 Tage) um mindestens 5 % gefallen ist.'">?</span>
          </label>
          <div v-if="!formState.optimizerMode">
            <input v-model="formState.dropThreshold" type="number" class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none" />
          </div>
          <div v-else class="flex items-center gap-2">
            <input v-model="formState.dropThreshold" type="number" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            <span class="text-slate-600">-</span>
            <input v-model="formState.dropThresholdMax" type="number" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm">
            Holding Period (Days)
            <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Maximale Anzahl an Tagen, die eine Aktie gehalten wird, bevor sie verkauft wird.'">?</span>
          </label>
          <div v-if="!formState.optimizerMode">
            <input v-model="formState.holdDays" type="number" class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none" />
          </div>
          <div v-else class="flex items-center gap-2">
            <input v-model="formState.holdDays" type="number" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            <span class="text-slate-600">-</span>
            <input v-model="formState.holdDaysMax" type="number" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="flex items-center gap-2 text-sm">
            Take Profit Target (%)
            <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Der prozentuale Gewinn, bei dem eine Aktie verkauft wird, um Gewinne zu realisieren.'">?</span>
          </label>
          <div v-if="!formState.optimizerMode">
            <input v-model="formState.takeProfit" type="number" step="0.1" class="w-full bg-slate-500/20 px-4 py-2 rounded-full border-none focus:outline-none" />
          </div>
          <div v-else class="flex items-center gap-2">
            <input v-model="formState.takeProfit" type="number" step="0.1" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            <span class="text-slate-600">-</span>
            <input v-model="formState.takeProfitMax" type="number" step="0.1" class="w-1/2 bg-slate-500/20 px-3 py-2 rounded-full border-none focus:outline-none text-center" />
          </div>
        </div>
      </div>

      <div :class="{'opacity-50 pointer-events-none grayscale transition-all': isAdvancedDisabled}" class="flex flex-col gap-4 px-4">
        <h3 @click="!isAdvancedDisabled && (isAdvancedOpen = !isAdvancedOpen)" class="font-bold flex items-center gap-2 cursor-pointer select-none hover:text-slate-700 transition-colors">
          <svg :class="{'rotate-180': isAdvancedOpen}" class="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          Advanced
        </h3>

        <div v-show="isAdvancedOpen" class="bg-slate-500/70 p-5 rounded-2xl flex flex-col gap-5 text-slate-100 font-medium shadow-sm">
          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm">
              Stop-Loss Threshold
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Der prozentuale Verlust, bei dem eine Aktie verkauft wird, um Verluste zu begrenzen.'">?</span>
            </label>
            <div v-if="!formState.optimizerMode">
              <input v-model="formState.stopLoss" type="number" class="w-full bg-slate-500/20 text-white px-4 py-2 rounded-full border-none focus:outline-none" />
            </div>
            <div v-else class="flex items-center gap-2">
              <input v-model="formState.stopLoss" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
              <span class="text-slate-400">-</span>
              <input v-model="formState.stopLossMax" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm">
              Max. positions
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Die maximale Anzahl an Positionen, die gleichzeitig gehalten werden können.'">?</span>
            </label>
            <div v-if="!formState.optimizerMode">
              <input v-model="formState.maxPositions" type="number" class="w-full bg-slate-500/20 text-white px-4 py-2 rounded-full border-none focus:outline-none" />
            </div>
            <div v-else class="flex items-center gap-2">
              <input v-model="formState.maxPositions" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
              <span class="text-slate-400">-</span>
              <input v-model="formState.maxPositionsMax" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="flex items-center gap-2 text-sm">
              Allocation options
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Die maximale Anteil einer Position am Portfolio'">?</span>
            </label>
            <div v-if="!formState.optimizerMode">
              <input v-model="formState.allocation" type="number" class="w-full bg-slate-500/20 text-white px-4 py-2 rounded-full border-none focus:outline-none" />
            </div>
            <div v-else class="flex items-center gap-2">
              <input v-model="formState.allocation" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
              <span class="text-slate-400">-</span>
              <input v-model="formState.allocationMax" type="number" class="w-1/2 bg-slate-500/20 text-white px-3 py-2 rounded-full border-none focus:outline-none text-center" />
            </div>
          </div>
        </div>
      </div>

      <div :class="{'opacity-50 pointer-events-none grayscale transition-all': isAdvancedDisabled}" class="flex flex-col gap-4 pl-4">
        <h3 @click="!isAdvancedDisabled && (isMLOpen = !isMLOpen)" class="font-bold flex items-center gap-2 cursor-pointer select-none hover:text-slate-700 transition-colors">
          <svg :class="{'rotate-180': isMLOpen}" class="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          Machine Learning
        </h3>

        <div v-show="isMLOpen" class="bg-slate-500/70 p-5 rounded-2xl flex flex-col gap-6 text-slate-100 text-sm font-medium shadow-sm">
          <div class="flex justify-between items-center">
            <span>LightGBM (Binary Tree)</span>
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formState.lightGbm" class="sr-only peer" />
                <div class="w-10 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Ein Gradient-Boosting-Verfahren, das viele kleine Entscheidungsbäume nacheinander aufbaut und kombiniert, um aus tabellarischen Features (z. B. RSI, Volatilität, Returns) eine Vorhersage zu treffen.'">?</span>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span>Temporal Fusion Transformer</span>
            <div class="flex items-center gap-2">
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="formState.tft" class="sr-only peer" />
                <div class="w-10 h-5 bg-slate-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400"></div>
              </label>
              <span class="w-5 h-5 rounded-full border border-slate-700 text-slate-700 flex items-center justify-center text-xs cursor-help" v-tooltip.top="'Ein neuronales Netz speziell für Zeitreihen, das über Attention-Mechanismen lernt, welche vergangenen Zeitpunkte und welche Eingangsvariablen für die Vorhersage am wichtigsten sind.'">?</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>