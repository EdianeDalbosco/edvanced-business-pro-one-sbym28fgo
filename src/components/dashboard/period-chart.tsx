import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PeriodMetrics {
  paidIncome: number
  paidExpense: number
  prevIncome: number
  prevExpense: number
  incomeTrend: number
  expenseTrend: number
}

export function PeriodChart({ metrics }: { metrics: PeriodMetrics }) {
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'short' })
  const prevMonthName = new Date(
    new Date().getFullYear(),
    new Date().getMonth() - 1,
    1,
  ).toLocaleDateString('pt-BR', { month: 'short' })

  const data = [
    { period: prevMonthName, Receitas: metrics.prevIncome, Despesas: metrics.prevExpense },
    { period: monthName, Receitas: metrics.paidIncome, Despesas: metrics.paidExpense },
  ]

  return (
    <Card className="lg:col-span-2 border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Indicadores do Período</CardTitle>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-sm">
            {metrics.incomeTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
            <span className={metrics.incomeTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.incomeTrend >= 0 ? '+' : ''}
              {metrics.incomeTrend}% receitas
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {metrics.expenseTrend <= 0 ? (
              <TrendingDown className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingUp className="h-4 w-4 text-rose-400" />
            )}
            <span className={metrics.expenseTrend <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {metrics.expenseTrend >= 0 ? '+' : ''}
              {metrics.expenseTrend}% despesas
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ChartContainer
            config={{
              Receitas: { color: 'hsl(141, 70%, 45%)' },
              Despesas: { color: 'hsl(0, 72%, 60%)' },
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#94a3b8' }}
                  tickFormatter={(val) => `R$ ${val / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="Receitas" fill="var(--color-Receitas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="var(--color-Despesas)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
