<script setup>
import { ref, shallowRef } from 'vue'
import StrategyForm from './components/StrategyForm.vue'
import EquityChart from './components/EquityChart.vue'
import TradeTable from './components/TradeTable.vue'
import api from './services/api'

const loading = ref(false)
const errorMsg = ref(null)
const backtestResult = shallowRef(null)
const isHistoryOpen = ref(false)

const handleStrategySubmit = async (formData) => {
  loading.value = true
  errorMsg.value = null
  backtestResult.value = null
  isHistoryOpen.value = false

  try {
    const tickerArray = formData.tickers.split(',').map(t => t.trim().toUpperCase()).filter(t => t)
    const startDate = `${formData.startYear}-01-01T00:00:00`
    const endDate = `${formData.endYear}-12-31T23:59:59`

    const basePayload = {
      tickers: tickerArray,
      start_date: startDate,
      end_date: endDate,
      initial_capital: Number(formData.initialCapital),
      fee_pct: Number(formData.feePct) / 100,
    }

    const strategiesToRun = []

    if (formData.comparisonMode) {
      if (formData.useOldReversion) strategiesToRun.push({ name: 'Old Reversion', isOld: true })
      if (formData.kadane) strategiesToRun.push({ name: 'Kadane', is_kadane: true, is_trend: false })
      if (formData.sma) strategiesToRun.push({ name: 'SMA', is_kadane: false, is_trend: true })
      if (!formData.useOldReversion && !formData.kadane && !formData.sma) {
         strategiesToRun.push({ name: 'Standard MM', is_kadane: false, is_trend: false })
      }
    } else {
      let name = 'Standard MM'
      if (formData.useOldReversion) name = 'Old Reversion'
      else if (formData.kadane) name = 'Kadane'
      else if (formData.sma) name = 'SMA'
      strategiesToRun.push({ name, isOld: formData.useOldReversion, is_kadane: formData.kadane, is_trend: formData.sma })
    }

    const promises = strategiesToRun.map(strat => {
      let payload = { ...basePayload }

      if (formData.optimizerMode) {
        payload.drop_options = formData.dropOptions
        payload.hold_options = formData.holdOptions
        payload.take_profit_options = formData.takeProfitOptions

        if (strat.isOld) {
          return api.runOptimizer(payload).then(res => ({ stratName: strat.name, data: res }))
        } else {
          payload.stop_loss = formData.stopLossOptions
          payload.max_positions = formData.maxPositionsOptions
          payload.allocation_pct = formData.allocationOptions
          payload.is_kadane = strat.is_kadane
          payload.is_trend = strat.is_trend

          if (formData.fullGridSearch) return api.runMoneyManagementGridSearch(payload).then(res => ({ stratName: strat.name, data: res }))
          else {
            payload.n_trials = 100
            return api.runMoneyManagementRandomized(payload).then(res => ({ stratName: strat.name, data: res }))
          }
        }
      } else {
        payload.drop_option = Number(formData.dropThreshold)
        payload.lookback_days = 3
        payload.hold_option = Number(formData.holdDays)
        payload.take_profit_option = Number(formData.takeProfit)

        if (strat.isOld) {
          return api.runMeanReversion(payload).then(res => ({ stratName: strat.name, data: res }))
        } else {
          payload.stop_loss = Number(formData.stopLoss)
          payload.max_positions = Number(formData.maxPositions)
          payload.allocation_pct = Number(formData.allocation)
          payload.is_kadane = strat.is_kadane
          payload.is_trend = strat.is_trend
          return api.runMoneyManagement(payload).then(res => ({ stratName: strat.name, data: res }))
        }
      }
    })

    const results = await Promise.all(promises)

    let aggregatedTrades = []
    let mergedChartDataMap = {}
    let strategyMetrics = []

    results.forEach(res => {
      const name = res.stratName
      const data = res.data

      strategyMetrics.push({
        name: name,
        roi_pct: data.roi_pct.toFixed(2),
        total_profit: data.total_profit.toFixed(2),
        win_rate: data.win_rate.toFixed(2),
        total_number_of_trades: data.total_number_of_trades
      })

      data.trades.forEach(t => {
        aggregatedTrades.push({ ...t, strategy: name })
      })

      data.equity_curve_data.forEach(point => {
        if (!mergedChartDataMap[point.date]) {
          mergedChartDataMap[point.date] = { date: point.date, 'Buy & Hold': point.buy_and_hold }
        }
        mergedChartDataMap[point.date][name] = point.equity
      })
    })

    const finalChartData = Object.values(mergedChartDataMap).sort((a,b) => a.date.localeCompare(b.date))

    backtestResult.value = {
      strategy_metrics: strategyMetrics,
      equity_curve_data: finalChartData,
      trades: aggregatedTrades,
      active_strategies: strategiesToRun.map(s => s.name),
      is_comparison: strategiesToRun.length > 1
    }

  } catch (err) {
    console.error("Vollständiger Fehler:", err)
    if (err.response?.data?.detail) {
      if (Array.isArray(err.response.data.detail)) {
        errorMsg.value = err.response.data.detail.map(e => `'${e.loc.join(' -> ')}': ${e.msg}`).join(' | ')
      } else {
        errorMsg.value = err.response.data.detail
      }
    } else {
      errorMsg.value = err.message + ' (Backend blockiert. Port 8000 & CORS prüfen!)'
    }
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

      <StrategyForm @submit-strategy="handleStrategySubmit" />

      <div v-if="loading" class="flex flex-col items-center justify-center p-12 bg-slate-800 rounded-3xl border border-slate-700 shadow-xl">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
        <p class="text-slate-300 font-medium animate-pulse">Simuliere Strategie(n) im Backend...</p>
      </div>

      <div v-if="errorMsg" class="p-6 bg-red-950/50 border border-red-500/50 rounded-3xl text-red-200">
        <p class="text-sm text-red-300/90">{{ errorMsg }}</p>
      </div>

      <div v-if="backtestResult" class="p-6 bg-slate-800 border border-slate-700 rounded-3xl shadow-xl flex flex-col gap-6">

        <div v-if="!backtestResult.is_comparison" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Gesamtgewinn</div>
            <div class="text-2xl font-black mt-1 text-slate-100">${{ backtestResult.strategy_metrics[0].total_profit }}</div>
          </div>
          <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">ROI</div>
            <div class="text-2xl font-black mt-1" :class="backtestResult.strategy_metrics[0].roi_pct >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ backtestResult.strategy_metrics[0].roi_pct }}%
            </div>
          </div>
          <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Win Rate</div>
            <div class="text-2xl font-black mt-1 text-slate-100">{{ backtestResult.strategy_metrics[0].win_rate }}%</div>
          </div>
          <div class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center">
            <div class="text-xs text-slate-400 font-medium uppercase tracking-wider">Anzahl Trades</div>
            <div class="text-2xl font-black mt-1 text-slate-100">{{ backtestResult.strategy_metrics[0].total_number_of_trades }}</div>
          </div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="metric in backtestResult.strategy_metrics" :key="metric.name" class="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-center shadow-inner">
            <div class="text-xs text-slate-400 font-bold uppercase tracking-wider">{{ metric.name }} (ROI)</div>
            <div class="text-3xl font-black mt-2" :class="metric.roi_pct >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ metric.roi_pct }}%
            </div>
          </div>
        </div>

        <EquityChart :chartData="backtestResult.equity_curve_data" :activeStrategies="backtestResult.active_strategies" />

        <div class="mt-4">
          <button @click="isHistoryOpen = !isHistoryOpen" class="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-6 rounded-2xl flex justify-between items-center transition-colors shadow-md">
            <span>Trade Historie ({{ backtestResult.trades.length }} Positionen)</span>
            <svg :class="{'rotate-180': isHistoryOpen}" class="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          <div v-show="isHistoryOpen" class="mt-6 transition-all duration-300">
            <TradeTable :trades="backtestResult.trades" :activeStrategies="backtestResult.active_strategies" />
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