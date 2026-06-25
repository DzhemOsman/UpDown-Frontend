import api from './api'

const parseTickers = (raw) =>
  raw.split(',').map((t) => t.trim().toUpperCase()).filter(Boolean)

const buildBasePayload = (formData) => ({
  tickers: parseTickers(formData.tickers),
  start_date: `${formData.startYear}-01-01T00:00:00`,
  end_date: `${formData.endYear}-12-31T23:59:59`,
  initial_capital: Number(formData.initialCapital),
  fee_pct: Number(formData.feePct) / 100
})

const applyReversionParams = (payload, formData) => {
  if (formData.optimizerMode) {
    payload.drop_options = formData.dropOptions
    payload.hold_options = formData.holdOptions
    payload.take_profit_options = formData.takeProfitOptions
  } else {
    payload.drop_option = Number(formData.dropThreshold)
    payload.lookback_days = 3
    payload.hold_option = Number(formData.holdDays)
    payload.take_profit_option = Number(formData.takeProfit)
  }
}

const applyMoneyManagementParams = (payload, formData, strat) => {
  if (formData.optimizerMode) {
    payload.stop_loss = formData.stopLossOptions
    payload.max_positions = formData.maxPositionsOptions
    payload.allocation_pct = formData.allocationOptions
  } else {
    payload.stop_loss = Number(formData.stopLoss)
    payload.max_positions = Number(formData.maxPositions)
    payload.allocation_pct = Number(formData.allocation)
  }
  payload.is_kadane = strat.is_kadane
  payload.is_trend = strat.is_trend
}

const runStrategy = (formData, strat, basePayload) => {
  const payload = { ...basePayload }
  applyReversionParams(payload, formData)

  if (strat.isOld) {
    return formData.optimizerMode ? api.runOptimizer(payload) : api.runMeanReversion(payload)
  }

  applyMoneyManagementParams(payload, formData, strat)

  if (!formData.optimizerMode) return api.runMoneyManagement(payload)
  if (formData.fullGridSearch) return api.runMoneyManagementGridSearch(payload)

  payload.n_trials = 100
  return api.runMoneyManagementRandomized(payload)
}

const aggregateResults = (results) => {
  const strategyMetrics = []
  const aggregatedTrades = []
  const chartByDate = {}

  for (const { stratName, data } of results) {
    strategyMetrics.push({
      name: stratName,
      roi_pct: data.roi_pct.toFixed(2),
      total_profit: data.total_profit.toFixed(2),
      win_rate: data.win_rate.toFixed(2),
      total_number_of_trades: data.total_number_of_trades
    })

    for (const t of data.trades) {
      aggregatedTrades.push({ ...t, strategy: stratName })
    }

    for (const point of data.equity_curve_data) {
      if (!chartByDate[point.date]) {
        chartByDate[point.date] = { date: point.date, 'Buy & Hold': point.buy_and_hold }
      }
      chartByDate[point.date][stratName] = point.equity
    }
  }

  const equityCurveData = Object.values(chartByDate).sort((a, b) => a.date.localeCompare(b.date))
  return { strategyMetrics, aggregatedTrades, equityCurveData }
}

export const runBacktest = async (formData) => {
  const strategiesToRun = formData.strategies
  const basePayload = buildBasePayload(formData)

  const results = await Promise.all(
    strategiesToRun.map((strat) =>
      runStrategy(formData, strat, basePayload).then((data) => ({ stratName: strat.name, data }))
    )
  )

  const { strategyMetrics, aggregatedTrades, equityCurveData } = aggregateResults(results)

  return {
    strategy_metrics: strategyMetrics,
    equity_curve_data: equityCurveData,
    trades: aggregatedTrades,
    active_strategies: strategiesToRun.map((s) => s.name),
    is_comparison: strategiesToRun.length > 1
  }
}

export const formatBacktestError = (err) => {
  console.error('Vollständiger Fehler:', err)
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map((e) => `'${e.loc.join(' -> ')}': ${e.msg}`).join(' | ')
  }
  if (detail) return detail
  return err.message + ' (Backend blockiert. Port 8000 & CORS prüfen!)'
}