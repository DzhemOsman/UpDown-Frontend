<script setup>
import { ref, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const props = defineProps({
  chartData: { type: Array, required: true, default: () => [] },
  activeStrategies: { type: Array, default: () => [] }
})

const selectedPeriod = ref('ALL')

const filteredData = computed(() => {
  if (selectedPeriod.value === 'ALL' || props.chartData.length === 0) return props.chartData
  const latestDate = new Date(props.chartData[props.chartData.length - 1].date)

  let cutoff = new Date(latestDate)
  if (selectedPeriod.value === '1M') cutoff.setMonth(latestDate.getMonth() - 1)
  if (selectedPeriod.value === '6M') cutoff.setMonth(latestDate.getMonth() - 6)
  if (selectedPeriod.value === '1Y') cutoff.setFullYear(latestDate.getFullYear() - 1)

  return props.chartData.filter(d => new Date(d.date) >= cutoff)
})

const chartOption = computed(() => {
  const dates = filteredData.value.map(item => item.date)
  const series = []

  const strategiesToDraw = props.activeStrategies.length > 0 ? props.activeStrategies : ['Money Management']
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981']

  // Strategie-Linien zeichnen
  strategiesToDraw.forEach((strategy, index) => {
    const lineData = filteredData.value.map(point => {
      return point[strategy] !== undefined ? point[strategy] : point.equity
    })

    series.push({
      name: strategy,
      type: 'line',
      data: lineData,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 3, color: colors[index % colors.length] },
      itemStyle: { color: colors[index % colors.length] }
    })
  })

  // Buy & Hold Linie zeichnen
  const bnhData = filteredData.value.map(point => {
     return point['Buy & Hold'] !== undefined ? point['Buy & Hold'] : point.buy_and_hold
  })

  series.push({
     name: 'Buy & Hold',
     type: 'line',
     data: bnhData,
     smooth: true,
     symbol: 'none',
     lineStyle: { width: 3, color: '#f97316' },
     itemStyle: { color: '#f97316' }
  })

  return {
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(30, 41, 59, 0.9)', textStyle: { color: '#f8fafc' }, borderWidth: 0, valueFormatter: (val) => '$' + Number(val).toFixed(2) },
    legend: { top: 0, textStyle: { color: '#334155' } },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: dates, axisLine: { lineStyle: { color: '#94a3b8' } } },
    yAxis: { type: 'value', scale: true, splitLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { formatter: '${value}' } },
    series: series
  }
})
</script>

<template>
  <div class="bg-slate-300 p-6 rounded-3xl shadow-lg w-full flex flex-col gap-4">
    <div class="flex flex-col md:flex-row justify-between items-center px-2 gap-4">

      <div class="flex gap-2">
        <select v-model="selectedPeriod" class="bg-slate-400/50 hover:bg-slate-400/80 text-slate-800 text-xs font-bold px-4 py-2 rounded-lg border border-slate-500 focus:outline-none cursor-pointer transition-colors">
          <option value="ALL">All Time</option>
          <option value="1Y">1 Year</option>
          <option value="6M">6 Months</option>
          <option value="1M">1 Month</option>
        </select>

      </div>

      <h2 class="text-xl md:text-2xl font-bold text-slate-800">Strategy vs. Buy & Hold</h2>
      <div class="hidden md:block w-32"></div>
    </div>

    <div class="w-full h-[400px] mt-4">
      <VChart class="w-full h-full" :option="chartOption" autoresize />
    </div>
  </div>
</template>