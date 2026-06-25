<script setup>
import { ref, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'

const props = defineProps({
  trades: { type: Array, required: true, default: () => [] },
  activeStrategies: { type: Array, default: () => [] }
})

const filters = ref({
  global: { value: null, matchMode: 'contains' },
  ticker: { value: null, matchMode: 'equals' },
  exit_reason: { value: null, matchMode: 'equals' },
  strategy: { value: null, matchMode: 'equals' } // Wird nur genutzt, wenn Comparison an ist
})

const uniqueTickers = computed(() => [...new Set(props.trades.map(t => t.ticker))].sort())
const uniqueReasons = computed(() => [...new Set(props.trades.map(t => t.exit_reason))].sort())
</script>

<template>
  <div class="bg-slate-300 p-6 rounded-3xl shadow-lg w-full">

    <DataTable
      :value="trades"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[10, 25, 50, 100]"
      v-model:filters="filters"
      :globalFilterFields="['ticker', 'exit_reason', 'strategy']"
      stripedRows
      class="rounded-xl overflow-hidden"
    >
<template #header>
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 p-5 bg-slate-800 border-b border-slate-700">

          <div class="flex flex-wrap gap-3 w-full md:w-auto">
            <select v-model="filters['ticker'].value" class="px-3 py-1.5 min-w-[130px] border border-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 text-sm font-medium text-slate-800 cursor-pointer">
              <option :value="null">Alle Ticker</option>
              <option v-for="t in uniqueTickers" :key="t" :value="t">{{ t }}</option>
            </select>

            <select v-model="filters['exit_reason'].value" class="px-3 py-1.5 min-w-[130px] border border-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 text-sm font-medium text-slate-800 cursor-pointer">
              <option :value="null">Alle Gründe</option>
              <option v-for="r in uniqueReasons" :key="r" :value="r">{{ r }}</option>
            </select>

            <select v-if="activeStrategies.length > 1" v-model="filters['strategy'].value" class="px-3 py-1.5 min-w-[130px] border border-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 text-sm font-medium text-slate-800 cursor-pointer">
              <option :value="null">Alle Strategien</option>
              <option v-for="s in activeStrategies" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <InputText
            v-model="filters['global'].value"
            placeholder="Suchen..."
            class="px-4 py-1.5 w-full md:w-60 border border-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-100 text-slate-800 placeholder-slate-500 text-sm font-medium"
          />
        </div>
      </template>

      <Column field="ticker" header="Ticker" sortable></Column>
      <Column field="buy_date" header="Einstieg" sortable></Column>
      <Column field="entry_price" header="Preis (In)" sortable>
        <template #body="slotProps">${{ slotProps.data.entry_price.toFixed(2) }}</template>
      </Column>
      <Column field="sell_date" header="Ausstieg" sortable></Column>
      <Column field="exit_price" header="Preis (Out)" sortable>
        <template #body="slotProps">${{ slotProps.data.exit_price.toFixed(2) }}</template>
      </Column>

      <Column field="exit_reason" header="Grund" sortable>
        <template #body="slotProps">
          <span
            class="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
            :class="{
              'bg-emerald-200 text-emerald-800': slotProps.data.exit_reason === 'Take Profit',
              'bg-red-200 text-red-800': slotProps.data.exit_reason === 'Stop Loss',
              'bg-slate-200 text-slate-800': slotProps.data.exit_reason === 'Time Stop'
            }"
          >
            {{ slotProps.data.exit_reason }}
          </span>
        </template>
      </Column>

      <Column field="profit_abs" header="Gewinn ($)" sortable>
        <template #body="slotProps">
          <span :class="slotProps.data.profit_abs >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'">
            ${{ slotProps.data.profit_abs }}
          </span>
        </template>
      </Column>

      <Column v-if="activeStrategies.length > 1" field="strategy" header="Strategie" sortable>
        <template #body="slotProps">
          <span class="px-2 py-1 bg-slate-800 text-slate-100 rounded text-xs font-bold">{{ slotProps.data.strategy }}</span>
        </template>
      </Column>

      <template #empty> Keine Trades gefunden. </template>
    </DataTable>
  </div>
</template>

<style scoped>
:deep(.p-datatable .p-datatable-thead > tr > th) {
  white-space: nowrap;
  padding: 1rem;
  background-color: #1e293b !important;
  color: #f8fafc !important;
  border-bottom: 1px solid #334155 !important;
}

:deep(.p-datatable .p-datatable-thead > tr > th.p-sortable-column:hover),
:deep(.p-datatable .p-datatable-thead > tr > th.p-highlight) {
  background-color: #334155 !important; /* Tailwind bg-slate-700 */
  color: #f8fafc !important;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
  background-color: #0f172a !important; /* Tailwind bg-slate-900 */
  color: #e2e8f0 !important; /* Tailwind text-slate-200 */
  border-bottom: 1px solid #1e293b !important; /* Tailwind border-slate-800 */
}

:deep(.p-datatable.p-datatable-striped .p-datatable-tbody > tr:nth-child(even) > td) {
  background-color: #1e293b !important; /* Tailwind bg-slate-800 */
}
</style>