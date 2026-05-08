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

type BodyLog = { body_fat_pct: number; logged_at: string }

type Period = '7j' | '30j' | '3m'

const PERIODS: { label: string; value: Period; days: number }[] = [
  { label: '7 jours', value: '7j', days: 7 },
  { label: '30 jours', value: '30j', days: 30 },
  { label: '3 mois', value: '3m', days: 90 },
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
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
      <p className="font-bold text-foreground">{payload[0].value}% MG</p>
    </div>
  )
}

interface Props {
  logs: BodyLog[]
}

export function BodyFatChart({ logs }: Props) {
  const [period, setPeriod] = useState<Period>('30j')

  const filtered = useMemo(() => {
    const days = PERIODS.find(p => p.value === period)!.days
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    cutoff.setHours(0, 0, 0, 0)
    return [...logs]
      .sort((a, b) => a.logged_at.localeCompare(b.logged_at))
      .filter(l => new Date(l.logged_at + 'T00:00:00') >= cutoff)
  }, [logs, period])

  const data = filtered.map(l => ({
    date: l.logged_at,
    bf: Number(l.body_fat_pct),
  }))

  const latest = data.length ? data[data.length - 1].bf : null
  const first = data.length ? data[0].bf : null
  const delta = latest !== null && first !== null && data.length > 1
    ? +(latest - first).toFixed(1)
    : null
  const deltaStr = delta === null ? null : delta > 0 ? `+${delta}` : String(delta)
  const deltaColor = delta === null ? '' : delta <= 0 ? 'text-primary' : 'text-[#fe9400]'

  const values = data.map(d => d.bf)
  const minV = values.length ? Math.min(...values) : 5
  const maxV = values.length ? Math.max(...values) : 40
  const yDomain = [Math.max(0, +(minV - 1).toFixed(1)), +(maxV + 1).toFixed(1)]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          {latest !== null && (
            <p className="metric text-heading-lg text-foreground">{latest}%</p>
          )}
          {deltaStr !== null && (
            <p className={`text-xs font-semibold mt-0.5 ${deltaColor}`}>
              {deltaStr}% sur la période
            </p>
          )}
        </div>

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
              tickFormatter={formatDate}
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
              dataKey="bf"
              stroke="#fe9400"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#fe9400', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
