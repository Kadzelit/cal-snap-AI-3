'use client'

import { useState, useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

type WeightRow = { weight_kg: number; logged_at: string }

type Period = '7j' | '30j' | '3m'

const PERIODS: { label: string; value: Period; days: number }[] = [
  { label: '7 jours', value: '7j', days: 7 },
  { label: '30 jours', value: '30j', days: 30 },
  { label: '3 mois', value: '3m', days: 90 },
]

function formatDate(dateStr: string, period: Period) {
  const d = new Date(dateStr + 'T00:00:00')
  if (period === '3m') {
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface CustomTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const d = new Date((label ?? '') + 'T00:00:00')
  const dateStr = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-card text-sm">
      <p className="text-muted-foreground capitalize">{dateStr}</p>
      <p className="font-bold text-foreground">{payload[0].value} kg</p>
    </div>
  )
}

interface Props {
  logs: WeightRow[]
}

export function WeightChart({ logs }: Props) {
  const [period, setPeriod] = useState<Period>('30j')

  const filtered = useMemo(() => {
    const days = PERIODS.find(p => p.value === period)!.days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    cutoff.setHours(0, 0, 0, 0)
    return logs.filter(l => new Date(l.logged_at + 'T00:00:00') >= cutoff)
  }, [logs, period])

  const data = filtered.map(l => ({
    date: l.logged_at,
    label: formatDate(l.logged_at, period),
    weight: Number(l.weight_kg),
  }))

  const hasData = data.length >= 1
  const latest = hasData ? data[data.length - 1].weight : null
  const first = hasData ? data[0].weight : null
  const delta = latest !== null && first !== null ? +(latest - first).toFixed(1) : null
  const deltaStr = delta === null ? null : delta > 0 ? `+${delta}` : String(delta)
  const deltaColor = delta === null ? '' : delta <= 0 ? 'text-primary' : 'text-[#fe9400]'

  const weights = data.map(d => d.weight)
  const minW = weights.length ? Math.min(...weights) : 0
  const maxW = weights.length ? Math.max(...weights) : 100
  const domainPad = 1
  const yDomain = [
    Math.max(0, +(minW - domainPad).toFixed(1)),
    +(maxW + domainPad).toFixed(1),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {latest !== null && (
            <p className="metric text-heading-lg text-foreground">{latest} kg</p>
          )}
          {deltaStr !== null && data.length > 1 && (
            <p className={`text-xs font-semibold mt-0.5 ${deltaColor}`}>
              {deltaStr} kg sur la période
            </p>
          )}
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-background rounded-xl p-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.value
                  ? 'bg-primary-container text-white'
                  : 'text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {data.length < 2 ? (
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-muted-foreground text-center">
            {data.length === 0
              ? 'Aucune donnée sur cette période'
              : 'Ajoute au moins 2 relevés pour voir la courbe'}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="date"
              tickFormatter={d => formatDate(d, period)}
              tick={{ fontSize: 10, fill: '#6c7b6a' }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis domain={yDomain} hide />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={first ?? 0}
              stroke="#e5e2e1"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#00c853"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#00c853', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
