<script setup>
import { ref, shallowRef, computed } from 'vue'
import { runBacktest, formatBacktestError } from './services/backtest'

import StrategyForm from './components/StrategyForm.vue'
import EquityChart from './components/EquityChart.vue'
import TradeTable from './components/TradeTable.vue'
import ChevronIcon from './components/ChevronIcon.vue'
import MetricCard from './components/MetricCard.vue'


const loading = ref(false)
const errorMsg = ref(null)
const backtestResult = shallowRef(null)
const isHistoryOpen = ref(false)

const singleMetricCards = computed(() => {
  const m = backtestResult.value?.strategy_metrics?.[0]
  if (!m) return []
  return [
    {label: 'Gesamtgewinn', value: m.total_profit, prefix: '$'},
    {label: 'ROI', value: m.roi_pct, suffix: '%', signed: true},
    {label: 'Win Rate', value: m.win_rate, suffix: '%'},
    {label: 'Anzahl Trades', value: m.total_number_of_trades}
  ]
})

const handleStrategySubmit = async (formData) => {
  loading.value = true
  errorMsg.value = null
  backtestResult.value = null
  isHistoryOpen.value = false

  try {
    backtestResult.value = await runBacktest(formData)
  } catch (err) {
    errorMsg.value = formatBacktestError(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 text-white p-4 md:p-8 font-sans">

    <header class="max-w-7xl mx-auto mb-8">
      <h1 class="text-3xl font-extrabold tracking-tight text-slate-100">
        Quantitative Strategy Optimizer
      </h1>
      <p class="text-slate-400 mt-1 text-sm">
        Mean-Reversion Backtesting Engine v2
      </p>
    </header>

    <main class="max-w-7xl mx-auto flex flex-col gap-8">

      <StrategyForm @submit-strategy="handleStrategySubmit"/>

      <div v-if="loading"
           class="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p class="text-slate-300 font-medium animate-pulse">Simuliere Strategie(n) im Backend...</p>
      </div>

      <div v-if="errorMsg" class="p-6 bg-red-950/50 border border-red-500/50 rounded-3xl text-red-200">
        <p class="text-sm text-red-300/90">{{ errorMsg }}</p>
      </div>

      <div v-if="backtestResult"
           class="p-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-xl flex flex-col gap-6">

        <div v-if="!backtestResult.is_comparison" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
              v-for="card in singleMetricCards" :key="card.label"
              :label="card.label" :value="card.value"
              :prefix="card.prefix" :suffix="card.suffix" :signed="card.signed"
          />
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
              v-for="metric in backtestResult.strategy_metrics" :key="metric.name"
              :label="`${metric.name} (ROI)`" :value="metric.roi_pct" suffix="%" :signed="true"
          />
        </div>

        <EquityChart :chartData="backtestResult.equity_curve_data"
                     :activeStrategies="backtestResult.active_strategies"/>

        <div class="mt-4">
          <button @click="isHistoryOpen = !isHistoryOpen"
                  class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-2xl flex justify-between items-center transition-colors shadow-md">
            <span>Trade Historie ({{ backtestResult.trades.length }} Positionen)</span>
            <ChevronIcon :open="isHistoryOpen" size="w-6 h-6"/>
          </button>

          <div v-show="isHistoryOpen" class="mt-6 transition-all duration-300">
            <TradeTable :trades="backtestResult.trades" :activeStrategies="backtestResult.active_strategies"/>
          </div>
        </div>

      </div>

    </main>

  </div>
</template>

<style>
.p-tooltip .p-tooltip-text {
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
  background-color: #334155 !important;
  color: #f8fafc !important;
  border-radius: 0.5rem !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.p-tooltip.p-tooltip-top .p-tooltip-arrow {
  border-top-color: #334155 !important;
}
</style>